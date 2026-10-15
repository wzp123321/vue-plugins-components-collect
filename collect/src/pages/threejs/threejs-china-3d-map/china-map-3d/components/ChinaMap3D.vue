<template>
  <div class="china-map-3d-wrapper">
    <div class="china-map-3d-canvas" ref="canvasRef"></div>
    <div class="china-map-3d-labels" ref="labelsRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import gsap from 'gsap'
import * as d3 from 'd3'
import { loadAmapScript, fetchChinaGeoJson, fetchDistrictGeoJson } from '../utils/amap-loader'
import { initScene } from '../utils/scene'
import { initCamera } from '../utils/camera'
import { mapConfig } from '../utils/mapConfig'
import { disposeObject3D } from '../utils/dispose'

import {
  generateMapObject3D,
  getDynamicMapScale,
  drawLineBetween2Spot,
  setFlyLineResolution,
} from '../utils/drawFunc'
import { createSpotGroup } from './MapSpot'
import type { SpotItem } from './MapSpot'
import { createZoomWatcher } from '../composables/zoomWatcher'
import { createMapInteraction } from '../composables/mapInteraction'
import { createStarfield } from '../composables/starfield'
import { computeDrillParams, clearDrillCache } from '../utils/provinceConfig'
import { extractRing } from '../utils/polygonCentroid'
import { computeProjectedArea, pointInPolygon, distributeSpiral } from '../utils/mapMarkerUtils'
import type { GeoJsonFeature, GeoJsonType } from '../types'

const props = withDefaults(defineProps<{
  initialAdcode?: string
  modelPath?: string
  maxDrillLevel?: 'province' | 'city'
  zoomDrillEnabled?: boolean
  zoomDrillThreshold?: number
  deferEntrance?: boolean
  projectData?: Record<number, number | { count: number; names: string[]; ids: string[] }>
}>(), {
  maxDrillLevel: 'province',
  zoomDrillEnabled: true,
  zoomDrillThreshold: 0.4,
  deferEntrance: false,
})

const emit = defineEmits<{
  (e: 'drill-down', properties: GeoJsonFeature['properties']): void
  (e: 'ready'): void
  (e: 'geo-data-loaded', geoJson: GeoJsonType): void
  (e: 'reset-to-country', keepDistrict?: boolean): void
  (e: 'entrance-complete'): void
}>()

const canvasRef = ref<HTMLDivElement | null>(null)
const labelsRef = ref<HTMLDivElement | null>(null)

// ── Three.js 核心对象 ──
let starfield: ReturnType<typeof createStarfield> | null = null
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let labelRenderer: CSS2DRenderer
let composer: EffectComposer | null = null
let bloomComposer: EffectComposer | null = null
// 选择性辉光图层：仅飞线/彗星置于该图层，避免地图与打点溢光
const BLOOM_SCENE = 1
const bloomLayer = new THREE.Layers()
bloomLayer.set(BLOOM_SCENE)
let controls: OrbitControls
let raycaster: THREE.Raycaster
let pointer: THREE.Vector2

// ── 地图状态 ──
let mapObject3D: THREE.Object3D | null = null
let cityLinesGroup: THREE.Group | null = null
let districtLinesGroup: THREE.Group | null = null
let _drilledDist = 0
let _drillLevel: 'province' | 'city' | null = null
let _provinceAreaMap = new Map<number, number>()
let _maxProvinceArea = 0
let selectedAdcode: number | null = null
let currentGeoJson: GeoJsonType | null = null
let countryGeoJsonCache: GeoJsonType | null = null
let spotGroup: THREE.Object3D | null = null
let spotList: any[] = []
let flyGroup: THREE.Group | null = null
let flySpots: any[] = []
let bgTexture: THREE.Texture | null = null
let projectionFnParam = { center: [104.0, 37.0] as [number, number], scale: 120 }
// 拉伸状态：记录入场后的基础 scale/position，恢复时用
let _baseMapScaleX = 1, _baseMapScaleY = 1
let _baseMapPosX = 0, _baseMapPosY = 0
let _provinceAreaFactor = 1  // 当前下钻省份的面积因子，二级标记继承

// 兼容新旧 projectData 格式
function _getCount(v: number | { count: number; names?: string[]; ids?: string[] } | undefined): number {
  if (v == null) return 0; return typeof v === 'number' ? v : v.count
}
function _getNames(v: number | { count: number; names?: string[]; ids?: string[] } | undefined): string[] {
  if (v == null) return []; return typeof v === 'number' ? [] : (v.names || [])
}
function _getIds(v: number | { count: number; names?: string[]; ids?: string[] } | undefined): string[] {
  if (v == null) return []; return typeof v === 'number' ? [] : (v.ids || [])
}

// ── 渲染循环状态 ──
let animFrameId = 0
let isDisposed = false
let resizeThrottleId = 0
let isEntranceAnimating = false

// ── Composables ──
const zoomWatcher = createZoomWatcher()
const cityZoomWatcher = createZoomWatcher()
const mapInteraction = createMapInteraction()

// ── 事件处理函数引用 ──
let onResizeEvent: () => void = () => {}
let onMouseMoveEvent: (e: MouseEvent) => void = () => {}
let onClickEvent: (e: MouseEvent) => void = () => {}
let onMouseDownEvent: (e: MouseEvent) => void = () => {}
let onVisibilityChange: () => void = () => {}

/** 异步绘制子区域界线。switchGeo 为 false 时只画线不切换 GeoJSON（用于市级下钻） */
async function drawCityBorders(adcode: number, switchGeo = true) {
  try {
    const geo = await fetchDistrictGeoJson(String(adcode))
    if (!geo || !mapObject3D) return
    const { LineGeometry } = await import('three/examples/jsm/lines/LineGeometry.js')
    const { Line2 } = await import('three/examples/jsm/lines/Line2.js')
    const { LineMaterial } = await import('three/examples/jsm/lines/LineMaterial.js')
    const mat = new (LineMaterial as any)({ color: 0x2FC0FF, linewidth: 2 }) as any
    mat.resolution.set(renderer.domElement.width, renderer.domElement.height)
    const proj = d3.geoMercator().center(projectionFnParam.center).scale(projectionFnParam.scale).translate([0, 0])

    if (switchGeo) {
      // 省级下钻：清除旧界线，创建市级轮廓
      if (cityLinesGroup) { mapObject3D?.remove(cityLinesGroup); cityLinesGroup = null }
      if (districtLinesGroup) { mapObject3D?.remove(districtLinesGroup); districtLinesGroup = null }
      cityLinesGroup = new THREE.Group()
    } else {
      // 市级下钻：保留市级轮廓（含高亮），新建区级轮廓到独立 group
      if (districtLinesGroup) { mapObject3D?.remove(districtLinesGroup); districtLinesGroup = null }
      districtLinesGroup = new THREE.Group()
    }
    const targetGroup = switchGeo ? cityLinesGroup! : districtLinesGroup!

    for (const f of geo.features) {
      // 每个子区域用 group 包裹并标记 customProperties，支持高亮选中
      const regionGroup = new THREE.Group()
      ;(regionGroup as any).customProperties = f.properties
      const coords = f.geometry.coordinates
      const drawRing = (ring: [number, number][]) => {
        const pts: number[] = []
        for (const [lng, lat] of ring) { const [x, y]: any = proj([lng, lat]); pts.push(x, -y, mapConfig.topLineZIndex) }
        const g = new (LineGeometry as any)(); g.setPositions(pts)
        regionGroup.add(new (Line2 as any)(g, mat) as any)
      }
      if (f.geometry.type === 'MultiPolygon') for (const p of coords as [number, number][][][]) { if (p[0]) drawRing(p[0]) }
      else if (f.geometry.type === 'Polygon') { const r = coords as [number, number][][]; if (r[0]) drawRing(r[0]) }
      targetGroup.add(regionGroup)
    }
    mapObject3D.add(targetGroup)
    if (switchGeo) {
      currentGeoJson = geo
      refreshMarkers()
      emit('geo-data-loaded', geo)
    }
  } catch { /* ignore */ }
}

