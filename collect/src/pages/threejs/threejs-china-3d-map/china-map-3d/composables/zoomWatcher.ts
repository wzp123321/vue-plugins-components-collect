import * as THREE from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { GeoJsonFeature, GeoJsonType } from '../types'

/**
 * Edge-triggered zoom watcher。在 rAF 中调用 update()，
 * 当相机距离跨越阈值（从外到内）时触发 auto-drill。
 * 使用 factory 模式，状态封装在闭包内。
 */
export function createZoomWatcher() {
  let referenceCameraDistance = 0
  let zoomDrillPending = false
  let _zoomInside = false
  let _prevDist = 0

  function update(
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls,
    zoomDrillEnabled: boolean | undefined,
    zoomDrillThreshold: number,
    isEntranceAnimating: boolean,
    isDisposed: boolean,
    tryAutoDrill: () => boolean,
  ) {
    if (!zoomDrillEnabled) return
    if (isEntranceAnimating || isDisposed) return
    if (!referenceCameraDistance || !controls) return

    const dist = camera.position.distanceTo(controls.target)
    const triggerDist = referenceCameraDistance * zoomDrillThreshold

    // 检测距离穿越阈值（从外到内）
    if (_prevDist >= triggerDist && dist < triggerDist && !_zoomInside && !zoomDrillPending) {
      _zoomInside = true
      const found = tryAutoDrill()
      if (found) {
        zoomDrillPending = true
      } else {
        // 失败重试：保持 _prevDist 不变，下次帧继续尝试
        _zoomInside = false
        return
      }
    } else if (dist >= referenceCameraDistance && _zoomInside) {
      // 必须缩放回参考距离以上才解锁
      _zoomInside = false
      zoomDrillPending = false
    }

    _prevDist = dist
  }

  function doAutoDrill(
    raycaster: THREE.Raycaster,
    pointer: THREE.Vector2,
    camera: THREE.PerspectiveCamera,
    mapObject3D: THREE.Object3D | null,
    currentGeoJson: GeoJsonType | null,
    onDrillDown: (p: GeoJsonFeature['properties']) => void,
  ): boolean {
    if (!mapObject3D || !currentGeoJson) return false

    // 中心热区采样点，不用精确对准
    const samples = [[0, 0], [0.06, 0], [-0.06, 0], [0, 0.06], [0, -0.06]]
    for (const [sx, sy] of samples) {
      pointer.set(sx, sy)
      raycaster.setFromCamera(pointer, camera)
      const intersects = mapObject3D
        ? raycaster.intersectObjects(mapObject3D.children, true)
        : []
      const target = intersects.find(
        (item: any) => item.object.userData?.isChangeColor,
      )
      if (target) {
        const obj: any = target.object.parent
        const p: GeoJsonFeature['properties'] = obj?.customProperties || (target.object as any).customProperties
        if (p && p.level !== 'city') {
          onDrillDown(p)
          return true
        }
      }
    }
    return false
  }

  /** 初始化参考距离（不锁住），用于新层级的 auto-drill 就绪 */
  function init(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
    referenceCameraDistance = camera.position.distanceTo(controls.target)
    _zoomInside = false
    zoomDrillPending = false
  }

  /** 下钻完成后调用，记录新距离并锁住 auto-drill（直到缩放超过阈值解锁） */
  function reset(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
    referenceCameraDistance = camera.position.distanceTo(controls.target)
    _zoomInside = true      // 已在阈值内
    zoomDrillPending = true  // 锁住，不再触发
  }

  return { update, doAutoDrill, reset, init }
}
