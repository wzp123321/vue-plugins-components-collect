import { ref, shallowRef } from 'vue'
import * as THREE from 'three'
import { mapConfig } from '../utils/mapConfig'

/** 拾取结果：命中物可能是数据标记(spot)或行政区顶面(region) */
export interface PickResult {
  /** spot=数据柱/标牌热区，region=行政区顶面 */
  kind: 'spot' | 'region'
  /** 行政区属性（spot 命中时会带上所属区域的属性） */
  properties: Record<string, any> | null
  /** 标记属性（含 value） */
  spot: Record<string, any> | null
  point: THREE.Vector3
}

interface Options {
  camera: () => THREE.PerspectiveCamera | null
  getRoot: () => THREE.Object3D | null
  raycaster: THREE.Raycaster
  pointer: THREE.Vector2
  isBusy: () => boolean
  onHover?: (pick: PickResult | null) => void
  onSelect?: (pick: PickResult | null) => void
  onDrill?: (pick: PickResult) => void
  /** 单击落空（未命中任何可拾取物）时回调，用于"点空白取消选中" */
  onMiss?: () => void
  /** 框选模式：返回 true 时（如按住 Shift）左键拖拽改为框选，而非轨道/选中 */
  boxMode?: () => boolean
  /** 框选开始 / 更新（传相对容器的矩形，null 表示结束清除） / 结束（矩形 + 是否按住 Shift） */
  onBoxStart?: () => void
  onBoxUpdate?: (rect: { x: number; y: number; w: number; h: number } | null) => void
  onBoxEnd?: (rect: { x: number; y: number; w: number; h: number } | null, shiftKey: boolean) => void
  /** 框选时临时禁用轨道控制器，结束恢复 */
  setControlsEnabled?: (enabled: boolean) => void
  /** 测量模式：返回 true 时，单击改为在地面落测量点（而非选中/下钻） */
  measureMode?: () => boolean
  /** 测量落点回调（世界坐标，已落到地面 z=depth 平面） */
  onMeasure?: (world: THREE.Vector3) => void
  /**
   * 右键上下文菜单：contextmenu 事件（未发生右键拖拽时）触发。
   * @param pick 命中结果（可能为 null=点在空白）
   * @param pos  菜单锚点（相对容器的 CSS 像素坐标）
   */
  onContext?: (pick: PickResult | null, pos: { x: number; y: number }) => void
}

/** 拖拽判定阈值：超过这个位移就当成旋转/平移，不触发点击选中 */
const DRAG_THRESHOLD = 6

/**
 * usePointerPick —— 指针交互（悬停高亮 + 单击选中 + 双击下钻）。
 *
 * 文件职责：
 *   把鼠标事件翻译成 three.js 射线拾取结果。旋转/平移/缩放全部交给
 *   OrbitControls，本模块只做"鼠标在哪、命中了什么、该触发 hover/select/drill"。
 *
 * 在整体架构中的角色：
 *   交互层。由地图主组件 attach 到容器；把拾取结果回调给 useMapLevels(下钻)、
 *   useMapLayer(高亮)、useSpotMarkers(选中标牌)。本身不渲染任何几何。
 *
 * 与哪些模块协作：
 *   - useMapViewport：提供 camera / getRoot / raycaster / pointer
 *   - useMapLayer：命中 region 后由外部调用 setHover/setSelected 高亮
 *   - useMapLevels：命中可下钻区域 → 调 drill()
 */
