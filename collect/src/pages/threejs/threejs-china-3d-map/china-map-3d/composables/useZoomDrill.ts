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
 * useZoomDrill —— 缩放触发下钻（手势下钻）。
 *
 * 文件职责：
 *   监测相机到视点的距离，当"从外向内跨过阈值"这一瞬间触发一次下钻。
 *   它不直接改地图，只负责判断时机，并把 hitCenter() 的命中结果交给调用方。
 *
 * 在整体架构中的角色：
 *   交互触发器，与 usePointerPick（双击下钻）互补：双击是显式点击，本模块是
 *   "滚轮放大到一定程度自动下钻"。由地图主组件每帧调 update()。
 *
 * 与哪些模块协作：
 *   - useMapViewport：读取 camera / controls 计算距离
 *   - useMapLevels：hitCenter 命中后由调用方调 drill()
 *
 * ⚠️ 核心算法（防误触）：采用"武装(armed) + 单发"状态机。
 *   只有当 distance 由"≥触发线"跨到"<触发线"才触发一次；触发后必须先把距离
 *   拉回到 referenceDistance 以上才重新武装，否则连续放大只会触发一次，
 *   避免一次手势反复重建地图。
 */
export const useZoomDrill = (options: Options) => {
  let referenceDistance = 0
  let armed = false
  let previousDistance = 0

  /**
   * 重置参考距离：以"当前相机到视点距离"为基准，并把武装状态清零。
   * 每次进入新层级 / 重建地图后调用，避免沿用上一层的旧距离导致立刻误触发。
   */
  const reset = (camera: THREE.PerspectiveCamera | null, controls: OrbitControls | null) => {
    if (!camera || !controls) return
    referenceDistance = camera.position.distanceTo(controls.target)
    previousDistance = referenceDistance
    armed = false
  };

  /**
   * 每帧更新：判断是否满足"由外向内跨过触发线"。
   * @param camera   当前透视相机
   * @param controls 当前 OrbitControls（取 target）
   */
  const update = (camera: THREE.PerspectiveCamera | null, controls: OrbitControls | null) => {
    if (!camera || !controls || !options.enabled() || options.isBusy() || !referenceDistance) return
    const distance = camera.position.distanceTo(controls.target)
    const trigger = referenceDistance * options.threshold()

    // 未武装 → 跨过触发线这一刻：若视野中心命中行政区则武装并交由调用方下钻
    if (!armed && previousDistance >= trigger && distance < trigger) {
      if (options.hitCenter()) armed = true
      previousDistance = distance
      return
    }
    // 已武装 → 拉远到参考距离以上才解除武装，允许下一次下钻
    if (armed && distance >= referenceDistance) armed = false
    previousDistance = distance
  };

  return { update, reset }
};