async function handleDrillDown(
  properties: GeoJsonFeature['properties'],
  hit?: { point: THREE.Vector3; object: THREE.Object3D },
) {
  // 点击地图区域：从命中点反查所属行政区划
  // 全国视图：查全国 GeoJSON → 省份下钻
  // 省级下钻后：先查全国 GeoJSON（跨省切换），再查省内 GeoJSON（市/区切换）
  // 市级下钻后：先查全国 GeoJSON（跨省切换），再查省内 GeoJSON（跨市/区切换）
  if (hit && !(hit.object.userData as any)?.isSpot && mapObject3D) {
    const mp = mapObject3D.position
    const s = mapObject3D.scale
    // 世界坐标 → 投影坐标（geometry 使用 x, -y）
    const px = (hit.point.x - mp.x) / s.x
    const py = -(hit.point.y - mp.y) / s.y
    const proj = d3.geoMercator().center(projectionFnParam.center).scale(projectionFnParam.scale).translate([0, 0])
    // 查找顺序：先查当前 GeoJSON（省内市/区优先），再查全国 GeoJSON（跨省切换）
    const geoJsons = [currentGeoJson, countryGeoJsonCache].filter(Boolean) as GeoJsonType[]
    let found = false
    for (const geo of geoJsons) {
      if (found) break
      for (const f of geo.features) {
        const ring = extractRing(f)
        if (!ring || ring.length < 3) continue
        const projRing = ring.map(([lng, lat]) => { const [x, y]: any = proj([lng, lat]); return [x, y] as [number, number] })
        if (pointInPolygon(px, py, projRing)) {
          properties = { ...f.properties }
          found = true
          break
        }
      }
    }
  }

  if (props.maxDrillLevel === 'province' && (properties.level === 'city' || properties.level === 'district')) return

  // 终端节点判断：
  // - 省级下钻后的子区域（含直辖市辖区）即使 childrenNum=0 也支持二次下钻
  // - 点击地图区域（非标记）时，允许在同级下钻间切换（如直辖市内跨区切换）
  // - 只有通过标记点击或编程触发（无 hit）时，childrenNum=0 才是真正的终端节点
  const isMapRegionClick = hit && !(hit.object.userData as any)?.isSpot
  if (!properties.childrenNum && _drillLevel !== 'province' && !isMapRegionClick) {
    emit('drill-down', properties)
    return
  }

  emit('drill-down', properties)

  // 下钻时立即移除当前区域标记（环+锥），避免随地图拉伸而放大
  if (spotGroup) {
    const children = [...spotGroup.children]
    for (let i = 0; i < children.length; i++) {
      let found = false
      children[i].traverse((c: any) => { if (c.customProperties?.adcode === properties.adcode) found = true })
      if (found) {
        spotGroup.remove(children[i])       // 环的 spotGroup
        if (i + 1 < children.length) spotGroup.remove(children[i + 1])  // 锥的 markerGroup
        break
      }
    }
  }

  // 所有有子区域的层级都执行飞入：省级 → 市级边界，市级 → 区级边界
  isEntranceAnimating = true
  // 省级下钻需要先恢复到国家 GeoJSON 以便 computeDrillParams 查找省份特征
  // 市级下钻保留当前省级 GeoJSON（含城市特征），不要复位
  if (properties.level === 'province' && countryGeoJsonCache) currentGeoJson = countryGeoJsonCache

  // 恢复上一个选中省的线条（创建新默认材质，避免引用混乱）
  if (selectedAdcode != null && mapObject3D) {
    mapObject3D.traverse((c) => {
      const obj = c as any
      if (obj.customProperties?.adcode === selectedAdcode) {
        obj.traverse((child: any) => {
          if (child.isLine2) {
            const restoreMat = new (LineMaterial as any)({ color: mapConfig.topLineColor, linewidth: mapConfig.topLineWidth })
            restoreMat.resolution.set(renderer.domElement.width, renderer.domElement.height)
            child.material = restoreMat
          }
        })
      }
    })
  }

  // 高亮新选中省的线条
  selectedAdcode = properties.adcode
  const highlightMat = new (LineMaterial as any)({ color: mapConfig.selectedLineColor, linewidth: mapConfig.selectedLineWidth })
  highlightMat.resolution.set(renderer.domElement.width, renderer.domElement.height)
  if (mapObject3D) {
    mapObject3D.traverse((c) => {
      const obj = c as any
      if (obj.customProperties?.adcode === selectedAdcode) {
        obj.traverse((child: any) => {
          if (child.isLine2) child.material = highlightMat
        })
      }
    })
  }

  // 计算前临时恢复 base scale/position，防止拉伸后的值污染 center 计算
  let _savedScaleX = 1, _savedScaleY = 1, _savedPosX = 0, _savedPosY = 0
  if (mapObject3D) {
    _savedScaleX = mapObject3D.scale.x; _savedScaleY = mapObject3D.scale.y
    _savedPosX = mapObject3D.position.x; _savedPosY = mapObject3D.position.y
    mapObject3D.scale.set(_baseMapScaleX, _baseMapScaleY, 1)
    mapObject3D.position.set(_baseMapPosX, _baseMapPosY, mapObject3D.position.z)
  }
  const cfg = currentGeoJson && mapObject3D ? computeDrillParams(
    String(properties.adcode),
    currentGeoJson,
    projectionFnParam.center,
    projectionFnParam.scale,
    mapObject3D,
    properties.level,
  ) : null
  // 恢复拉伸状态（如果有的话），后续动画从当前值出发
  if (mapObject3D) {
    mapObject3D.scale.set(_savedScaleX, _savedScaleY, 1)
    mapObject3D.position.set(_savedPosX, _savedPosY, mapObject3D.position.z)
  }
  const targetX = cfg?.centerX ?? 0
  const targetY = cfg?.centerY ?? 0
  const rawZoom = cfg?.zoom ?? 40

  // ── pivot 拉伸：非省级目标，按多边形实际尺寸计算拉伸倍数 ──
  const SAFE_DIST = 1.5   // 拉伸时 camera 安全距离
  const TARGET_FILL = 3.4  // 目标填充率（小区域溢出屏幕 3.4x）
  let stretchS = 1
  if (properties.level !== 'province' && currentGeoJson) {
    const stretchFeature = currentGeoJson.features.find((f: any) => f.properties.adcode === Number(properties.adcode))
    if (stretchFeature) {
      const ring = extractRing(stretchFeature)
      if (ring && ring.length >= 3) {
        const proj = d3.geoMercator().center(projectionFnParam.center).scale(projectionFnParam.scale).translate([0, 0])
        const projRing = ring.map(([lng, lat]) => { const [x, y]: any = proj([lng, lat]); return [x, -y] as [number, number] })
        // 计算多边形投影高度（世界空间）
        const ys = projRing.map(p => p[1])
        const polyHeight = Math.max(...ys) - Math.min(...ys)
        const worldHeight = polyHeight * _baseMapScaleY
        // visibleHeight = 2 * SAFE_DIST * tan(15°) = 0.536 * SAFE_DIST
        // S = TARGET_FILL * visibleHeight / worldHeight
        const neededS = TARGET_FILL * 0.536 * SAFE_DIST / Math.max(worldHeight, 0.001)
        stretchS = Math.max(1, neededS)
      }
    }
  }
  // pivot 世界坐标
  const pivotX = targetX, pivotY = targetY
  // P_new = pivot * (1 - S) + P_base * S
  const newPosX = pivotX * (1 - stretchS) + _baseMapPosX * stretchS
  const newPosY = pivotY * (1 - stretchS) + _baseMapPosY * stretchS
  const newScaleX = _baseMapScaleX * stretchS
  const newScaleY = _baseMapScaleY * stretchS
  // 拉伸时 camera 保持安全距离
  const newDist = stretchS > 1 ? SAFE_DIST : rawZoom

  controls.enabled = false
  controls.minDistance = 2
  _drilledDist = 0
  _drillLevel = properties.level === 'province' ? 'province' : 'city'

  const startViewDir = new THREE.Vector3().copy(camera.position).sub(controls.target).normalize()
  const endViewDir = new THREE.Vector3(0, 0, 1)
  const curDist = camera.position.distanceTo(controls.target)

  // 平移 + 缩放 + 视角修正 + pivot 拉伸 同步动画
  await new Promise<void>((resolve) => {
    const anim = {
      tx: controls.target.x, ty: controls.target.y, tz: controls.target.z,
      dx: startViewDir.x, dy: startViewDir.y, dz: startViewDir.z,
      dist: curDist,
      mx: mapObject3D?.position.x ?? _baseMapPosX,
      my: mapObject3D?.position.y ?? _baseMapPosY,
      msx: mapObject3D?.scale.x ?? _baseMapScaleX,
      msy: mapObject3D?.scale.y ?? _baseMapScaleY,
    }
    gsap.to(anim, {
      tx: pivotX, ty: pivotY, tz: mapConfig.mapDepth,
      dx: endViewDir.x, dy: endViewDir.y, dz: endViewDir.z,
      dist: newDist,
      mx: newPosX, my: newPosY,
      msx: newScaleX, msy: newScaleY,
      duration: 0.9, ease: 'power2.inOut',
      onUpdate: () => {
        const dir = new THREE.Vector3(anim.dx, anim.dy, anim.dz).normalize()
        controls.target.set(anim.tx, anim.ty, anim.tz)
        camera.position.copy(controls.target).addScaledVector(dir, anim.dist)
        if (mapObject3D) {
          mapObject3D.position.set(anim.mx, anim.my, mapObject3D.position.z)
          mapObject3D.scale.set(anim.msx, anim.msy, 1)
        }
        controls.update()
      },
      onComplete: () => resolve(),
    })
  })

  _drilledDist = newDist

  // 省级下钻：绘制市级轮廓线并切换 GeoJSON
  // 市级/区级下钻：绘制区级轮廓线但保留当前 GeoJSON，刷新项目标记
  if (properties.level === 'province') {
    await drawCityBorders(properties.adcode, true)
  } else {
    await drawCityBorders(properties.adcode, false)
    refreshMarkers(stretchS)
  }

  controls.enabled = true
  controls.minDistance = 0
  zoomWatcher.reset(camera, controls)
  // 省级下钻后标记已就绪，初始化市级自动下钻监听（不锁定）
  // 市级下钻后锁定，防止再次触发
  if (properties.level === 'province') {
    cityZoomWatcher.init(camera, controls)
  } else {
    cityZoomWatcher.reset(camera, controls)
  }
  setTimeout(() => { isEntranceAnimating = false }, 1200)
}

