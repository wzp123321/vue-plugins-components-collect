import type { GeoJsonType } from '../types'
import chinaJson from '@/assets/geojson/china.json'

const geoJsonCache = new Map<string, GeoJsonType>()

/**
 * 本地 GeoJSON 加载器（替代原高德 AMap DistrictExplorer）。
 * - 全国省级数据：已打包在 src/assets/geojson/china.json（静态导入）
 * - 各省市级数据：懒加载 src/assets/geojson/province/{adcode}.json
 * 完全不依赖高德 Key / 在线服务，离线可用。
 */

// 兼容原 ChinaMap3D 中的 loadAmapScript() 调用：此处无需加载任何脚本，直接 resolve。
export async function loadAmapScript(): Promise<void> {
  return
}

export async function fetchChinaGeoJson(): Promise<GeoJsonType> {
  return chinaJson as unknown as GeoJsonType
}

export async function fetchDistrictGeoJson(adcode: string): Promise<GeoJsonType> {
  const cacheKey = adcode
  if (geoJsonCache.has(cacheKey)) {
    return geoJsonCache.get(cacheKey)!
  }
  try {
    const mod = await import(`@/assets/geojson/province/${adcode}.json`)
    const geo = (mod.default || mod) as GeoJsonType
    geoJsonCache.set(cacheKey, geo)
    return geo
  } catch {
    // 部分 adcode（如台湾 710000）无市级数据，下钻时静默降级
    return { type: 'FeatureCollection', features: [] }
  }
}

export function clearGeoJsonCache(): void {
  geoJsonCache.clear()
}