export const usePointerPick = (options: Options) => {
  const hovered = shallowRef<PickResult | null>(null)
  const position = ref({ x: 0, y: 0 })

  let host: HTMLElement | null = null
  let downX = 0
  let downY = 0
  let framePending = false
  let pendingEvent: MouseEvent | null = null
  // 框选状态：仅 Shift 修饰时激活，避免与 OrbitControls 的左键拖拽冲突
  let boxActive = false
  let boxStartX = 0
  let boxStartY = 0
  let boxCurX = 0
  let boxCurY = 0
  /** 矩形过小（<6px）视为单击而非框选，交给单击逻辑处理 */
  const BOX_MIN_SIZE = 6

  // ── 触屏状态（与触摸手势并存：缩放/旋转交给 OrbitControls，这里只补"点选"）──
  let touchStartX = 0
  let touchStartY = 0
  let touchStartTs = 0
  /** 本次触摸是否已判定为手势（拖动 / 多指），是则不触发点选 */
  let touchGesture = false
  /** 上一次单击落点与时间，用于识别双击下钻 */
  let lastTapTs = 0
  let lastTapX = 0
  let lastTapY = 0
  /** 触摸已处理点选后，屏蔽随后的合成 click，避免同一次点按触发两遍选中 */
  let suppressClickUntil = 0

  /**
   * 光标形状：测量模式下固定十字准星，其余按是否命中可交互物给 pointer/default。
   * 单独抽出来是因为测量模式会跳过拾取，光标不能依赖 pick 结果。
   */
  const applyCursor = (pick: PickResult | null) => {
    if (!host) return
    host.style.cursor = options.measureMode?.() ? 'crosshair' : pick ? 'pointer' : 'default'
  }

  /**
   * 在屏幕坐标 (clientX, clientY) 处发射射线，返回最近命中物。
   * 优先匹配数据标记热区(spotHit)，其次行政区顶面(surface)；
   * 二者都靠挂在 mesh.userData.kind 上的标记位识别（见各 utils 的创建逻辑）。
   */
  const pickAt = (clientX: number, clientY: number): PickResult | null => {
    const camera = options.camera()
    const root = options.getRoot()
    if (!camera || !root || !host) return null
    const rect = host.getBoundingClientRect()
    if (!rect.width || !rect.height) return null
    // 屏幕坐标 → 标准化设备坐标 NDC（y 轴翻转，因屏幕原点在左上、NDC 在中心）
    options.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
    options.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
    options.raycaster.setFromCamera(options.pointer, camera)

    // 递归检测 root 所有子节点；命中顺序即场景距离由近及远
    const hits = options.raycaster.intersectObjects(root.children, true)
    const spotHit = hits.find((hit: any) => hit.object.userData?.kind === 'spotHit')
    if (spotHit) {
      return {
        kind: 'spot',
        properties: null,
        spot: (spotHit.object as any).customProperties ?? null,
        point: spotHit.point.clone(),
      }
    }
    const surfaceHit = hits.find((hit: any) => hit.object.userData?.kind === 'surface')
    if (surfaceHit) {
      const region = (surfaceHit.object as any).userData?.region
      return {
        kind: 'region',
        // ⚠️ 注意：返回的是行政区属性（properties），其中 center 为主城区坐标
        //   （见 utils/anchor），切勿在这里用 centroid 当锚点。
        properties: region?.customProperties ?? null,
        spot: null,
        point: surfaceHit.point.clone(),
      }
    }
    return null
  };

  /** 地面（z=depth 平面）求交：测量模式落点用，返回世界坐标 */
  const groundPick = (clientX: number, clientY: number): THREE.Vector3 | null => {
    const camera = options.camera()
    if (!camera || !host) return null
    const rect = host.getBoundingClientRect()
    if (!rect.width || !rect.height) return null
    options.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
    options.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
    options.raycaster.setFromCamera(options.pointer, camera)
    const target = new THREE.Vector3()
    const ground = new THREE.Plane(new THREE.Vector3(0, 0, 1), -mapConfig.depth)
    const hit = options.raycaster.ray.intersectPlane(ground, target)
    return hit ? target : null
  };

  /** 框选矩形（相对容器像素） */
  const boxRect = (): { x: number; y: number; w: number; h: number } => {
    const r = host!.getBoundingClientRect()
    const x1 = Math.min(boxStartX, boxCurX) - r.left
    const y1 = Math.min(boxStartY, boxCurY) - r.top
    const x2 = Math.max(boxStartX, boxCurX) - r.left
    const y2 = Math.max(boxStartY, boxCurY) - r.top
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
  }

  /** 鼠标移动：框选中只更新矩形；否则记录坐标并每帧最多拾取一次 */
  const handleMove = (event: MouseEvent) => {
    if (boxActive) {
      boxCurX = event.clientX
      boxCurY = event.clientY
      options.onBoxUpdate?.(boxRect())
      return
    }
    if (host) {
      const rect = host.getBoundingClientRect()
      // 存相对容器的坐标，tooltip 直接拿去定位
      position.value = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
    pendingEvent = event
    if (framePending) return
    framePending = true
    // 每帧最多拾取一次，鼠标高频移动时不会堆积射线计算
    requestAnimationFrame(() => {
      framePending = false
      const queued = pendingEvent
      pendingEvent = null
      if (!queued || !host) return
      // 测量模式不拾取：十字准星下悬浮高亮与 tooltip 只会干扰落点判断
      if (options.measureMode?.()) {
        if (hovered.value) {
          hovered.value = null
          options.onHover?.(null)
        }
        applyCursor(null)
        return
      }
      const pick = pickAt(queued.clientX, queued.clientY)
      hovered.value = pick
      applyCursor(pick)
      options.onHover?.(pick)
    })
  };

  /** 鼠标离开容器：清空悬停态 */
  const handleLeave = () => {
    hovered.value = null
    applyCursor(null)
    options.onHover?.(null)
  };

  /** 按下时记录起点；若处于框选模式（按住 Shift）则启动框选并禁用轨道 */
  const handleDown = (event: MouseEvent) => {
    downX = event.clientX
    downY = event.clientY
    if (options.boxMode?.() && event.button === 0) {
      boxActive = true
      boxStartX = boxCurX = event.clientX
      boxStartY = boxCurY = event.clientY
      options.setControlsEnabled?.(false)
      options.onBoxStart?.()
    }
  };

  /** 松开：框选结束 —— 极小矩形视作单击（单选），否则交给外部计算批量命中 */
  const handleUp = (event: MouseEvent) => {
    if (!boxActive) return
    boxActive = false
    options.setControlsEnabled?.(true)
    options.onBoxUpdate?.(null)
    const rect = boxRect()
    if (rect.w < BOX_MIN_SIZE && rect.h < BOX_MIN_SIZE) {
      // 没拖动 = 单击：复用单点拾取做单选（与双击下钻区分：单击不钻）
      const pick = pickAt(boxStartX, boxStartY)
      if (pick) options.onSelect?.(pick)
      else options.onMiss?.()
      return
    }
    options.onBoxEnd?.(rect, event.shiftKey)
  };

  /**
   * 单击：框选模式下点击选择由 onBoxEnd 处理（小矩形已转单选），这里直接跳过。
   * 非框选模式：若位移超过 DRAG_THRESHOLD 视为拖拽/旋转，不触发选中。
   * ⚠️ 坑：OrbitControls 的拖拽与点击共用左键，若不做阈值区分，一松手就会
   *   误选中。用按下/抬起两点欧氏距离判断是否"动了手"。
   */
  const handleClick = (event: MouseEvent) => {
    // 触摸点选已处理过本次点按，忽略浏览器随后合成的 click
    if (performance.now() < suppressClickUntil) return
    if (options.boxMode?.()) return
    // 测量模式：单击在地面落测量点，跳过选中/取消选中。
    // 仍要判拖拽阈值：测量时常需要先拖动平移找位置，松手不该误落点。
    if (options.measureMode?.()) {
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > DRAG_THRESHOLD) return
      const world = groundPick(event.clientX, event.clientY)
      if (world) options.onMeasure?.(world)
      return
    }
    if (Math.hypot(event.clientX - downX, event.clientY - downY) > DRAG_THRESHOLD) return
    const pick = pickAt(event.clientX, event.clientY)
    if (pick) options.onSelect?.(pick)
    // 落空（没有命中任何板块 / 标记）→ 通知外部取消选中
    else options.onMiss?.()
  };

  /** 双击：下钻到命中区域（busy 时不响应；框选 / 测量模式下不触发） */
  const handleDoubleClick = (event: MouseEvent) => {
    if (options.boxMode?.() || options.measureMode?.()) return
    if (options.isBusy()) return
    const pick = pickAt(event.clientX, event.clientY)
    if (pick) options.onDrill?.(pick)
  };

  /**
   * 右键：弹出上下文菜单。
   * ⚠️ 坑：右键拖拽 = OrbitControls 旋转，与点击共用右键 —— 和左键单击一样
   *   用按下/抬起距离阈值区分，拖拽旋转松手不弹菜单。
   * ⚠️ 无论如何都 preventDefault：canvas 上的浏览器默认菜单（图片另存为等）
   *   没有意义，且测量/框选模式下也不应弹系统菜单。
   */
  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault()
    if (!host) return
    // 右键拖拽（旋转）不弹菜单；downX/downY 在 mousedown 里记录
    if (Math.hypot(event.clientX - downX, event.clientY - downY) > DRAG_THRESHOLD) return
    const rect = host.getBoundingClientRect()
    const pick = options.measureMode?.() || options.boxMode?.() ? null : pickAt(event.clientX, event.clientY)
    options.onContext?.(pick, { x: event.clientX - rect.left, y: event.clientY - rect.top })
  };

  /**
   * 触屏手势：只做"被动观察"，缩放（双指捏合）/ 旋转 / 平移仍由 OrbitControls 处理，
   * 这里仅补它不提供的点选语义 —— 单指点按 = 选中，快速双击 = 下钻，测量模式下 = 落点。
   * 全部监听器 passive，不 preventDefault，绝不与 OrbitControls 抢手势。
   */
  const handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length > 1) {
      // 多指 = 缩放/旋转手势，本次触摸不再判定点选
      touchGesture = true
      return
    }
    touchGesture = false
    const t = event.touches[0]
    touchStartX = t.clientX
    touchStartY = t.clientY
    touchStartTs = performance.now()
  };

  /** 位移超过阈值即视为拖动手势（阈值比鼠标大：手指抖动天然更明显） */
  const handleTouchMove = (event: TouchEvent) => {
    if (touchGesture) return
    const t = event.touches[0]
    if (!t) return
    if (event.touches.length > 1 || Math.hypot(t.clientX - touchStartX, t.clientY - touchStartY) > 10) {
      touchGesture = true
    }
  };

  const handleTouchEnd = (event: TouchEvent) => {
    // 还有手指按着（双指松开一指）→ 不当作点选
    if (event.touches.length > 0) return
    const wasGesture = touchGesture
    touchGesture = false
    if (wasGesture) return
    // 长按（>500ms）通常是用户想调出上下文菜单，不抢
    if (performance.now() - touchStartTs > 500) return
    const t = event.changedTouches[0]
    if (!t) return
    // 触摸点选已接管，屏蔽浏览器随后补发的 click
    suppressClickUntil = performance.now() + 500

    if (options.measureMode?.()) {
      const world = groundPick(t.clientX, t.clientY)
      if (world) options.onMeasure?.(world)
      return
    }
    if (options.boxMode?.()) return
    const now = performance.now()
    const isDoubleTap =
      now - lastTapTs < 320 && Math.hypot(t.clientX - lastTapX, t.clientY - lastTapY) < 32
    lastTapTs = now
    lastTapX = t.clientX
    lastTapY = t.clientY
    const pick = pickAt(t.clientX, t.clientY)
    if (isDoubleTap) {
      // 双击：清掉时间戳，避免三连击被当成两次双击
      lastTapTs = 0
      if (pick && !options.isBusy()) options.onDrill?.(pick)
      return
    }
    if (pick) options.onSelect?.(pick)
    else options.onMiss?.()
  };

  /** 绑定事件到容器；host 记录用于坐标换算 */
  const attach = (element: HTMLElement) => {
    host = element
    element.addEventListener('mousemove', handleMove, false)
    element.addEventListener('mouseleave', handleLeave, false)
    element.addEventListener('mousedown', handleDown, false)
    element.addEventListener('mouseup', handleUp, false)
    element.addEventListener('click', handleClick, false)
    element.addEventListener('dblclick', handleDoubleClick, false)
    element.addEventListener('contextmenu', handleContextMenu, false)
    // 触屏：passive 观察，不干扰 OrbitControls 自身的触摸手势
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
  };

  /** 解绑事件、清空状态 */
  const detach = () => {
    if (!host) return
    host.removeEventListener('mousemove', handleMove, false)
    host.removeEventListener('mouseleave', handleLeave, false)
    host.removeEventListener('mousedown', handleDown, false)
    host.removeEventListener('mouseup', handleUp, false)
    host.removeEventListener('click', handleClick, false)
    host.removeEventListener('dblclick', handleDoubleClick, false)
    host.removeEventListener('contextmenu', handleContextMenu, false)
    host.removeEventListener('touchstart', handleTouchStart)
    host.removeEventListener('touchmove', handleTouchMove)
    host.removeEventListener('touchend', handleTouchEnd)
    host.style.cursor = 'default'
    host = null
    hovered.value = null
  };

  return {
    attach,
    detach,
    hovered,
    position,
    /** 切层 / 重建时清掉悬停态，避免残留上一层的 tooltip 与高亮 */
    clearHover() {
      hovered.value = null
      options.onHover?.(null)
      applyCursor(null)
    },
    /** 外部切换模式（如进入测量）后重刷光标 */
    refreshCursor() {
      applyCursor(hovered.value)
    },
  }
};
