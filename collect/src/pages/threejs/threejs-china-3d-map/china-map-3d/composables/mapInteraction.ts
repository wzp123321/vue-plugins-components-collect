import * as THREE from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { GeoJsonFeature } from '../types'

const DRAG_THRESHOLD = 3

/**
 * 地图鼠标交互：hover 高亮、PAN/ROTATE 切换、click 下钻、拖拽防 click。
 * 使用 getter 函数确保闭包始终读取最新状态。
 */
export function createMapInteraction() {
  let lastPick: any = null
  let mouseDownPos = { x: 0, y: 0 }
  let hasMouseMoved = false

  function getFirstMaterial(obj: any): any | null {
    if (!obj?.material) return null
    return Array.isArray(obj.material) ? obj.material[0] : obj.material
  }

  function createMouseMoveHandler(
    canvasDom: HTMLElement,
    camera: THREE.PerspectiveCamera,
    raycaster: THREE.Raycaster,
    pointer: THREE.Vector2,
    getMapObject3D: () => THREE.Object3D | null,
    controls: OrbitControls,
    getIsEntranceAnimating: () => boolean,
    mapColor: string,
    mapOpacity: number,
    mapHoverColor: string,
  ) {
    return (e: MouseEvent) => {
      // 拖拽检测
      const dx = e.clientX - mouseDownPos.x
      const dy = e.clientY - mouseDownPos.y
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        hasMouseMoved = true
      }

      const rect = canvasDom.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)

      const mapObj = getMapObject3D()
      const intersects = mapObj ? raycaster.intersectObjects(mapObj.children, true) : []

      // 还原上一个 hover
      if (lastPick) {
        const mat = getFirstMaterial(lastPick.object)
        if (mat?.color) mat.color.set(mapColor)
        if (mat) mat.opacity = mapOpacity
      }
      lastPick = null

      lastPick = intersects.find((item: any) => item.object.userData?.isChangeColor && !item.object.userData?.isSpot)

      if (lastPick) {
        const mat = getFirstMaterial(lastPick.object)
        if (mat?.color) mat.color.set(mapHoverColor)
        if (mat) mat.opacity = 1
        // 鼠标在地图轮廓上 → PAN
        if (controls && controls.mouseButtons.LEFT !== 2) {
          controls.mouseButtons.LEFT = 2
        }
      } else {
        // 鼠标在地图轮廓外 → ROTATE
        if (controls && controls.mouseButtons.LEFT !== 0) {
          controls.mouseButtons.LEFT = 0
        }
      }
    }
  }

  function createClickHandler(
    canvasDom: HTMLElement,
    camera: THREE.PerspectiveCamera,
    raycaster: THREE.Raycaster,
    pointer: THREE.Vector2,
    getMapObject3D: () => THREE.Object3D | null,
    getIsEntranceAnimating: () => boolean,
    onDrillDown: (p: GeoJsonFeature['properties'], hit?: { point: THREE.Vector3; object: THREE.Object3D }) => void,
  ) {
    return (_e: MouseEvent) => {
      if (hasMouseMoved) return

      const rect = canvasDom.getBoundingClientRect()
      pointer.x = ((_e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((_e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)

      const mapObj = getMapObject3D()
      const intersects = mapObj ? raycaster.intersectObjects(mapObj.children, true) : []
      // 优先匹配地图区域，其次匹配标记
      const mapTarget = intersects.find((item: any) => item.object.userData?.isChangeColor && !item.object.userData?.isSpot)
      const spotTarget = intersects.find((item: any) => item.object.userData?.isChangeColor && item.object.userData?.isSpot)

      const target = spotTarget || mapTarget
      if (target) {
        const props = target.object.customProperties || target.object.parent.customProperties
        if (props) onDrillDown(props, { point: target.point.clone(), object: target.object as THREE.Object3D })
      }
    }
  }

  function createMouseDownHandler() {
    return (e: MouseEvent) => {
      mouseDownPos = { x: e.clientX, y: e.clientY }
      hasMouseMoved = false
    }
  }

  return { createMouseMoveHandler, createClickHandler, createMouseDownHandler }
}
