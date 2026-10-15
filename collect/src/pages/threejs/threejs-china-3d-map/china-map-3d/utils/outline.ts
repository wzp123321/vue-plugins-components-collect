/**
 * 国界线提取：边计数法。
 * 对所有省份多边形的边计数，只出现 1 次的边即为外轮廓（国界线）。
 */

import type { GeoJsonType } from '../types'

type EdgeKey = string // "x1,y1-x2,y2" 归一化 key

function edgeKey(x1: number, y1: number, x2: number, y2: number): EdgeKey {
  // 归一化：小坐标在前
  if (x1 < x2 || (x1 === x2 && y1 < y2)) {
    return `${x1},${y1}-${x2},${y2}`
  }
  return `${x2},${y2}-${x1},${y1}`
}

interface Edge {
  x1: number; y1: number; x2: number; y2: number
}

/**
 * 提取国界线：对所有特征的外环边计数，只保留出现 1 次的边。
 * 返回外轮廓的连续线段（经纬度坐标）。
 */
export function extractOutline(geoJson: GeoJsonType): [number, number][][] {
  const edgeCount = new Map<EdgeKey, number>()
  const edgeData = new Map<EdgeKey, Edge>()

  // 遍历所有特征的外环
  for (const feature of geoJson.features) {
    const coords = feature.geometry.coordinates

    function processRing(ring: [number, number][]) {
      for (let i = 0; i < ring.length - 1; i++) {
        const [x1, y1] = ring[i]
        const [x2, y2] = ring[i + 1]
        const key = edgeKey(x1, y1, x2, y2)
        edgeCount.set(key, (edgeCount.get(key) || 0) + 1)
        if (!edgeData.has(key)) {
          edgeData.set(key, { x1, y1, x2, y2 })
        }
      }
    }

    function visit(pt: unknown) {
      if (Array.isArray(pt) && typeof pt[0] === 'number') {
        return // leaf, handled by processRing
      }
      if (Array.isArray(pt)) {
        // 判断是坐标数组还是环数组
        if (pt.length > 0 && typeof pt[0] === 'number') {
          processRing(pt as [number, number][])
        } else {
          for (const item of pt) visit(item)
        }
      }
    }

    // MultiPolygon: coordinates[0] = polygons, coordinates[0][0] = rings
    // Polygon: coordinates[0] = outer ring
    if (feature.geometry.type === 'MultiPolygon') {
      const polys = coords as [number, number][][][]
      for (const poly of polys) {
        if (poly.length > 0) processRing(poly[0]) // outer ring only
      }
    } else if (feature.geometry.type === 'Polygon') {
      const rings = coords as [number, number][][]
      if (rings.length > 0) processRing(rings[0]) // outer ring
    }
  }

  // 收集只出现 1 次的边
  const outlineEdges: Edge[] = []
  for (const [key, count] of edgeCount) {
    if (count === 1) {
      outlineEdges.push(edgeData.get(key)!)
    }
  }

  if (outlineEdges.length === 0) return []

  // 连接边为连续线段
  return stitchEdges(outlineEdges)
}

/** 将散边拼接成连续环 */
function stitchEdges(edges: Edge[]): [number, number][][] {
  const remaining = new Set(edges)
  const rings: [number, number][][] = []

  while (remaining.size > 0) {
    const ring: [number, number][] = []
    const first = remaining.values().next().value!
    remaining.delete(first)
    ring.push([first.x1, first.y1], [first.x2, first.y2])

    // 向前延伸
    let grown = true
    while (grown) {
      grown = false
      const last = ring[ring.length - 1]
      for (const e of remaining) {
        if (e.x1 === last[0] && e.y1 === last[1]) {
          ring.push([e.x2, e.y2])
          remaining.delete(e)
          grown = true; break
        }
        if (e.x2 === last[0] && e.y2 === last[1]) {
          ring.push([e.x1, e.y1])
          remaining.delete(e)
          grown = true; break
        }
      }
    }

    // 向后延伸
    grown = true
    while (grown) {
      grown = false
      const firstPt = ring[0]
      for (const e of remaining) {
        if (e.x2 === firstPt[0] && e.y2 === firstPt[1]) {
          ring.unshift([e.x1, e.y1])
          remaining.delete(e)
          grown = true; break
        }
        if (e.x1 === firstPt[0] && e.y1 === firstPt[1]) {
          ring.unshift([e.x2, e.y2])
          remaining.delete(e)
          grown = true; break
        }
      }
    }

    if (ring.length > 2) rings.push(ring)
  }

  return rings
}