/** 根据当前 GeoJSON + projectData 重建标记 */
function refreshMarkers(stretchS = 1) {
  if (!mapObject3D || !currentGeoJson) return
  if (spotGroup) { spotGroup.removeFromParent(); spotGroup = null }
  const spots: SpotItem[] = []
  const proj = d3.geoMercator().center(projectionFnParam.center).scale(projectionFnParam.scale).translate([0, 0])
  const isProvinceLevel = _drillLevel === 'province'
  const isCityLevel = _drillLevel === 'city'

  // 缩放因子：省级按省面积，二级继承
  let areaFactor = 1
  if (isProvinceLevel && selectedAdcode != null) {
    const pa = _provinceAreaMap.get(selectedAdcode) || 0
    areaFactor = pa > 0 && _maxProvinceArea > 0
      ? Math.max(0.1, Math.pow(pa / _maxProvinceArea, 0.55))
      : 1
    _provinceAreaFactor = areaFactor
  } else if (isCityLevel) {
    areaFactor = _provinceAreaFactor
  }

  for (const f of currentGeoJson.features) {
    const pd = props.projectData?.[f.properties.adcode]
    const projectCount = _getCount(pd)
    if (projectCount <= 0) continue

    if (isCityLevel) {
      // 市级/区级下钻：仅匹配被点击的城市，多边形采样散落所有项目标记
      if (f.properties.adcode !== selectedAdcode) continue
      const ring = extractRing(f)
      if (ring && ring.length >= 3) {
        const projRing = ring.map(([lng, lat]) => { const [x, y]: any = proj([lng, lat]); return [x, y] as [number, number] })
        const points = distributeSpiral(projRing, projectCount)
        for (let pi = 0; pi < points.length; pi++) {
          spots.push({
            coord: points[pi],
            properties: {
              name: _getNames(pd)[pi] || f.properties.name,
              adcode: f.properties.adcode,
              level: f.properties.level,
              childrenNum: 0,
              projectIndex: pi,
              projectId: _getIds(pd)[pi] || '',
            },
            label: _getNames(pd)[pi] || f.properties.name,
            _projectCount: 1,
          } as any)
        }
      } else {
        // 回退：质心 + 偏移
        const c = f.properties.centroid || f.properties.center
        if (c && Array.isArray(c) && c.length === 2) {
          const [cx, cy]: any = proj(c as [number, number])
          for (let pi = 0; pi < projectCount; pi++) {
            spots.push({
              coord: [cx + pi * 0.3, cy + pi * 0.3],
              properties: {
                name: _getNames(pd)[pi] || f.properties.name,
                adcode: f.properties.adcode,
                level: 'district', childrenNum: 0, projectIndex: pi,
                projectId: _getIds(pd)[pi] || '',
              },
              label: _getNames(pd)[pi] || f.properties.name,
              _projectCount: 1,
            } as any)
          }
        }
      }
    } else if (isProvinceLevel && areaFactor < 0.15) {
      // 极小面积省份（北京/上海等）：只有一个标记，放在省中心
      continue
    } else {
      // 普通省级下钻：每市一个标记
      const c = f.properties.centroid || f.properties.center
      if (c && Array.isArray(c) && c.length === 2) {
        const [cx, cy]: any = proj(c as [number, number])
        spots.push({
          coord: [cx, cy],
          properties: {
            name: f.properties.name,
            adcode: f.properties.adcode,
            level: f.properties.level,
            childrenNum: f.properties.childrenNum,
          },
          label: `${projectCount}项目`,
          _projectCount: projectCount,
        } as any)
      }
    }
  }

  // 极小面积省份（如北京/上海）：只在省整体包围盒中心放 1 个标记
  if (isProvinceLevel && areaFactor < 0.15 && currentGeoJson) {
    let allMinX = Infinity, allMaxX = -Infinity, allMinY = Infinity, allMaxY = -Infinity
    let provName = '', provAdcode = 0, provLevel = '', provChildren = 0
    for (const f of currentGeoJson.features) {
      const ring = extractRing(f)
      if (ring && ring.length >= 3) {
        const projRing = ring.map(([lng, lat]) => { const [x, y]: any = proj([lng, lat]); return [x, y] as [number, number] })
        const xs = projRing.map(p => p[0]), ys = projRing.map(p => p[1])
        allMinX = Math.min(allMinX, ...xs); allMaxX = Math.max(allMaxX, ...xs)
        allMinY = Math.min(allMinY, ...ys); allMaxY = Math.max(allMaxY, ...ys)
      }
      if (!provName) { provName = f.properties.name; provAdcode = f.properties.adcode; provLevel = f.properties.level; provChildren = f.properties.childrenNum }
    }
    if (isFinite(allMinX)) {
      // 统计全省总项目数
      let totalCount = 0
      for (const f of currentGeoJson.features) {
        totalCount += _getCount(props.projectData?.[f.properties.adcode])
      }
      spots.push({
        coord: [(allMinX + allMaxX) / 2, (allMinY + allMaxY) / 2],
        properties: { name: provName, adcode: provAdcode, level: provLevel, childrenNum: provChildren },
        label: `${totalCount}项目`,
        _projectCount: totalCount,
      } as any)
    }
  }
  // 标记颜色分组：按项目数等差数列分为 4 组
  const MARKER_COLORS = [
    'rgba(34, 204, 238, 1)',
    'rgba(133, 225, 58, 1)',
    'rgba(133, 225, 58, 1)',
    '#F04438',
  ]
  const _counts = spots.map((s: any) => s._projectCount || 0)
  const _maxCount = Math.max(..._counts, 1)
  const _groupStep = _maxCount / MARKER_COLORS.length
  for (const s of spots as any[]) {
    // 全国和省级下钻去掉标签
    if (!isCityLevel) {
      s.label = undefined
      const c = s._projectCount || 0
      const gi = Math.min(MARKER_COLORS.length - 1, Math.floor(c / _groupStep))
      s.color = MARKER_COLORS[gi]
    }
  }
  // 市级散落标记：密度缩放，最终除以 stretchS 抵消地图拉伸
  let cityScale = 0.15
  if (isCityLevel) {
    for (const f of currentGeoJson.features) {
      if (f.properties.adcode !== selectedAdcode) continue
      const ring = extractRing(f)
      if (ring && ring.length >= 3) {
        const projRing = ring.map(([lng, lat]) => { const [x, y]: any = proj([lng, lat]); return [x, y] as [number, number] })
        const pxs = projRing.map(p => p[0]), pys = projRing.map(p => p[1])
        const projArea = (Math.max(...pxs) - Math.min(...pxs)) * (Math.max(...pys) - Math.min(...pys))
        const count = _getCount(props.projectData?.[f.properties.adcode]) || 1
        const density = count / Math.max(projArea, 0.1)
        cityScale = Math.max(0.05, Math.min(0.15, 0.10 / Math.sqrt(density)))
      }
      break
    }
  }
  if (spots.length > 0) {
    // stretchS 抵消地图拉伸：小区域 S 大 → 标记缩小，保持屏幕视觉一致
    // 小省份单标记：固定较大尺寸，不受面积因子压缩
    const provScale = areaFactor < 0.15 ? 0.17 : 2 * Math.max(0.3, 0.5 * areaFactor)
    const scale = (isCityLevel
      ? cityScale * 0.5
      : (isProvinceLevel ? provScale : 2)) / Math.sqrt(stretchS)
    // 下钻后俯视摄像机：锥体 tilt=π（水平，侧面可见）
    const tilt = isProvinceLevel || isCityLevel ? Math.PI : Math.PI * 5 / 4
    const isCountryView = currentGeoJson === countryGeoJsonCache
    const ringTilt = isCountryView ? -Math.PI / 6 : -Math.PI / 3
    const labelYOffset = isCountryView ? 3.5 : (isProvinceLevel ? 3.5 : 2)
    const labelFontSize = isCityLevel ? 120 : 90
    const spotYOffset = isCityLevel ? 0 : (isProvinceLevel ? 1.5 : 2)
    // 下钻时相机贴近表面，标记降到 z=7.3 避免跑到相机上方
    const spotZ = isProvinceLevel || isCityLevel ? -0.5 : 0
    const { group, rings } = createSpotGroup(spots, { scale, tilt, ringTilt, labelYOffset, labelFontSize, zIndex: spotZ, yOffset: spotYOffset })
    spotList = rings
    spotGroup = group
    mapObject3D.add(group)
  }
}

