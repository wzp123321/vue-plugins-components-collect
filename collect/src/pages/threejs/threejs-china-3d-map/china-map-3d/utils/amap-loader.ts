/**
 * amap-loader.ts —— GeoJSON 数据加载（全国内置 + 省市懒加载 + 区县级 CDN 兜底）
 *
 * 本文件职责：
 *   - fetchChinaGeoJson：全国省级数据（随包内置 china.json）
 *   - fetchDistrictGeoJson：按 adcode 加载下一级数据（本地优先，缺失走 DataV CDN）
 *   - prefetchDistrictGeoJson：悬停时后台预取，下钻时通常已在本地
 *   - isDistrictCached / clearGeoJsonCache：缓存查询与清理
 *
 * 在整体架构中的角色：数据来源层，介于「外部数据源」与「projection / 绘制」
 *   之间。所有「下钻重建地图」的数据都从这里取。
 *
 * 协作模块：
 *   - projection.ts / drawRegion / drawOutline / spotLayer（消费 GeoJsonType）
 *   - geo.ts（checkCountryCompliance 校验全国底图）
 *
 * ⚠️ 坑：本地省级数据用 `import.meta.glob` 懒加载（Vite 为每个文件生成独立
 *   chunk），dev / 生产构建均可用；而运行态 `import('@/...')` 在生产构建会退化
 *   成 404，所以必须用 import.meta.glob 预声明，不能用动态 import 拼路径。
 * ⚠️ 约定：空结果（无下级 / 加载失败）同样入缓存——否则每次下钻都会重复打
 *   一次网络请求；并发去重：同一 adcode 的多个请求共用同一个 Promise（inflight）。
 */

import type { GeoJsonType } from '../types'
import chinaJson from '@/assets/geojson/china.json'

/**
 * 已加载的行政区数据。
 * 空结果（无下级 / 加载失败）同样入缓存 —— 否则每次下钻都会重复打一次网络请求。
 */
const cache = new Map<string, GeoJsonType>()
/** 并发去重：同一 adcode 的多个请求共用同一个 Promise */
const inflight = new Map<string, Promise<GeoJsonType>>()

const EMPTY: GeoJsonType = { type: 'FeatureCollection', features: [] }

// Vite 懒加载省级 GeoJSON：import.meta.glob 会为每个文件生成独立 chunk，
// dev / 生产构建均可用（运行态 import('@/...') 在生产构建会退化为 404）
const provinceLoaders = import.meta.glob('/src/assets/geojson/province/*.json')

/**
 * 本地 GeoJSON 加载器：
 * - 全国省级数据：随包内置（src/assets/geojson/china.json）
 * - 各省市级数据：懒加载 src/assets/geojson/province/{adcode}.json
 * - 市 → 区县级数据：本地缺失时走 DataV CDN 兜底
 */
export const fetchChinaGeoJson = async (): Promise<GeoJsonType> => chinaJson as unknown as GeoJsonType

/**
 * 加载某 adcode 的下一级数据：先看 import.meta.glob 注册的本地加载器，失败 /
 * 缺失再走 DataV CDN（{adcode}_full.json）。任何失败都返回 EMPTY 兜底。
 */
const loadDistrict = async (adcode: string): Promise<GeoJsonType> => {
  const loader = provinceLoaders[`/src/assets/geojson/province/${adcode}.json`]
  if (loader) {
    try {
      const module = (await loader()) as any
      const geo = (module.default || module) as GeoJsonType
      if (geo?.features?.length) return geo
    } catch {
      // 单文件加载失败 → 走 CDN 兜底
    }
  }

  try {
    const response = await fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`)
    if (response.ok) {
      const geo = (await response.json()) as GeoJsonType
      if (geo?.features?.length) return geo
    }
  } catch {
    // 网络不可达时静默降级为无下级数据
  }

  return EMPTY
};

/**
 * 取某 adcode 的下一级数据：优先命中缓存，其次复用并发中的 Promise，
 * 都没有才发起加载并把 Promise 记入 inflight（并发去重）。
 */
export const fetchDistrictGeoJson = async (adcode: string): Promise<GeoJsonType> => {
  const cached = cache.get(adcode)
  if (cached) return cached

  const pending = inflight.get(adcode)
  if (pending) return pending

  const task = loadDistrict(adcode).then((geo) => {
    cache.set(adcode, geo)
    inflight.delete(adcode)
    return geo
  })
  inflight.set(adcode, task)
  return task
};

/** 该 adcode 的数据是否已在缓存中（用于判断是否值得预取） */
export const isDistrictCached = (adcode: string): boolean => cache.has(adcode)

/**
 * 后台预取：不抛错、不阻塞，命中缓存直接跳过。
 * 悬停某个行政区时调它，等用户真正双击下钻时数据通常已在本地。
 */
export const prefetchDistrictGeoJson = (adcode: string): void => {
  if (!adcode || cache.has(adcode) || inflight.has(adcode)) return
  // 后台预取：结果无需等待，只吞掉可能的网络异常，避免未处理拒绝
  fetchDistrictGeoJson(adcode).catch(() => undefined)
};

/** 清空数据缓存与并发记录（切换 / 重置地图时调用） */
export const clearGeoJsonCache = (): void => {
  cache.clear()
  inflight.clear()
};
