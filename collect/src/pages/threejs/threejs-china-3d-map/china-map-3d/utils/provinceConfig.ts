/**
 * 省份下钻参数：根据 GeoJSON 数据动态计算缩放距离和世界坐标中心，并缓存。
 */

import * as THREE from 'three'
import * as d3 from 'd3'
import type { GeoJsonType } from '../types'
import { computeFeatureWorldCentroid, computeProjectedBounds } from './polygonCentroid'

export interface DrillParams {
  zoom: number
  centerX: number
  centerY: number
}

const cache = new Map<string, DrillParams>()

export const DRILL_TWEAKS: Record<number, { zoomOffset?: number; yOffset?: number }> = {}

function findConeWorldPos(mapObject3D: THREE.Object3D, adcode: number): THREE.Vector3 | null {
  let result: THREE.Vector3 | null = null
  mapObject3D.traverse((child) => {
    if (result) return
    const obj = child as any
    if (obj.isObject3D && obj.scale && Math.abs(obj.scale.x - 0.6) < 0.01 && Math.abs(obj.scale.z - 1.2) < 0.01) {
      let parent = obj.parent
      while (parent) {
        if ((parent as any).customProperties?.adcode === adcode) {
          result = new THREE.Vector3()
          obj.getWorldPosition(result)
          return
        }
        parent = parent.parent
      }
    }
  })
  return result
}

export function computeDrillParams(
  adcode: string,
  geoJson: GeoJsonType,
  countryCenter: [number, number],
  countryScale: number,
  mapObject3D: THREE.Object3D,
  level?: string,
): DrillParams {
  const cached = cache.get(adcode)
  if (cached) return cached

  const proj = d3.geoMercator().center(countryCenter).scale(countryScale).translate([0, 0])
  const feature = geoJson.features.find((f: any) => f.properties.adcode === Number(adcode))

  if (!feature) {
    // 特征不存在时返回默认值
    return { zoom: 40, centerX: 0, centerY: 0 }
  }

  // 使用多边形几何计算包围盒（替代原来的坐标遍历）
  const bounds = computeProjectedBounds(feature, ([lng, lat]) => {
    const [x, y]: any = proj([lng, lat])
    return [x, y]
  })

  // 将投影坐标换算为世界空间尺寸（考虑 mapObject3D 缩放）
  const mapScale = Math.max(mapObject3D.scale.x, mapObject3D.scale.y, 1)
  const pDiag = (bounds?.diagonal ?? 100) * mapScale

  // 区级下钻：面积越小填充率越高，实现"面积越小放大越大"
  let zoom: number
  if (level === 'district' && bounds) {
    const area = bounds.width * bounds.height
    // 填充率 1.0（极小面积 ~0.05）→ 0.7（大面积 ~5+），线性插值
    const targetFill = 1.0 - Math.min(0.3, Math.max(0, area * 0.06))
    // 相机到表面距离 = zoom（target 已贴齐表面 z=mapDepth）
    // visibleHeight = 2 * zoom * tan(FOV/2) = 0.536 * zoom（FOV=30°）
    // featureHeight / visibleHeight = targetFill → zoom = featureHeight / (targetFill * 0.536)
    const featureHeight = bounds.height * mapScale
    zoom = featureHeight / (targetFill * 0.536)
  } else {
    // 省级/市级沿用 pDiag 比例公式，市级 zoomMul 从 0.5 提至 0.8 避免过度贴近
    const zoomMul = level === 'province' ? 1.1 : 0.8
    zoom = pDiag * zoomMul + 0.8
  }
  zoom = Math.max(0.1, Math.min(200, zoom))

  // 优先使用 cone 世界位置，回退到多边形质心算法
  const conePos = findConeWorldPos(mapObject3D, Number(adcode))
  let centerX: number, centerY: number

  if (conePos) {
    centerX = conePos.x
    centerY = conePos.y
  } else if (bounds) {
    // 使用包围盒中心（对顶点密度不敏感，视觉更居中）
    const bcx = (bounds.minX + bounds.maxX) / 2
    const bcy = (bounds.minY + bounds.maxY) / 2
    const s = mapObject3D.scale
    const mp = mapObject3D.position
    centerX = bcx * s.x + mp.x
    centerY = bcy * s.y + mp.y
  } else {
    // 回退：使用多边形质心算法
    ;[centerX, centerY] = computeFeatureWorldCentroid(feature, ([lng, lat]) => {
      const [x, y]: any = proj([lng, lat])
      return [x, y]
    }, mapObject3D)
  }

  // 下钻后摄像机完全俯视，多边形中心与屏幕中心重合，无需深度偏移补偿
  const tweak = DRILL_TWEAKS[Number(adcode)] || {}
  const result: DrillParams = {
    zoom: zoom + (tweak.zoomOffset || 0),
    centerX,
    centerY: centerY + (tweak.yOffset || 0),
  }
  cache.set(adcode, result)
  return result
}

export function clearDrillCache() { cache.clear() }
