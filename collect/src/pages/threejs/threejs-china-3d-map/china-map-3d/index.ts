/**
 * index.ts —— 3D 中国地图模块对外出口
 *
 * 本文件职责：
 *   把地图组件（ChinaMap3D / MapSearchBox）、数据加载、合规校验、核心类型
 *   统一从这里导出，作为整个 china-map-3d 子系统的公共 API 面。
 *
 * 在整体架构中的角色：模块门面（barrel）。上游页面只需从本文件 import，
 *   无需关心内部 utils / components 的目录结构。
 *
 * 协作模块：所有对外能力的最终汇聚点。
 */

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
