/**
 * geo.ts —— GeoJSON 几何解析与取景 / 合规工具
 *
 * 本文件职责：
 *   把 DataV 的 GeoJSON Feature 解析成「环（Ring）」这一统一结构，并提供
 *   - 取景主体环 focusRings（忽略极小离岛，避免把取景范围撑爆）
 *   - 中国地图合规校验 checkCountryCompliance（必须有台湾省 + 九段线）
 *   - 整体外轮廓提取 extractOuterRings（边计数法，比逐边扫描快一个量级）
 *   供 projection / drawRegion / drawOutline 复用，避免各处重复实现。
 *
 * 在整体架构中的角色：几何数据入口层，介于「数据加载（amap-loader）」与
 *   「几何绘制（projection / drawRegion / drawOutline）」之间。
 *
 * 协作模块：
 *   - amap-loader.ts（产出 GeoJsonType）
 *   - projection.ts（用 focusRings 取景）
 *   - drawRegion.ts / drawOutline.ts（用 featureRings / extractOuterRings）
 */

import type { GeoJsonFeature, GeoJsonType } from '../types'

/** 经纬度环：[lng, lat] 序列 */
export type Ring = [number, number][]

/**
 * 取出 Feature 的全部环（MultiPolygon 会展平为环列表，孔洞环也在其中）。
 * 绘制板块与生成外轮廓都以此为基础，统一放在这里避免多处重复实现。
 *
 * ⚠️ 坑：DataV 的 MultiPolygon 结构是 `[polygon][ring][point]`，Polygon 是
 *   `[ring][point]`，二者层数不同，必须分别处理；且每条环至少要 3 个点才算合法，
 *   否则会生成退化几何导致 ExtrudeGeometry 崩溃。
 */
export const featureRings = (feature: GeoJsonFeature): Ring[] => {
  const geometry = feature.geometry
  if (!geometry?.coordinates) return []
  const out: Ring[] = []
  const push = (ring: unknown) => {
    if (!Array.isArray(ring) || ring.length < 3) return
    const first = ring[0]
    if (!Array.isArray(first) || typeof first[0] !== 'number') return
    out.push(ring as Ring)
  }
  if (geometry.type === 'MultiPolygon') {
    const polygons = geometry.coordinates as Ring[][]
    polygons.forEach((polygon) => polygon.forEach((ring) => push(ring)))
  } else if (geometry.type === 'Polygon') {
    const rings = geometry.coordinates as Ring[]
    rings.forEach((ring) => push(ring))
  }
  return out
};

interface AreaEntry {
  area: number
  ring: Ring
}

/**
 * 参与取景计算的环：按经纬包围盒面积降序累加，只保留累计 98.5% 的主体，
 * 忽略三沙、舟山外岛这类极小的离岛，否则取景范围会被撑大、主体缩得很小。
 *
 * @param geo  当前层级 GeoJSON
 * @param step 采样步长（默认 2：取景只需大致范围，粗采样提速，精度足够）
 * @returns 保留下来的主体环列表
 *
 * ⚠️ 坑：step=2 是取景与 fitProjection 一致的粗采样约定，二者必须对齐，
 *   否则取景用的包围盒与最终投影用的包围盒不一致，地图会偏移。
 */
export const focusRings = (geo: GeoJsonType, step = 2): Ring[] => {
  const entries: AreaEntry[] = []
  geo.features.forEach((feature) => {
    featureRings(feature).forEach((ring) => {
      let minX = Infinity
      let maxX = -Infinity
      let minY = Infinity
      let maxY = -Infinity
      for (let i = 0; i < ring.length; i += step) {
        const [lng, lat] = ring[i]
        // 非有限坐标不参与包围盒统计（原 continue 改为正向包裹，结果一致）
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
          if (lng < minX) minX = lng
          if (lng > maxX) maxX = lng
          if (lat < minY) minY = lat
          if (lat > maxY) maxY = lat
        }
      }
      if (Number.isFinite(minX)) entries.push({ area: Math.max(1e-9, (maxX - minX) * (maxY - minY)), ring })
    })
  })
  if (!entries.length) return []
  entries.sort((a, b) => b.area - a.area)
  const total = entries.reduce((sum, entry) => sum + entry.area, 0)
  const kept: Ring[] = []
  let acc = 0
  // some() 返回 true 即停止，等价原「累加到 98.5% 后 break」的提前退出语义
  entries.some((entry) => {
    kept.push(entry.ring)
    acc += entry.area
    return acc >= total * 0.985
  })
  return kept
};

