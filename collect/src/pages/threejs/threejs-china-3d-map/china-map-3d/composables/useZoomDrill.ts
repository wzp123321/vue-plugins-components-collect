import type * as THREE from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface Options {
  enabled: () => boolean
  /** 触发阈值：距离小于参考距离 * threshold 即认为「放大到位」 */
  threshold: () => number
  isBusy: () => boolean
  /** 视野中心命中某个行政区时返回 true（由调用方执行下钻） */
  hitCenter: () => boolean
}

/**
 * 缩放触发下钻：只有「从外向内跨过阈值」这一瞬间触发一次，
 * 之后必须缩回参考距离以上才重新武装，避免连续误触发。
 */
export function useZoomDrill(options: Options) {
  let referenceDistance = 0
  let armed = false
  let previousDistance = 0

  function reset(camera: THREE.PerspectiveCamera | null, controls: OrbitControls | null) {
    if (!camera || !controls) return
    referenceDistance = camera.position.distanceTo(controls.target)
    previousDistance = referenceDistance
    armed = false
  }

  function update(camera: THREE.PerspectiveCamera | null, controls: OrbitControls | null) {
    if (!camera || !controls || !options.enabled() || options.isBusy() || !referenceDistance) return
    const distance = camera.position.distanceTo(controls.target)
    const trigger = referenceDistance * options.threshold()

    if (!armed && previousDistance >= trigger && distance < trigger) {
      if (options.hitCenter()) armed = true
      previousDistance = distance
      return
    }
    if (armed && distance >= referenceDistance) armed = false
    previousDistance = distance
  }

  return { update, reset }
}
