/**
 * types/index.ts —— 地图核心类型定义
 *
 * 本文件职责：
 *   定义全局通用的地理层级、GeoJSON 结构、Feature 属性与几何坐标的 TS 类型。
 *   是 projection / geo / amap-loader / spot 等模块的共享类型来源。
 *
 * 在整体架构中的角色：类型契约层。所有模块 import 这里的 GeoJsonType /
 *   GeoJsonFeature / GeoLevel，保证「数据 → 投影 → 绘制」类型连贯。
 *
 * ⚠️ 语义约定：properties.center 是主城区 / 政府驻点坐标（标记锚点基准），
 *   不是几何中心；properties.centroid 才是几何质心。标记位置用 center，不要
 *   直接用 centroid（质心可能落在山区 / 湖中无人区）。锚点回拉逻辑见 anchor.ts。
 */

export type GeoLevel = 'country' | 'province' | 'city' | 'district'

export type GeometryType =
  | 'Point'
  | 'LineString'
  | 'Polygon'
  | 'MultiPoint'
  | 'MultiLineString'
  | 'MultiPolygon'
  | 'GeometryCollection'

/**
 * 几何坐标：按几何类型映射成对应层级的 [lng, lat] 嵌套结构。
 * Polygon = [ring][point]，MultiPolygon = [polygon][ring][point]，依此类推。
 */
export type GeometryCoordinates<T extends GeometryType> = T extends 'Point'
  ? [number, number]
  : T extends 'LineString'
  ? [number, number][]
  : T extends 'Polygon'
  ? [number, number][][]
  : T extends 'MultiPoint'
  ? [number, number][]
  : T extends 'MultiLineString'
  ? [number, number][][]
  : T extends 'MultiPolygon'
  ? [number, number][][][]
  : T extends 'GeometryCollection'
    ? any
    : never

export interface GeoJsonFeature {
  type: 'Feature'
  properties: {
    /** 行政区编码 */
    adcode: number
    name: string
    /** 主城区 / 政府驻点坐标 [lng, lat]（标记锚点基准，不是几何中心） */
    center: [number, number]
    /** 几何质心 [lng, lat]（仅当 center 贴边时用于回拉） */
    centroid: [number, number]
    /** 下级行政区数量 */
    childrenNum: number
    level: GeoLevel
    parent: {
      adcode: number
    }
    /** DataV 内部索引 */
    subFeatureIndex: number
    /** 祖先 adcode 链 */
    acroutes: number[]
    adchar: null
  }
  geometry: {
    type: GeometryType
    coordinates: GeometryCoordinates<GeometryType>
  }
}

export interface GeoJsonType {
  type: 'FeatureCollection'
  features: GeoJsonFeature[]
}

