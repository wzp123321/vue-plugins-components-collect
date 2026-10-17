import { ref, shallowRef } from 'vue'
import * as THREE from 'three'

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
}

/** 拖拽判定阈值：超过这个位移就当成旋转/平移，不触发点击选中 */
const DRAG_THRESHOLD = 6

/**
 * 指针交互：悬停高亮 + 单击选中 + 双击下钻。
 * 旋转 / 平移 / 缩放全部交给 OrbitControls，这里只做拾取。
 */
export function usePointerPick(options: Options) {
  const hovered = shallowRef<PickResult | null>(null)
  const position = ref({ x: 0, y: 0 })

  let host: HTMLElement | null = null
  let downX = 0
  let downY = 0
  let framePending = false
  let pendingEvent: MouseEvent | null = null

  function pickAt(clientX: number, clientY: number): PickResult | null {
    const camera = options.camera()
    const root = options.getRoot()
    if (!camera || !root || !host) return null
    const rect = host.getBoundingClientRect()
    if (!rect.width || !rect.height) return null
    options.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
    options.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
    options.raycaster.setFromCamera(options.pointer, camera)

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
        properties: region?.customProperties ?? null,
        spot: null,
        point: surfaceHit.point.clone(),
      }
    }
    return null
  }

  function handleMove(event: MouseEvent) {
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
  }

  function handleLeave() {
    hovered.value = null
    if (host) host.style.cursor = 'default'
    options.onHover?.(null)
  }

  function handleDown(event: MouseEvent) {
    downX = event.clientX
    downY = event.clientY
  }

  function handleClick(event: MouseEvent) {
    if (Math.hypot(event.clientX - downX, event.clientY - downY) > DRAG_THRESHOLD) return
    options.onSelect?.(pickAt(event.clientX, event.clientY))
  }

  function handleDoubleClick(event: MouseEvent) {
    if (options.isBusy()) return
    const pick = pickAt(event.clientX, event.clientY)
    if (pick) options.onDrill?.(pick)
  }

  function attach(element: HTMLElement) {
    host = element
    element.addEventListener('mousemove', handleMove, false)
    element.addEventListener('mouseleave', handleLeave, false)
    element.addEventListener('mousedown', handleDown, false)
    element.addEventListener('click', handleClick, false)
    element.addEventListener('dblclick', handleDoubleClick, false)
  }

  function detach() {
    if (!host) return
    host.removeEventListener('mousemove', handleMove, false)
    host.removeEventListener('mouseleave', handleLeave, false)
    host.removeEventListener('mousedown', handleDown, false)
    host.removeEventListener('click', handleClick, false)
    host.removeEventListener('dblclick', handleDoubleClick, false)
    host = null
    hovered.value = null
  }

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
}
