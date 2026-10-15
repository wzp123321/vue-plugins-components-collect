import type { GeoJsonFeature } from '../types'
import { extractRing } from './polygonCentroid'

/** 计算 feature 在给定投影下的包围盒面积 */
export function computeProjectedArea(feature: GeoJsonFeature, proj: any): number {
  const ring = extractRing(feature)
  if (!ring || ring.length < 3) return 0
  const projected = ring.map(([lng, lat]) => { const [x, y]: any = proj([lng, lat]); return [x, y] as [number, number] })
  const xs = projected.map(p => p[0]), ys = projected.map(p => p[1])
  return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys))
}

/** 射线法点是否在多边形内 */
export function pointInPolygon(px: number, py: number, ring: [number, number][]) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1]
    const xj = ring[j][0], yj = ring[j][1]
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

/**
 * 多边形内项目标记分布算法：
 * 网格候选 → 最远点贪心采样，适配任意形状轮廓
 */
export function distributeSpiral(ring: [number, number][], count: number): [number, number][] {
  const n = ring.length
  if (n < 3) {
    const cx = ring.reduce((a, p) => a + p[0], 0) / n
    const cy = ring.reduce((a, p) => a + p[1], 0) / n
    return Array.from({ length: count }, () => [cx, cy] as [number, number])
  }

  // 多边形质心
  let area2 = 0, cx = 0, cy = 0
  for (let i = 0; i < n; i++) {
    const [x0, y0] = ring[i]
    const [x1, y1] = ring[(i + 1) % n]
    const cross = x0 * y1 - x1 * y0
    area2 += cross
    cx += (x0 + x1) * cross
    cy += (y0 + y1) * cross
  }
  cx /= (3 * area2)
  cy /= (3 * area2)

  // 包围盒
  const xs = ring.map(p => p[0]), ys = ring.map(p => p[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const bw = maxX - minX, bh = maxY - minY

  // 候选网格间距
  const polyArea = Math.abs(area2) / 2
  const cellSize = Math.sqrt(polyArea / Math.max(count * 3, 1)) * 0.8
  const cols = Math.max(3, Math.ceil(bw / cellSize))
  const rows = Math.max(3, Math.ceil(bh / cellSize))
  const stepX = bw / cols, stepY = bh / rows

  // 筛选多边形内的候选点
  const candidates: [number, number][] = []
  for (let ci = 0; ci <= cols; ci++) {
    for (let ri = 0; ri <= rows; ri++) {
      const px = minX + stepX * (ci + 0.5)
      const py = minY + stepY * (ri + 0.5)
      if (pointInPolygon(px, py, ring)) {
        candidates.push([px, py])
      }
    }
  }

  // 最远点贪心采样
  const result: [number, number][] = []
  if (candidates.length > 0) {
    let bestIdx = 0, bestDist2 = Infinity
    for (let i = 0; i < candidates.length; i++) {
      const d2 = (candidates[i][0] - cx) ** 2 + (candidates[i][1] - cy) ** 2
      if (d2 < bestDist2) { bestDist2 = d2; bestIdx = i }
    }
    result.push(candidates[bestIdx])
    candidates.splice(bestIdx, 1)

    const remaining = Math.min(count - 1, candidates.length)
    for (let k = 0; k < remaining; k++) {
      let maxMinD2 = -1, selIdx = 0
      for (let i = 0; i < candidates.length; i++) {
        let minD2 = Infinity
        for (const rp of result) {
          const d2 = (candidates[i][0] - rp[0]) ** 2 + (candidates[i][1] - rp[1]) ** 2
          if (d2 < minD2) minD2 = d2
        }
        if (minD2 > maxMinD2) { maxMinD2 = minD2; selIdx = i }
      }
      result.push(candidates[selIdx])
      candidates.splice(selIdx, 1)
    }
  }

  // 回退螺旋
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  let sumDist = 0
  for (const [x, y] of ring) { sumDist += Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) }
  const fallbackR = Math.max(sumDist / n * 0.4, 0.2)
  for (let i = result.length; i < count; i++) {
    const r = fallbackR * Math.sqrt((i + 0.5) / count)
    const theta = i * goldenAngle
    for (let frac = 0.9; frac > 0.05; frac -= 0.1) {
      const px = cx + r * frac * Math.cos(theta)
      const py = cy + r * frac * Math.sin(theta)
      if (pointInPolygon(px, py, ring)) {
        result.push([px, py]); break
      }
    }
    if (result.length <= i) {
      const fb = i * 2.399963
      result.push([cx + Math.cos(fb) * 0.1, cy + Math.sin(fb) * 0.1])
    }
  }
  return result
}
