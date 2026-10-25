/**
 * anchor.ts —— 行政区标记锚点（柱体 / 标牌 / 飞线端点统一取这里）
 *
 * 本文件职责：
 *   为每一个行政区计算一个「标记锚点」经纬度，供数据柱、地理标牌、飞线端点
 *   共用，保证三者位置严格一致，不会出现「柱子在 A、标牌在 B」的错位。
 *
 * 在整体架构中的角色：标记定位的单一事实来源。柱体（spotLayer）、标牌
 *   （spotCanvas）与飞线（drawFlyLine 的端点）都应通过 anchorOf() 取锚点，
 *   而不是直接读 properties.center / properties.centroid。
 *
 * 协作模块：
 *   - geo.ts（featureRings 取环计算几何边界）
 *   - spotLayer.ts / spotCanvas.ts / drawFlyLine.ts（消费锚点）
 *
 * ⚠️ 坑（最重要的一条）：DataV 的 properties.center 是主城区 / 政府驻点坐标，
 *   不是几何中心。安庆、池州这类沿江城市主城区就贴着市域边界，center 距边界
 *   只有等效半径的 2%~4%，柱体 / 飞线会看着长在板块边上。本模块 anchorOf() 对
 *   贴边锚点朝几何质心 centroid 回拉，直到距边界达到 0.2×等效半径（上限 0.6、
 *   步长 0.1）。柱体 / 标牌 / 飞线必须共用同一锚点。
 * ⚠️ 约定：标记位置以 properties.center 为基准（不要直接用 centroid，质心可能
 *   落在山区 / 湖中无人区）。只有 center 贴边时才临时回拉到 centroid 方向。
 */

import { featureRings } from './geo'
import type { Ring } from './geo'
import type { GeoJsonFeature } from '../types'

/** 锚点距边界的最小比例：低于这个值就往几何内部收（= 0.2×等效半径） */
const MIN_EDGE_RATIO = 0.2
/** 最多朝质心方向回拉的比例，防止极端凹形把锚点拉飞 */
const MAX_PULL = 0.6
const PULL_STEP = 0.1

/** 同一份 GeoJSON 会被反复重建，锚点算一次就够 */
const cache = new WeakMap<GeoJsonFeature, [number, number] | null>()

/** 经度按纬度收缩，保证距离比较与实际公里数一致（越往高纬经线越密） */
const cosScale = (ring: Ring): number => {
  let sum = 0
  ring.forEach(([, lat]) => { sum += lat })
  const lat = ring.length ? sum / ring.length : 30
  return Math.cos((lat * Math.PI) / 180) || 1
};

const boundsOf = (ring: Ring, scale: number) => {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  ring.forEach(([lng, lat]) => {
    const x = lng * scale
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (lat < minY) minY = lat
    if (lat > maxY) maxY = lat
  })
  return { minX, maxX, minY, maxY }
};

/** 等效半径：与该行政区同面积的圆的半径，用来把「距边界」归一化 */
// ⚠️ 用等效圆半径做归一化，是因为各地面积差异巨大，绝对值没有可比性；
// 乘以 cosScale 后，经向距离与纬向距离在同一尺度上比较，回拉判据才合理。
const equivalentRadius = (ring: Ring, scale: number): number => {
  const { minX, maxX, minY, maxY } = boundsOf(ring, scale)
  const width = Math.max(maxX - minX, 1e-6)
  const height = Math.max(maxY - minY, 1e-6)
  return Math.max(1e-6, Math.sqrt((width * height) / Math.PI))
};

const distanceToRing = (point: [number, number], ring: Ring, scale: number): number => {
  const px = point[0] * scale
  const py = point[1]
  let min = Infinity
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[(i + 1) % ring.length]
    const ax = x1 * scale
    const ay = y1
    const bx = x2 * scale
    const by = y2
    const dx = bx - ax
    const dy = by - ay
    const len2 = dx * dx + dy * dy
    // 点到线段最近距离：先求投影参数 t 并夹到 [0,1]（端点之外取端点）
    const t = len2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0
    const dist = Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
    if (dist < min) min = dist
  }
  return min
};