async function buildMap(geoJson: GeoJsonType, params: typeof projectionFnParam) {
  if (mapObject3D) {
    disposeObject3D(mapObject3D)
    scene.remove(mapObject3D)
    mapObject3D = null
    while (labelRenderer.domElement.firstChild) {
      labelRenderer.domElement.removeChild(labelRenderer.domElement.firstChild)
    }
  }

  const result = await generateMapObject3D(geoJson, params, 6, bgTexture)
  mapObject3D = result.mapObject3D

  const geomBox = new THREE.Box3().setFromObject(mapObject3D)
  const geomCenter = new THREE.Vector3()
  geomBox.getCenter(geomCenter)
  const yOffset = params.scale <= 150 ? -6 : 2
  mapObject3D.position.set(-geomCenter.x, -geomCenter.y + yOffset, -geomCenter.z)

  scene.add(mapObject3D)

  const dom = canvasRef.value
  const scaleDivisor = params.scale <= 150 ? 260 : params.scale <= 1000 ? 90 : 220
  let dynamicScale = dom ? getDynamicMapScale(mapObject3D, dom, scaleDivisor) : 1

  const geomSize = new THREE.Vector3()
  geomBox.getSize(geomSize)
  const whRatio = Math.max(geomSize.x / geomSize.y, geomSize.y / geomSize.x)
  if (whRatio > 2.5) dynamicScale *= Math.max(0.55, 2.5 / whRatio)

  const spotItems: SpotItem[] = []
  for (const f of geoJson.features) {
    const pd = props.projectData?.[f.properties.adcode]
    const projectCount = _getCount(pd)
    if (projectCount <= 0) continue
    const item = result.label2dData.find((d: any) => d._adcode === f.properties.adcode)
    if (!item || !item.featureCenterCoord) continue
    // 全国视图：各省标记统一大小
    spotItems.push({
      coord: item.featureCenterCoord as [number, number],
      properties: {
        name: item.name || item.featureName || '',
        adcode: item._adcode,
        level: item.level || 'province',
        childrenNum: item.childrenNum || 0,
      },
      label: `${projectCount}项目`,
      _projectCount: projectCount,
    } as any)
  }
  // 全国视图标记颜色分组
  const _counts2 = spotItems.map((s: any) => s._projectCount || 0)
  const _max2 = Math.max(..._counts2, 1)
  const _step2 = _max2 / 4
  for (const s of spotItems as any[]) {
    const gi = Math.min(3, Math.floor((s._projectCount || 0) / _step2))
    s.color = ['rgba(34, 204, 238, 1)', 'rgba(133, 225, 58, 1)', 'rgba(133, 225, 58, 1)', '#F04438'][gi]
    s.label = undefined
  }
  const { group, rings } = createSpotGroup(spotItems, { scale: 2, ringTilt: -Math.PI / 6, labelYOffset: 3.5, yOffset: 2 })
  spotList = rings
  if (spotGroup) { spotGroup.removeFromParent(); spotGroup = null }
  spotGroup = group
  mapObject3D.add(group)

  // GSAP 入场动画：先设到初始缩小状态，再动画长大
  // deferEntrance 时只设初始态不启动动画，由外部调度器控制时机
  _pendingEntranceScale = dynamicScale
  // 记录基础值（拉伸前的初始状态）
  _baseMapScaleX = dynamicScale; _baseMapScaleY = dynamicScale
  _baseMapPosX = mapObject3D.position.x; _baseMapPosY = mapObject3D.position.y
  mapObject3D.scale.set(0.8, 0.8, 1)
  if (!props.deferEntrance) {
    _playEntranceAnimation()
  }
}

