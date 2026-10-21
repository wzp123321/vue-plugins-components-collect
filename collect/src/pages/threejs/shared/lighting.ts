/**
 * three.js 升级到 0.173 后的光照强度补偿。
 *
 * 背景：three ≤ 0.147 的 `WebGLRenderer.useLegacyLights` 默认为 true，
 * 会在着色器里把每盏灯的 intensity 隐式乘 π；r155 起改用物理光照单位，
 * r160 直接删掉了这个开关 —— 同一个 intensity 数值在 0.173 下会暗约 3.14 倍。
 *
 * 所以凡是在 0.147 时代调好的灯光参数，升级后都要经过这个函数换算，
 * 才能维持升级前的画面亮度。新写的、按物理单位直接调的灯光不要用它。
 */
export const LEGACY_LIGHT_SCALE = Math.PI

/** 按 0.147 及更早版本的语义换算光照强度 */
export const legacyIntensity = (intensity: number): number => intensity * LEGACY_LIGHT_SCALE
