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
export const fetchChinaGeoJson = async (): Promise<GeoJsonType> => {
  return chinaJson as unknown as GeoJsonType
};

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
export const isDistrictCached = (adcode: string): boolean => {
  return cache.has(adcode)
};

/**
 * 后台预取：不抛错、不阻塞，命中缓存直接跳过。
 * 悬停某个行政区时调它，等用户真正双击下钻时数据通常已在本地。
 */
export const prefetchDistrictGeoJson = (adcode: string): void => {
  if (!adcode || cache.has(adcode) || inflight.has(adcode)) return
  void fetchDistrictGeoJson(adcode).catch(() => undefined)
};

export const clearGeoJsonCache = (): void => {
  cache.clear()
  inflight.clear()
};