let _pendingEntranceScale = 1
function _playEntranceAnimation() {
  if (!mapObject3D) return
  isEntranceAnimating = true
  mapObject3D.scale.set(0.8, 0.8, 1)
  gsap.to(mapObject3D.scale, {
    x: _pendingEntranceScale, y: _pendingEntranceScale, z: 1,
    duration: 0.8, ease: 'power2.out',
    onComplete: () => {
      isEntranceAnimating = false
      clearDrillCache()
      // 锁定最大缩小距离为当前全国视角距离
      controls.maxDistance = camera.position.distanceTo(controls.target)
      // 入场动画彻底结束后才创建星空，保证位置稳定
      if (!starfield) {
        starfield = createStarfield()
        starfield.points.forEach((p) => scene.add(p))
      }
      emit('entrance-complete')
    },
  })
}

/** 由外部调度器调用，触发 GSAP 入场动画 */
function playEntrance() {
  _playEntranceAnimation()
}

/** 由外部调用：按 adcode 下钻 */
function drillByAdcode(adcode: string) {
  // 优先从全国缓存查找（省份级别）
  const feature = countryGeoJsonCache?.features.find((f: any) => String(f.properties.adcode) === adcode)
    || currentGeoJson?.features.find((f: any) => String(f.properties.adcode) === adcode)
  if (feature) {
    // 如果当前在已钻省份，先恢复再钻
    if (selectedAdcode != null) {
      selectedAdcode = null
      _drillLevel = null
      if (cityLinesGroup) { mapObject3D?.remove(cityLinesGroup); cityLinesGroup = null }
      if (districtLinesGroup) { mapObject3D?.remove(districtLinesGroup); districtLinesGroup = null }
      if (countryGeoJsonCache) currentGeoJson = countryGeoJsonCache
    }
    handleDrillDown(feature.properties)
  }
}

