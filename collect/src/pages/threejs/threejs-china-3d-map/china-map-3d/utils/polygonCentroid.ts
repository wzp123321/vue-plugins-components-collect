/**
 * 多边形中心计算公共工具
 *
 * 从 GeoJSON Feature 中提取多边形轮廓，计算投影后的面积加权质心，
 * 并补偿透视摄像机角度带来的视觉偏移。
 */

import * as THREE from 'three'
import type { GeoJsonFeature } from '../types'

/**
 * 从 GeoJSON Feature 中提取主多边形环（经纬度坐标）。
 * MultiPolygon 取最大的外环，Polygon 取第一个环。
 */
export function extractRing(feature: GeoJsonFeature): [number, number][] | null {
  const g = feature.geometry
  if (g.type === 'Polygon') {
    const rings = g.coordinates as [number, number][][]
    return rings[0] || null
  }
  if (g.type === 'MultiPolygon') {
    let best: [number, number][] | null = null
    let bestLen = 0
    for (const ring of (g.coordinates as [number, number][][][])) {
      if (ring[0] && ring[0].length > bestLen) {
        best = ring[0]
        bestLen = ring[0].length
      }
    }
    return best
  }
  return null
}

/**
 * 使用 shoelace 公式计算投影后多边形的面积加权质心。
 *
 * @param ring 投影后的多边形顶点数组 [[x, y], ...]
 * @returns 质心坐标 [cx, cy]，多边形退化时返回包围盒中心
 */
export function computePolygonCentroid(ring: [number, number][]): [number, number] {
  const n = ring.length
  if (n < 3) {
    // 退化多边形：使用坐标平均
    const sx = ring.reduce((a, p) => a + p[0], 0)
    const sy = ring.reduce((a, p) => a + p[1], 0)
    return [sx / n, sy / n]
  }

  // Shoelace 面积 × 2
  let area2 = 0
  let cx = 0
  let cy = 0

  for (let i = 0; i < n; i++) {
    const [x0, y0] = ring[i]
    const [x1, y1] = ring[(i + 1) % n]
    const cross = x0 * y1 - x1 * y0
    area2 += cross
    cx += (x0 + x1) * cross
    cy += (y0 + y1) * cross
  }

  if (Math.abs(area2) < 1e-12) {
    // 面积为零：使用包围盒中心
    const xs = ring.map(p => p[0])
    const ys = ring.map(p => p[1])
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]
  }

  return [cx / (3 * area2), cy / (3 * area2)]
}

/**
 * 计算 Feature 的投影后质心（世界坐标）。
 * 流程：提取轮廓 → Mercator 投影 → 质心计算 → 转换到世界坐标。
 *
 * @param feature GeoJSON 特征
 * @param proj d3 Mercator 投影函数
 * @param mapObject3D 地图 3D 对象（用于获取世界变换）
 * @returns 世界坐标质心 [x, y]
 */
export function computeFeatureWorldCentroid(
  feature: GeoJsonFeature,
  proj: ([lng, lat]: [number, number]) => [number, number],
  mapObject3D: THREE.Object3D,
): [number, number] {
  const ring = extractRing(feature)
  if (ring && ring.length >= 3) {
    // 投影所有顶点
    const projectedRing: [number, number][] = ring.map(([lng, lat]) => {
      const [x, y] = proj([lng, lat])
      return [x, -y] as [number, number]
    })
    const [cx, cy] = computePolygonCentroid(projectedRing)
    // 转换到世界坐标
    const mp = mapObject3D.position
    const s = mapObject3D.scale
    return [cx * s.x + mp.x, cy * s.y + mp.y]
  }

  // 回退：使用 properties.centroid
  const c = feature.properties.centroid || feature.properties.center
  if (c && Array.isArray(c) && c.length === 2) {
    const [cx, cy] = proj(c as [number, number])
    const mp = mapObject3D.position
    const s = mapObject3D.scale
    return [cx * s.x + mp.x, -cy * s.y + mp.y]
  }

  return [0, 0]
}

/**
 * 计算透视摄像机倾斜带来的视觉中心偏移量（世界 Y 方向）。
 *
 * 摄像机倾斜向下看时，3D 挤出体的顶面会在视觉上产生偏移。
 * 此函数计算需要补偿的 Y 偏移量，使多边形在屏幕上居中。
 *
 * @param camera 透视摄像机
 * @param controlsTarget OrbitControls 的注视目标
 * @param extrusionHeight 地图挤出高度（默认 6）
 * @returns 世界 Y 方向的偏移量
 */
export function computeCameraTiltOffset(
  camera: THREE.PerspectiveCamera,
  controlsTarget: THREE.Vector3,
  extrusionHeight = 6,
): number {
  const viewDir = new THREE.Vector3().copy(camera.position).sub(controlsTarget).normalize()
  // tiltAngle：视线与水平面的夹角
  const tiltAngle = Math.asin(Math.abs(viewDir.y))
  // 挤出体顶面中心需要沿屏幕"上"方向偏移，补偿透视
  // 偏移量 ≈ 挤出高度的一半 × tan(倾斜角)
  return -(extrusionHeight * 0.5) * Math.tan(tiltAngle)
}

/**
 * 计算多边形在给定投影下的包围盒信息。
 * 用于计算下钻缩放距离。
 */
export function computeProjectedBounds(
  feature: GeoJsonFeature,
  proj: ([lng, lat]: [number, number]) => [number, number],
): { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number; diagonal: number } | null {
  const ring = extractRing(feature)
  if (!ring || ring.length < 3) return null

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const [lng, lat] of ring) {
    const [x, y] = proj([lng, lat])
    const ny = -y
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (ny < minY) minY = ny
    if (ny > maxY) maxY = ny
  }

  const width = Math.max(maxX - minX, 0.01)
  const height = Math.max(maxY - minY, 0.01)
  const diagonal = Math.sqrt(width * width + height * height)

  return { minX, maxX, minY, maxY, width, height, diagonal }
}
