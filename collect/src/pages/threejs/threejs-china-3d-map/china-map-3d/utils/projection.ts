/**
 * projection.ts —— 地理坐标 → 世界坐标的投影层（地图几何基石）
 *
 * 本文件职责：
 *   把任意层级的 GeoJSON（全国 / 省 / 市）投影成统一的「世界平面坐标」，
 *   并让任意层级投影后最大边长都归一到同一个世界尺度 MAP_EXTENT，
 *   从而三级地图可以共用同一套相机距离、板块拉伸厚度、数据柱尺寸与飞线弧度。
 *
 * 在整体架构中的角色：
 *   所有绘制模块（drawRegion / drawOutline / spotLayer / drawFlyLine）
 *   都依赖这里产出的 projection 函数与 FitBounds，是「下钻重建地图」的几何基础。
 *
 * 协作模块：
 *   - geo.ts（focusRings 提供取景主体环）
 *   - drawRegion / drawOutline / spotLayer / drawFlyLine（消费投影结果）
 *
 * 架构约定（关键）：
 *   ⚠️ 下钻 = 重建地图。fitProjection() 把任意层级 GeoJSON 投影后最大边长
 *   归一到 MAP_EXTENT=130 世界单位，全国 / 省 / 市三级共用同一套相机距离、
 *   拉伸厚度、柱体尺寸与飞线弧度，切换层级时无需重新调参。
 *
 * 坐标约定（关键）：
 *   本文件输出的世界坐标 y 轴向下（与 d3 屏幕坐标系一致）。
 *   d3 投影返回的屏幕 y 也向下，绘制时若要「z 朝上」的世界系，需写 (x, -y, z)。
 *   两处符号务必一致，否则地图会上下颠倒。
 */

import * as d3 from 'd3'
import type { GeoJsonType } from '../types'
import { focusRings } from './geo'
import type { Ring } from './geo'

/**
 * 投影函数类型：经纬度 [lng, lat] → 世界平面 [x, y]（y 向下）。
 * 由各层级 fitProjection 结果经 createProjection 生成后传入所有绘制模块。
 */
export type ProjectionFn = (coord: [number, number]) => [number, number]

/** 投影后包围盒（世界坐标，y 向下） */
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

/** 一次投影拟合结果：投影中心、缩放系数、投影后包围盒 */
export interface FitProjection {
  center: [number, number]
  scale: number
  bounds: FitBounds
}

/**
 * 统一世界尺度：任意层级投影后的最大边长都归一到该值。
 *
 * ⚠️ 架构约定：这是「下钻重建地图」能共用一套视觉参数的前提。全国 / 省 / 市
 * 三级经过 fitProjection 后最大边长都 = MAP_EXTENT，因此相机距离、depth、
 * 柱体尺寸、飞线弧度全部可以写死而不用按层级分支。
 */
export const MAP_EXTENT = 130

/**
 * 取景失败时的兜底投影参数（全国大致中心 + 一个保守缩放）。
 * center=[104,37] 大致是中国地理中心，scale=120 保证兜底也有合理范围，
 * 不至于把地图拍成一个点。bounds 用最小非 0 尺寸避免后续除零。
 */
const FALLBACK: FitProjection = {
  center: [104, 37],
  scale: 120,
  bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 1, height: 1, cx: 0, cy: 0 },
}

/**
 * 构造一个 d3 墨卡托投影器：
 *   center 锁定经纬度中心，scale 控制缩放，translate=[0,0]（居中交给后续
 *   bounds 反算，不在投影器里平移，避免双重偏移导致地图偏离原点）。
 * 返回 any 是因为 d3 类型对 invert() 支持较松，调用方已知其具体形状。
 */
const makeProjection = (center: [number, number], scale: number) =>
  d3.geoMercator().center(center).scale(scale).translate([0, 0]) as any

/**
 * 计算一组环在投影下的包围盒（世界坐标，y 向下）。
 * @param rings 参与计算的环（一般来自 focusRings）
 * @param proj  d3 投影器
 * @param step  采样步长，默认 1（逐点）；fitProjection 内部先用 2 粗采样提速
 * @returns FitBounds；若全部不可投影则返回 FALLBACK.bounds
 *
 * ⚠️ 坑：d3 返回的屏幕 y 向下，这里统一取负 `y = -point[1]` 以转换成
 *   「y 向上」的世界坐标。后续 drawRegion / spotLayer 里写 (x, -y, z) 正是为了
 *   再把屏幕系翻回朝上；两处符号务必一致，否则地图会上下颠倒。
 */
const boundsOf = (rings: Ring[], proj: any, step = 1): FitBounds => {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  rings.forEach((ring) => {
    for (let i = 0; i < ring.length; i += step) {
      const point = proj(ring[i])
      if (point) {
        const x = point[0]
        const y = -point[1]
        if (Number.isFinite(x) && Number.isFinite(y)) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }
  })
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
 *
 * 算法要点：
 *   1) 先用原始经纬度 lng/lat 的几何中心作为初值 center、scale=100 做一次粗投影；
 *   2) 迭代 3 次：用当前 center/scale 投影，按「最大边长 / MAP_EXTENT」修正 scale，
 *      再用 proj.invert 把包围盒中心反投影成新的 center（把中心拉回原点）；
 *   3) 末次用 step=1 逐点精算包围盒返回。
 *
 * ⚠️ 架构约定：下钻 = 重建地图。本函数把任意层级都归一到 MAP_EXTENT=130，
 *   故三级共用同一套相机距离、拉伸厚度、柱体尺寸与飞线弧度，无需分支。
 * ⚠️ 坑：反投影时传入的是「y 向上」的世界坐标，必须还原成 d3 的屏幕 y（向下），
 *   即 `-(minY+maxY)/2`，否则 center 会沿 y 轴镜像，地图整体错位。
 */
export const fitProjection = (geo: GeoJsonType, extent = MAP_EXTENT): FitProjection => {
  const rings = focusRings(geo)
  if (!rings.length) return FALLBACK

  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity
  rings.forEach((ring) => {
    for (let i = 0; i < ring.length; i += 2) {
      const [lng, lat] = ring[i]
      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        if (lng < minLng) minLng = lng
        if (lng > maxLng) maxLng = lng
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
      }
    }
  })

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

/**
 * 由投影参数生成投影函数：输出 [x, y]，y 向下（与 d3 屏幕坐标系一致）。
 * 供所有绘制模块逐点投影经纬度使用。
 */
export const createProjection = (center: [number, number], scale: number): ProjectionFn => {
  const proj = makeProjection(center, scale)
  return (coord) => proj(coord) as [number, number]
};