/** 由外部调用：恢复全国视图 */
function resetToCountry(keepDistrict?: boolean) {
  if (_drilledDist > 0) {
    _drilledDist = 0; _drillLevel = null; controls.enabled = false; controls.minDistance = 2
    if (cityLinesGroup) { mapObject3D?.remove(cityLinesGroup); cityLinesGroup = null }
    if (districtLinesGroup) { mapObject3D?.remove(districtLinesGroup); districtLinesGroup = null }
    // 清除省轮廓高亮
    if (selectedAdcode != null && mapObject3D) {
      const prev = selectedAdcode
      mapObject3D.traverse((c) => {
        const obj = c as any
        if (obj.customProperties?.adcode === prev) {
          obj.traverse((child: any) => {
            if (child.isLine2) {
              const rm = new (LineMaterial as any)({ color: mapConfig.topLineColor, linewidth: mapConfig.topLineWidth })
              rm.resolution.set(renderer.domElement.width, renderer.domElement.height)
              child.material = rm
            }
          })
        }
      })
      selectedAdcode = null
      if (countryGeoJsonCache) { currentGeoJson = countryGeoJsonCache; refreshMarkers() }
    }
    const tf = { x: controls.target.x, y: controls.target.y, z: controls.target.z }
    const cf = { x: camera.position.x, y: camera.position.y, z: camera.position.z }
    const mp = mapObject3D ? { x: mapObject3D.position.x, y: mapObject3D.position.y } : { x: _baseMapPosX, y: _baseMapPosY }
    const ms = mapObject3D ? { x: mapObject3D.scale.x, y: mapObject3D.scale.y } : { x: _baseMapScaleX, y: _baseMapScaleY }
    gsap.timeline({ onComplete: () => { controls.enabled = true; zoomWatcher.reset(camera, controls); emit('reset-to-country', keepDistrict) } })
      .to(tf, { x: -5, y: -1, z: 0, duration: 0.7, ease: 'power2.out', onUpdate: () => controls.target.set(tf.x, tf.y, tf.z) }, 0)
      .to(cf, { x: -10, y: -90, z: 155, duration: 0.7, ease: 'power2.out', onUpdate: () => { camera.position.set(cf.x, cf.y, cf.z); controls.update() } }, 0)
      .to(mp, { x: _baseMapPosX, y: _baseMapPosY, duration: 0.7, ease: 'power2.out', onUpdate: () => { if (mapObject3D) { mapObject3D.position.x = mp.x; mapObject3D.position.y = mp.y } } }, 0)
      .to(ms, { x: _baseMapScaleX, y: _baseMapScaleY, duration: 0.7, ease: 'power2.out', onUpdate: () => { if (mapObject3D) mapObject3D.scale.set(ms.x, ms.y, 1) } }, 0)
  }
}

// ──────────────────────────────────────────────
// 飞线：复用 mega-vision 的 drawLineBetween2Spot
// （青→绿渐变弧线 + 流动光点），以主要城市为节点
// ──────────────────────────────────────────────
const FLY_CITIES: [string, number, number][] = [
  ['北京', 116.4, 39.9],
  ['上海', 121.47, 31.23],
  ['广州', 113.26, 23.13],
  ['成都', 104.07, 30.67],
  ['武汉', 114.31, 30.6],
  ['西安', 108.95, 34.27],
  ['哈尔滨', 126.63, 45.75],
  ['乌鲁木齐', 87.62, 43.82],
  ['昆明', 102.71, 25.04],
  ['拉萨', 91.11, 29.97],
  ['沈阳', 123.43, 41.8],
  ['兰州', 103.83, 36.06],
  ['海口', 110.35, 20.02],
  ['重庆', 106.55, 29.56],
  ['香港', 114.17, 22.32],
]
function buildFlylines() {
  if (!mapObject3D) return
  flyGroup = new THREE.Group()
  flySpots = []
  const proj = d3.geoMercator().center(projectionFnParam.center).scale(projectionFnParam.scale).translate([0, 0])
  const coords = FLY_CITIES.map((c) => {
    const p: any = proj([c[1], c[2]])
    return [p[0], p[1]] as [number, number]
  })
  // 枢纽（北京）→ 各城市
  for (let i = 1; i < coords.length; i++) {
    const { flyLine, flySpot } = drawLineBetween2Spot(coords[0], coords[i])
    flyGroup.add(flyLine)
    flyGroup.add(flySpot)
    flySpot._phase = Math.random()
    flySpots.push(flySpot)
    // 置于辉光图层：仅飞线/彗星发光，不打亮地图与打点
    ;(flyLine as any).layers.enable(BLOOM_SCENE)
    flySpot.traverse((c: any) => { if (c.layers) c.layers.enable(BLOOM_SCENE) })
  }
  // 相邻城市环形互联
  for (let i = 1; i < coords.length - 1; i++) {
    const { flyLine, flySpot } = drawLineBetween2Spot(coords[i], coords[i + 1])
    flyGroup.add(flyLine)
    flyGroup.add(flySpot)
    flySpot._phase = Math.random()
    flySpots.push(flySpot)
    ;(flyLine as any).layers.enable(BLOOM_SCENE)
    flySpot.traverse((c: any) => { if (c.layers) c.layers.enable(BLOOM_SCENE) })
  }
  mapObject3D.add(flyGroup)
}

defineExpose({ playEntrance, drillByAdcode, resetToCountry })

// ═══════════════════════════════════════════
// 生命周期
// ═══════════════════════════════════════════

// 当 projectData 内容变化时才刷新标记（值比较，避免 computed 引用变化触发无效刷新）
let _lastProjectDataJson = ''
watch(() => JSON.stringify(props.projectData), (newJson) => {
  if (newJson !== _lastProjectDataJson && mapObject3D && currentGeoJson) {
    _lastProjectDataJson = newJson
    refreshMarkers()
  }
})