/** 取面积最大的环作为主体（离岛、飞地不参与锚点计算） */
const mainRing = (rings: Ring[]): Ring | null => {
  let best: Ring | null = null
  let bestArea = -Infinity
  rings.forEach((ring) => {
    const scale = cosScale(ring)
    const { minX, maxX, minY, maxY } = boundsOf(ring, scale)
    const area = (maxX - minX) * (maxY - minY)
    if (area > bestArea) {
      bestArea = area
      best = ring
    }
  })
  return best
};

/**
 * 行政区锚点：柱体 / 标牌 / 飞线端点统一取这里，保证三者位置一致。
 *
 * DataV 的 properties.center 是主城区（政府驻点）坐标，安庆、池州这类沿江城市
 * 的主城区就贴在市域边界上（距边界只有等效半径的 2%~4%），柱子和飞线看上去像
 * 长在板块边缘。这里对贴边锚点朝几何质心回拉，直到距边界达到 MIN_EDGE_RATIO。
 *
 * @param feature GeoJSON Feature（其 properties 必须有 center / centroid）
 * @returns [lng, lat] 锚点；feature 非法或无可解析坐标时返回 null
 */
/**
 * 真正的锚点计算：
 *   1) 基准点 = properties.center（主城区坐标，不要用 centroid）；
 *   2) 若距边界已 ≥ 0.2×等效半径，直接返回 center；
 *   3) 否则从 center 朝 centroid 方向按 0.1 步长逐步回拉，取第一个达标的；
 *   4) 极端凹形下最多回拉 MAX_PULL=0.6，避免锚点被拉飞到几何外。
 */
const computeAnchor = (feature: GeoJsonFeature): [number, number] | null => {
  const center = feature.properties?.center as [number, number] | undefined
  const fallback = (feature.properties?.centroid as [number, number] | undefined) ?? center
  if (!Array.isArray(fallback) || fallback.length !== 2) return null

  const rings = featureRings(feature)
  const ring = mainRing(rings)
  if (!ring || ring.length < 3) return fallback

  const scale = cosScale(ring)
  const radius = equivalentRadius(ring, scale)
  const start: [number, number] = Array.isArray(center) && center.length === 2 ? center : fallback

  const ratioAt = (point: [number, number]) => distanceToRing(point, ring, scale) / radius
  if (ratioAt(start) >= MIN_EDGE_RATIO) return start

  const centroid = feature.properties?.centroid as [number, number] | undefined
  if (!Array.isArray(centroid) || centroid.length !== 2) return start
  if (centroid[0] === start[0] && centroid[1] === start[1]) return start

  // 朝质心方向逐步回拉，取第一个满足最小边距的位置
  for (let k = PULL_STEP; k <= MAX_PULL + 1e-9; k += PULL_STEP) {
    const candidate: [number, number] = [
      start[0] + (centroid[0] - start[0]) * k,
      start[1] + (centroid[1] - start[1]) * k,
    ]
    if (ratioAt(candidate) >= MIN_EDGE_RATIO) return candidate
  }
  return [
    start[0] + (centroid[0] - start[0]) * MAX_PULL,
    start[1] + (centroid[1] - start[1]) * MAX_PULL,
  ]
};

export const anchorOf = (feature: GeoJsonFeature): [number, number] | null => {
  if (!feature) return null
  const cached = cache.get(feature)
  if (cached !== undefined) return cached

  const result = computeAnchor(feature)
  cache.set(feature, result)
  return result
};

/**
 * 直接给经纬度的兜底入口：拿不到 feature（例如外部手写坐标）时原样返回。
 *
 * @param feature  可选的 Feature（有则走 anchorOf 回拉逻辑）
 * @param fallback 无 feature 时的默认经纬度
 */
export const anchorCoord = (
  feature: GeoJsonFeature | null | undefined,
  fallback: [number, number],
): [number, number] => (feature && anchorOf(feature)) || fallback
