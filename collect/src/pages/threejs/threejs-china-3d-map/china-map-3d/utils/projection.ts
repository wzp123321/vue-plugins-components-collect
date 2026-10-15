import type { GeoJsonType } from '../types'

/**
 * 从 GeoJSON 计算 Mercator 投影参数。
 * 纯计算，无 DOM/WebGL 依赖，未来可移入 Web Worker。
 */
export function computeProjectionParams(geoJson: GeoJsonType): {
  scale: number
  center: [number, number]
} {
  let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90
  try {
    for (const feature of geoJson.features) {
      function visit(pt: any) {
        if (typeof pt[0] === 'number') {
          const lng = pt[0], lat = pt[1]
          if (lng < minLng) minLng = lng
          if (lng > maxLng) maxLng = lng
          if (lat < minLat) minLat = lat
          if (lat > maxLat) maxLat = lat
        } else if (Array.isArray(pt[0])) {
          pt.forEach(visit)
        }
      }
      visit(feature.geometry.coordinates)
    }
  } catch {
    return { scale: 350, center: [104, 37] }
  }

  const extent = Math.max(maxLng - minLng, maxLat - minLat) || 1
  const scale = Math.max(150, Math.min(5000, Math.round(5500 / extent)))
  const center: [number, number] = [(minLng + maxLng) / 2, (minLat + maxLat) / 2]
  return { scale, center }
}
