import type { GeoJsonFeature, GeoJsonType } from '../types'

/** 经纬度环：[lng, lat] 序列 */
export type Ring = [number, number][]

/**
 * 取出 Feature 的全部环（MultiPolygon 会展平为环列表，孔洞环也在其中）。
 * 绘制板块与生成外轮廓都以此为基础，统一放在这里避免多处重复实现。
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
    for (const polygon of geometry.coordinates as Ring[][]) for (const ring of polygon) push(ring)
  } else if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates as Ring[]) push(ring)
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
 */
export const focusRings = (geo: GeoJsonType, step = 2): Ring[] => {
  const entries: AreaEntry[] = []
  for (const feature of geo.features) {
    for (const ring of featureRings(feature)) {
      let minX = Infinity
      let maxX = -Infinity
      let minY = Infinity
      let maxY = -Infinity
      for (let i = 0; i < ring.length; i += step) {
        const [lng, lat] = ring[i]
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
        if (lng < minX) minX = lng
        if (lng > maxX) maxX = lng
        if (lat < minY) minY = lat
        if (lat > maxY) maxY = lat
      }
      if (!Number.isFinite(minX)) continue
      entries.push({ area: Math.max(1e-9, (maxX - minX) * (maxY - minY)), ring })
    }
  }
  if (!entries.length) return []
  entries.sort((a, b) => b.area - a.area)
  const total = entries.reduce((sum, entry) => sum + entry.area, 0)
  const kept: Ring[] = []
  let acc = 0
  for (const entry of entries) {
    kept.push(entry.ring)
    acc += entry.area
    if (acc >= total * 0.985) break
  }
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
 */
export const checkCountryCompliance = (geo: GeoJsonType): ComplianceReport => {
  const missing: string[] = []
  for (const required of REQUIRED_COUNTRY) {
    const hit = geo.features.some((feature) => {
      const adcode = String(feature?.properties?.adcode ?? '')
      const name = String(feature?.properties?.name ?? '')
      return required.match(adcode, name)
    })
    if (!hit) missing.push(required.label)
  }
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
 */
export const extractOuterRings = (geo: GeoJsonType): Ring[] => {
  const counts = new Map<string, number>()
  const edges = new Map<string, Edge>()
  const keyOf = (x1: number, y1: number, x2: number, y2: number) =>
    x1 < x2 || (x1 === x2 && y1 < y2) ? `${x1},${y1}|${x2},${y2}` : `${x2},${y2}|${x1},${y1}`

  for (const feature of geo.features) {
    for (const ring of featureRings(feature)) {
      for (let i = 0; i < ring.length - 1; i++) {
        const [x1, y1] = ring[i]
        const [x2, y2] = ring[i + 1]
        if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) continue
        const key = keyOf(x1, y1, x2, y2)
        counts.set(key, (counts.get(key) || 0) + 1)
        if (!edges.has(key)) edges.set(key, { x1, y1, x2, y2 })
      }
    }
  }

  const boundary: Edge[] = []
  for (const [key, count] of counts) if (count === 1) boundary.push(edges.get(key)!)
  if (!boundary.length) return []

  const byStart = new Map<string, Edge[]>()
  for (const edge of boundary) {
    const key = `${edge.x1},${edge.y1}`
    const list = byStart.get(key)
    if (list) list.push(edge)
    else byStart.set(key, [edge])
  }

  const used = new Set<Edge>()
  const rings: Ring[] = []
  for (const first of boundary) {
    if (used.has(first)) continue
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
  }
  return rings
};
