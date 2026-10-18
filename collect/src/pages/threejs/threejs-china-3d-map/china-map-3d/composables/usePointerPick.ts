import { ref, shallowRef } from 'vue'
import * as THREE from 'three'

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

  /** 鼠标移动：记录相对容器的坐标供 tooltip 定位，并每帧最多拾取一次 */
  const handleMove = (event: MouseEvent) => {
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
      const pick = pickAt(queued.clientX, queued.clientY)
      hovered.value = pick
      host.style.cursor = pick ? 'pointer' : 'default'
      options.onHover?.(pick)
    })
  };

  /** 鼠标离开容器：清空悬停态 */
  const handleLeave = () => {
    hovered.value = null
    if (host) host.style.cursor = 'default'
    options.onHover?.(null)
  };

  /** 按下时记录起点，供 click 判定是"点击"还是"拖拽" */
  const handleDown = (event: MouseEvent) => {
    downX = event.clientX
    downY = event.clientY
  };

  /**
   * 单击：若位移超过 DRAG_THRESHOLD 视为拖拽/旋转，不触发选中。
   * ⚠️ 坑：OrbitControls 的拖拽与点击共用左键，若不做阈值区分，一松手就会
   *   误选中。用按下/抬起两点欧氏距离判断是否"动了手"。
   */
  const handleClick = (event: MouseEvent) => {
    if (Math.hypot(event.clientX - downX, event.clientY - downY) > DRAG_THRESHOLD) return
    const pick = pickAt(event.clientX, event.clientY)
    if (pick) options.onSelect?.(pick)
    // 落空（没有命中任何板块 / 标记）→ 通知外部取消选中
    else options.onMiss?.()
  };

  /** 双击：下钻到命中区域（busy 时不响应，避免重建期间重复触发） */
  const handleDoubleClick = (event: MouseEvent) => {
    if (options.isBusy()) return
    const pick = pickAt(event.clientX, event.clientY)
    if (pick) options.onDrill?.(pick)
  };

  /** 绑定事件到容器；host 记录用于坐标换算 */
  const attach = (element: HTMLElement) => {
    host = element
    element.addEventListener('mousemove', handleMove, false)
    element.addEventListener('mouseleave', handleLeave, false)
    element.addEventListener('mousedown', handleDown, false)
    element.addEventListener('click', handleClick, false)
    element.addEventListener('dblclick', handleDoubleClick, false)
  };

  /** 解绑事件、清空状态 */
  const detach = () => {
    if (!host) return
    host.removeEventListener('mousemove', handleMove, false)
    host.removeEventListener('mouseleave', handleLeave, false)
    host.removeEventListener('mousedown', handleDown, false)
    host.removeEventListener('click', handleClick, false)
    host.removeEventListener('dblclick', handleDoubleClick, false)
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
      if (host) host.style.cursor = 'default'
    },
  }
};
