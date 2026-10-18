import * as d3 from 'd3'
import type { GeoJsonType } from '../types'
import { focusRings } from './geo'
import type { Ring } from './geo'

export type ProjectionFn = (coord: [number, number]) => [number, number]

export interface FitBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
  /** 投影包围盒中心（世界坐标，y 轴与屏幕一致向下） */
  cx: number
  cy: number
}

export interface FitProjection {
  center: [number, number]
  scale: number
  bounds: FitBounds
}

/** 统一世界尺度：任意层级投影后的最大边长都归一到该值 */
export const MAP_EXTENT = 130

const FALLBACK: FitProjection = {
  center: [104, 37],
  scale: 120,
  bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 1, height: 1, cx: 0, cy: 0 },
}

const makeProjection = (center: [number, number], scale: number) => {
  return d3.geoMercator().center(center).scale(scale).translate([0, 0]) as any
};

const boundsOf = (rings: Ring[], proj: any, step = 1): FitBounds => {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i += step) {
      const point = proj(ring[i])
      if (!point) continue
      const x = point[0]
      const y = -point[1]
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  if (!Number.isFinite(minX)) return FALLBACK.bounds
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(1e-6, maxX - minX),
    height: Math.max(1e-6, maxY - minY),
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
  }
};

/**
 * 为任意层级 GeoJSON 计算自适应墨卡托投影：
 * 迭代 3 次把投影包围盒中心移到原点、最大边长归一到 MAP_EXTENT。
 * 这样全国 / 省 / 市三级的世界尺度一致 —— 拉伸厚度、数据柱尺寸、
 * 飞线弧度、相机距离都可以沿用同一套数值。
 */
export const fitProjection = (geo: GeoJsonType, extent = MAP_EXTENT): FitProjection => {
  const rings = focusRings(geo)
  if (!rings.length) return FALLBACK

  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i += 2) {
      const [lng, lat] = ring[i]
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
      if (lng < minLng) minLng = lng
      if (lng > maxLng) maxLng = lng
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
    }
  }

  let center: [number, number] = [(minLng + maxLng) / 2, (minLat + maxLat) / 2]
  let scale = 100
  let bounds = boundsOf(rings, makeProjection(center, scale), 2)

  for (let iteration = 0; iteration < 3; iteration++) {
    const proj = makeProjection(center, scale)
    bounds = boundsOf(rings, proj, 2)
    scale *= extent / Math.max(bounds.width, bounds.height, 1e-6)
    // bounds 用的是「y 向上」的世界坐标，反投影时要还原成 d3 的屏幕 y（向下）
    const mid = proj.invert([(bounds.minX + bounds.maxX) / 2, -(bounds.minY + bounds.maxY) / 2])
    if (mid && Number.isFinite(mid[0]) && Number.isFinite(mid[1])) center = [mid[0], mid[1]]
  }

  bounds = boundsOf(rings, makeProjection(center, scale), 1)
  return { center, scale, bounds }
};

/** 由投影参数生成投影函数：输出 [x, y]，y 向下（与 d3 屏幕坐标系一致） */
export const createProjection = (center: [number, number], scale: number): ProjectionFn => {
  const proj = makeProjection(center, scale)
  return (coord) => proj(coord) as [number, number]
};
