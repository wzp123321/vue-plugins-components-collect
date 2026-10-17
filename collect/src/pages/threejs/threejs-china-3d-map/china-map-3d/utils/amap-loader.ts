import type { GeoJsonType } from '../types'
import chinaJson from '@/assets/geojson/china.json'

const cache = new Map<string, GeoJsonType>()

// Vite 懒加载省级 GeoJSON：import.meta.glob 会为每个文件生成独立 chunk，
// dev / 生产构建均可用（运行态 import('@/...') 在生产构建会退化为 404）
const provinceLoaders = import.meta.glob('/src/assets/geojson/province/*.json')

/**
 * 本地 GeoJSON 加载器：
 * - 全国省级数据：随包内置（src/assets/geojson/china.json）
 * - 各省市级数据：懒加载 src/assets/geojson/province/{adcode}.json
 * - 市 → 区县级数据：本地缺失时走 DataV CDN 兜底
 */
export async function fetchChinaGeoJson(): Promise<GeoJsonType> {
  return chinaJson as unknown as GeoJsonType
}

export async function fetchDistrictGeoJson(adcode: string): Promise<GeoJsonType> {
  const cached = cache.get(adcode)
  if (cached) return cached

  const loader = provinceLoaders[`/src/assets/geojson/province/${adcode}.json`]
  if (loader) {
    try {
      const module = (await loader()) as any
      const geo = (module.default || module) as GeoJsonType
      cache.set(adcode, geo)
      return geo
    } catch {
      // 单文件加载失败 → 走 CDN 兜底
    }
  }

  try {
    const response = await fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`)
    if (response.ok) {
      const geo = (await response.json()) as GeoJsonType
      cache.set(adcode, geo)
      return geo
    }
  } catch {
    // 网络不可达时静默降级为无下级数据
  }

  return { type: 'FeatureCollection', features: [] }
}

export function clearGeoJsonCache(): void {
  cache.clear()
}
