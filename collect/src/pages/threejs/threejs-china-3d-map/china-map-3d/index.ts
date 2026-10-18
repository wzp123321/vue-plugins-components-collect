export { default as ChinaMap3D } from './components/ChinaMap3D.vue'
export { default as MapSearchBox } from './components/MapSearchBox.vue'
export type { SearchItem } from './components/MapSearchBox.vue'
export {
  fetchChinaGeoJson,
  fetchDistrictGeoJson,
  prefetchDistrictGeoJson,
  isDistrictCached,
  clearGeoJsonCache,
} from './utils/amap-loader'
export { checkCountryCompliance } from './utils/geo'
export type { ComplianceReport } from './utils/geo'
export type { GeoJsonType, GeoJsonFeature, GeoLevel } from './types'
export type { MapLevel } from './composables/useMapLayer'
export type { FitProjection } from './utils/projection'