onMounted(async () => {
  await nextTick()
  const canvasDom = canvasRef.value
  const labelsDom = labelsRef.value
  if (!canvasDom || !labelsDom) return

  // ── 初始化渲染器 ──
  scene = initScene()
  renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', alpha: true, stencil: true })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  canvasDom.appendChild(renderer.domElement)

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.width = '100%'
  labelRenderer.domElement.style.height = '100%'
  labelsDom.appendChild(labelRenderer.domElement)

  await new Promise((resolve) => requestAnimationFrame(resolve))
  const w = canvasDom.clientWidth
  const h = canvasDom.clientHeight
  renderer.setSize(w, h)
  labelRenderer.setSize(w, h)

  const camResult = initCamera(canvasDom)
  camera = camResult.camera

  // ── rAF 渲染循环 ──
  let interactionBoostUntil = 0
  const IDLE_RENDER_INTERVAL = 250
  let lastIdleRender = 0

  const hasActiveAnimation = (): boolean =>
    isEntranceAnimating || !!mapObject3D || performance.now() < interactionBoostUntil

  // ── 选择性辉光：把非 bloom 图层的物体临时替换为黑色材质，仅飞线/彗星参与辉光 ──
  const _darkMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
  const _darkPointsMat = new THREE.PointsMaterial({ color: 0x000000, size: 0.05 })
  const _darkSpriteMat = new THREE.SpriteMaterial({ color: 0x000000 })
  const _matCache = new Map<string, any>()
  const darkenNonBloom = (obj: any) => {
    if (bloomLayer.test(obj.layers) === false && obj.material) {
      _matCache.set(obj.uuid, obj.material)
      if (obj.isPoints) obj.material = _darkPointsMat
      else if (obj.isSprite) obj.material = _darkSpriteMat
      else obj.material = _darkMat
    }
  }
  const restoreMaterial = (obj: any) => {
    if (_matCache.has(obj.uuid)) {
      obj.material = _matCache.get(obj.uuid)
      _matCache.delete(obj.uuid)
    }
  }

  // ── 帧预算：60fps = 16.67ms，留 3ms 给浏览器/VChart，目标 < 14ms ──
  const FRAME_DEADLINE = 14
  const animate = (timestamp?: number) => {
    if (isDisposed) return
    animFrameId = requestAnimationFrame(animate)

    const frameStart = performance.now()

    // 缩放自动下钻：国家级 → 省级（已下钻省份则关闭）
    if (!selectedAdcode) zoomWatcher.update(
      camera, controls,
      props.zoomDrillEnabled, props.zoomDrillThreshold,
      isEntranceAnimating, isDisposed,
      () => zoomWatcher.doAutoDrill(raycaster, pointer, camera, mapObject3D, currentGeoJson, handleDrillDown),
    )
    // 缩放自动下钻：省级 → 市/区级（更高阈值，更快响应）
    if (_drillLevel === 'province') cityZoomWatcher.update(
      camera, controls,
      props.zoomDrillEnabled, props.zoomDrillThreshold * 1.6,
      isEntranceAnimating, isDisposed,
      () => {
        // 采样中心区域，允许 city 级别特征
        if (!mapObject3D || !currentGeoJson) return false
        const samples = [[0, 0], [0.06, 0], [-0.06, 0], [0, 0.06], [0, -0.06]]
        for (const [sx, sy] of samples) {
          pointer.set(sx, sy)
          raycaster.setFromCamera(pointer, camera)
          const intersects = mapObject3D ? raycaster.intersectObjects(mapObject3D.children, true) : []
          const target = intersects.find((item: any) => item.object.userData?.isChangeColor)
          if (target) {
            const obj: any = target.object.parent
            const p: GeoJsonFeature['properties'] = obj?.customProperties || (target.object as any).customProperties
            if (p && (p.level === 'city' || p.level === 'district')) {
              handleDrillDown(p)
              return true
            }
          }
        }
        return false
      },
    )

    const active = hasActiveAnimation()
    if (!active) {
      if (timestamp && frameStart - lastIdleRender < IDLE_RENDER_INTERVAL) return
      lastIdleRender = frameStart
    }

    // 缩放恢复：从下钻状态缩小足够远，动画回到全国默认视角
    if (_drilledDist > 0 && controls && !isEntranceAnimating) {
      const d = camera.position.distanceTo(controls.target)
      if (d > Math.max(60, _drilledDist * 1.6)) {
        _drilledDist = 0; _drillLevel = null; controls.enabled = false; controls.minDistance = 2
        // 清除市内轮廓线
        if (cityLinesGroup) { mapObject3D?.remove(cityLinesGroup); cityLinesGroup = null }
      if (districtLinesGroup) { mapObject3D?.remove(districtLinesGroup); districtLinesGroup = null }
        // 清除选中省高亮
        if (selectedAdcode != null && mapObject3D) {
          mapObject3D.traverse((c) => {
            const obj = c as any
            if (obj.customProperties?.adcode === selectedAdcode) {
              obj.traverse((child: any) => {
                if (child.isLine2) {
                  const rm = new (LineMaterial as any)({ color: mapConfig.topLineColor, linewidth: mapConfig.topLineWidth })
                  rm.resolution.set(renderer.domElement.width, renderer.domElement.height)
                  child.material = rm
                }
              })
            }
          })
          selectedAdcode = null
        }
        const cf = { x: camera.position.x, y: camera.position.y, z: camera.position.z }
        const tf = { x: controls.target.x, y: controls.target.y, z: controls.target.z }
        const mp = mapObject3D ? { x: mapObject3D.position.x, y: mapObject3D.position.y } : { x: _baseMapPosX, y: _baseMapPosY }
        const ms = mapObject3D ? { x: mapObject3D.scale.x, y: mapObject3D.scale.y } : { x: _baseMapScaleX, y: _baseMapScaleY }
        gsap.timeline({ onComplete: () => { controls.enabled = true; if (countryGeoJsonCache) { currentGeoJson = countryGeoJsonCache; refreshMarkers() }; zoomWatcher.reset(camera, controls); emit('reset-to-country') } })
          .to(tf, { x: -5, y: -1, z: 0, duration: 0.7, ease: 'power2.out',
            onUpdate: () => controls.target.set(tf.x, tf.y, tf.z) }, 0)
          .to(cf, { x: -10, y: -90, z: 155, duration: 0.7, ease: 'power2.out',
            onUpdate: () => { camera.position.set(cf.x, cf.y, cf.z); controls.update() } }, 0)
          .to(mp, { x: _baseMapPosX, y: _baseMapPosY, duration: 0.7, ease: 'power2.out',
            onUpdate: () => { if (mapObject3D) { mapObject3D.position.x = mp.x; mapObject3D.position.y = mp.y } } }, 0)
          .to(ms, { x: _baseMapScaleX, y: _baseMapScaleY, duration: 0.7, ease: 'power2.out',
            onUpdate: () => { if (mapObject3D) mapObject3D.scale.set(ms.x, ms.y, 1) } }, 0)
      }
    }

    // 下钻后：平移灵敏度调整
    if (_drilledDist > 0 && !isEntranceAnimating) {
      const curDist = camera.position.distanceTo(controls.target)
      controls.panSpeed = 1.0 + (20 / Math.max(0.05, curDist))
    }

    starfield?.update(performance.now() * 0.001)
    // 选择性辉光：仅飞线/彗星发光，地图与打点保持清晰（省份不被溢光淹没）
    scene.traverse(darkenNonBloom)
    bloomComposer?.render()
    scene.traverse(restoreMaterial)
    composer?.render()
    labelRenderer.render(scene, camera)

    // 非必要动画：帧预算不足时跳过，把时间留给 VChart
    const elapsed = performance.now() - frameStart
    if (active && elapsed < FRAME_DEADLINE) {
    spotList.forEach((mesh: any) => {
      mesh._s += 0.01
      mesh.scale.set(1 * mesh._s, 1 * mesh._s, 1 * mesh._s)
      if (mesh._s <= 2) { mesh.material.opacity = Math.max(0.4, 2 - mesh._s) } else { mesh._s = 1 }
    })
    // 飞线流动彗星（头部强光 + 尾部拖尾）
    const tFly = performance.now() * 0.001
    flySpots.forEach((s: any) => {
      const cv = s.curve as THREE.QuadraticBezierCurve3
      if (!cv) return
      const p = (tFly * 0.16 + (s._phase || 0)) % 1
      const headPos = cv.getPoint(p)
      s.position.copy(headPos)
      s.scale.setScalar(0.85 + Math.sin(p * Math.PI) * 0.5)
      const tail = s.userData?.tail
      if (tail) {
        const tp = cv.getPoint(Math.max(0, p - 0.06))
        tail.position.set(tp.x - headPos.x, tp.y - headPos.y, tp.z - headPos.z)
      }
    })
    }
  }
  animate()

  // ── 可见性处理 ──
  onVisibilityChange = () => {
    if (!document.hidden) {
      if (!animFrameId && !isDisposed) {
        lastIdleRender = 0
        interactionBoostUntil = performance.now() + 300
        animate()
      }
    }
  }

  // ── 加载数据 ──
  await loadAmapScript()
  currentGeoJson = await fetchChinaGeoJson()
  countryGeoJsonCache = currentGeoJson
  // 预计算各省投影面积，用于下钻后市级标记的比例缩放
  const provProj = d3.geoMercator().center(projectionFnParam.center).scale(projectionFnParam.scale).translate([0, 0])
  for (const f of currentGeoJson.features) {
    const a = computeProjectedArea(f, provProj)
    _provinceAreaMap.set(f.properties.adcode, a)
    if (a > _maxProvinceArea) _maxProvinceArea = a
  }
  emit('geo-data-loaded', currentGeoJson)

  labelsDom.style.pointerEvents = 'none'
  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(-5, -1, 0)
  controls.update()
  controls.minDistance = 0
  controls.maxDistance = 300  // 临时大值，入场动画后校准

  // ── 拖拽=平移（不再旋转翻转地图）──
  // 完全禁用旋转，左键/右键拖拽都只平移地图，保证永远正面俯视、不会翻面
  controls.enableRotate = false
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN,
  }
  controls.screenSpacePanning = false // 贴地平面平移，符合地图操作直觉
  controls.update()

  // ── 后期：选择性 Bloom（仅飞线/彗星发光，地图与打点不溢光，保持省份清晰）──
  // + Gamma 修正（0.147 默认线性输出，需补 sRGB 以对齐 mega 观感）
  const renderPass = new RenderPass(scene, camera)
  // 辉光合成器：渲染「非 bloom 物体变黑」的场景，只提取飞线/彗星的亮度
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.3, 0.5, 0.0)
  bloomComposer = new EffectComposer(renderer)
  bloomComposer.renderToScreen = false
  bloomComposer.addPass(renderPass)
  bloomComposer.addPass(bloomPass)
  bloomComposer.setSize(w, h)

  // 合成：base（正常渲染）+ bloom 纹理
  const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform sampler2D baseTexture;
        uniform sampler2D bloomTexture;
        varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(bloomTexture, vUv);
        }
      `,
    }),
    'baseTexture',
  )
  mixPass.needsSwap = true
  const gammaPass = new ShaderPass(GammaCorrectionShader)
  composer = new EffectComposer(renderer)
  composer.addPass(renderPass)
  composer.addPass(mixPass)
  composer.addPass(gammaPass)
  composer.setSize(w, h)
  setFlyLineResolution(w, h)

  // 阻止所有缩放事件影响 ScaleScreen/浏览器
  renderer.domElement.addEventListener('wheel', (e) => {
    e.stopPropagation()
    if (e.ctrlKey) e.preventDefault()  // Chrome/Edge 触控板 pinch → 页面缩放
  }, { passive: false })
  const noZoom = (e: Event) => { e.preventDefault(); e.stopPropagation() }
  renderer.domElement.addEventListener('gesturestart', noZoom)
  renderer.domElement.addEventListener('gesturechange', noZoom)
  renderer.domElement.addEventListener('gestureend', noZoom)

  const pointLight = new THREE.PointLight(0xffffff, 1.5)
  pointLight.position.set(0, -5, 30)
  scene.add(pointLight)
  scene.add(new THREE.AmbientLight(0xffffff, 0.65))

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()

  // 渐变背景纹理
  const gradCanvas = document.createElement('canvas')
  gradCanvas.width = 2; gradCanvas.height = 256
  const gctx = gradCanvas.getContext('2d')!
  const grad = gctx.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, '#000F33'); grad.addColorStop(1, '#00339A')
  gctx.fillStyle = grad; gctx.fillRect(0, 0, 2, 256)
  bgTexture = new THREE.CanvasTexture(gradCanvas)
  bgTexture.encoding = THREE.sRGBEncoding

  await buildMap(currentGeoJson, projectionFnParam)
  buildFlylines()
  zoomWatcher.reset(camera, controls)

  // ── 注册交互事件（用 getter 确保闭包读到最新状态）──
  const getMapObj = () => mapObject3D
  const getAnimating = () => isEntranceAnimating

  onMouseMoveEvent = mapInteraction.createMouseMoveHandler(
    canvasDom, camera, raycaster, pointer, getMapObj, controls, getAnimating,
    mapConfig.mapColor, mapConfig.mapOpacity, mapConfig.mapHoverColor,
  )
  onClickEvent = mapInteraction.createClickHandler(
    canvasDom, camera, raycaster, pointer, getMapObj, getAnimating, handleDrillDown,
  )
  onMouseDownEvent = mapInteraction.createMouseDownHandler()

  onResizeEvent = () => {
    if (resizeThrottleId) return
    resizeThrottleId = requestAnimationFrame(() => {
      resizeThrottleId = 0
      if (isDisposed) return
      camera.aspect = canvasDom.clientWidth / canvasDom.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvasDom.clientWidth, canvasDom.clientHeight)
      labelRenderer.setSize(canvasDom.clientWidth, canvasDom.clientHeight)
      composer?.setSize(canvasDom.clientWidth, canvasDom.clientHeight)
      bloomComposer?.setSize(canvasDom.clientWidth, canvasDom.clientHeight)
      setFlyLineResolution(canvasDom.clientWidth, canvasDom.clientHeight)
    })
  }

  window.addEventListener('resize', onResizeEvent, false)
  renderer.domElement.addEventListener('mousemove', onMouseMoveEvent, false)
  renderer.domElement.addEventListener('click', onClickEvent, false)
  renderer.domElement.addEventListener('mousedown', onMouseDownEvent, false)
  document.addEventListener('visibilitychange', onVisibilityChange, false)

  emit('ready')
})

onUnmounted(() => {
  isDisposed = true
  cancelAnimationFrame(animFrameId)
  animFrameId = 0
  if (resizeThrottleId) { cancelAnimationFrame(resizeThrottleId); resizeThrottleId = 0 }
  window.removeEventListener('resize', onResizeEvent, false)
  renderer.domElement.removeEventListener('mousemove', onMouseMoveEvent, false)
  renderer.domElement.removeEventListener('click', onClickEvent, false)
  renderer.domElement.removeEventListener('mousedown', onMouseDownEvent, false)
  document.removeEventListener('visibilitychange', onVisibilityChange, false)
  renderer?.dispose()
  starfield?.dispose()
  scene?.clear()
})
</script>

<style scoped>
.china-map-3d-wrapper { width: 100%; height: 100%; position: relative; overflow: hidden; }
.china-map-3d-canvas { width: 100%; height: 100%; position: relative; }
.china-map-3d-canvas :deep(canvas) { display: block; width: 100% !important; height: 100% !important; }
.china-map-3d-labels { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
</style>