/** 全国数据必须具备的要素：台湾省 + 九段线（DataV 的九段线 adcode 形如 `100000_JD`） */
const REQUIRED_COUNTRY: Array<{ label: string; match: (adcode: string, name: string) => boolean }> = [
  { label: '台湾省', match: (adcode) => adcode === '710000' },
  { label: '九段线', match: (adcode) => adcode.endsWith('_JD') },
]

export interface ComplianceReport {
  ok: boolean
  missing: string[]
}

/**
 * 中国地图合规校验：全国底图必须包含台湾省与九段线（南海诸岛界线）。
 * 数据换成其它来源时这道检查能第一时间发现「地图画漏了」。
 *
 * ⚠️ 合规红线：台湾省（adcode 710000）与九段线（adcode 以 `_JD` 结尾）是
 *   全国底图强制要素，缺失即视为不合规，绝不能静默放行。
 */
export const checkCountryCompliance = (geo: GeoJsonType): ComplianceReport => {
  const missing: string[] = []
  REQUIRED_COUNTRY.forEach((required) => {
    const hit = geo.features.some((feature) => {
      const adcode = String(feature?.properties?.adcode ?? '')
      const name = String(feature?.properties?.name ?? '')
      return required.match(adcode, name)
    })
    if (!hit) missing.push(required.label)
  })
  return { ok: missing.length === 0, missing }
};

interface Edge {
  x1: number
  y1: number
  x2: number
  y2: number
}

/**
 * 用「边计数法」提取当前层级的整体外轮廓：只出现一次的边即为外边界，
 * 再用邻接索引把它们拼成连续环（比逐边扫描快一个量级）。
 *
 * 算法：
 *   1) 遍历所有环，对每条相邻点对做「规范化 key」（小端点在前），计数；
 *   2) count===1 的边只属于一个面，必为外边界；
 *   3) 用 byStart 邻接表从任意边界边出发，沿端点接龙拼成闭合环。
 *
 * ⚠️ 坑：key 规范化（`x1<x2 || (x1===x2 && y1<y2)`）是算法正确性的前提——
 *   同一条边无论正反都会被归到同一 key，否则会被误判成两条边界边。
 */
export const extractOuterRings = (geo: GeoJsonType): Ring[] => {
  const counts = new Map<string, number>()
  const edges = new Map<string, Edge>()
  const keyOf = (x1: number, y1: number, x2: number, y2: number) =>
    x1 < x2 || (x1 === x2 && y1 < y2) ? `${x1},${y1}|${x2},${y2}` : `${x2},${y2}|${x1},${y1}`

  geo.features.forEach((feature) => {
    featureRings(feature).forEach((ring) => {
      for (let i = 0; i < ring.length - 1; i++) {
        const [x1, y1] = ring[i]
        const [x2, y2] = ring[i + 1]
        // 端点非有限则整条边作废（原 continue 改为正向包裹，计数结果一致）
        if (Number.isFinite(x1) && Number.isFinite(y1) && Number.isFinite(x2) && Number.isFinite(y2)) {
          const key = keyOf(x1, y1, x2, y2)
          counts.set(key, (counts.get(key) || 0) + 1)
          if (!edges.has(key)) edges.set(key, { x1, y1, x2, y2 })
        }
      }
    })
  })

  const boundary: Edge[] = []
  counts.forEach((count, key) => {
    if (count !== 1) return
    const edge = edges.get(key)
    if (edge) boundary.push(edge)
  })
  if (!boundary.length) return []

  const byStart = new Map<string, Edge[]>()
  boundary.forEach((edge) => {
    const key = `${edge.x1},${edge.y1}`
    const list = byStart.get(key)
    if (list) list.push(edge)
    else byStart.set(key, [edge])
  })

  const used = new Set<Edge>()
  const rings: Ring[] = []
  boundary.forEach((first) => {
    // 已拼进某个环的边跳过（原 continue 改为提前 return）
    if (used.has(first)) return
    used.add(first)
    const ring: Ring = [[first.x1, first.y1], [first.x2, first.y2]]
    for (;;) {
      const last = ring[ring.length - 1]
      const next = byStart.get(`${last[0]},${last[1]}`)?.find((edge) => !used.has(edge))
      if (!next) break
      used.add(next)
      ring.push([next.x2, next.y2])
      if (next.x2 === first.x1 && next.y2 === first.y1) break
    }
    if (ring.length > 2) rings.push(ring)
  })
  return rings
};
