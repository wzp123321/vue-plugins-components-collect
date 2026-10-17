<template>
  <div class="china-map-3d-wrapper">
    <div ref="canvasHost" class="china-map-3d-canvas"></div>

    <MapTooltip v-bind="tooltip" />
    <MapLegend :items="legend" />
    <MapNavBar :crumbs="crumbs" @back="handleBack" />
    <MapStageTip :stage="stage" :raised="canGoBack" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import MapTooltip from './MapTooltip.vue'
import MapLegend from './MapLegend.vue'
import MapNavBar from './MapNavBar.vue'
import MapStageTip from './MapStageTip.vue'
import { useMapViewport } from '../composables/useMapViewport'
import { useMapLayer } from '../composables/useMapLayer'
import type { MapLevel } from '../composables/useMapLayer'
import { useMapLevels } from '../composables/useMapLevels'
import { useSpotMarkers } from '../composables/useSpotMarkers'
import { useFlyLines } from '../composables/useFlyLines'
import { usePointerPick } from '../composables/usePointerPick'
import type { PickResult } from '../composables/usePointerPick'
import { useZoomDrill } from '../composables/useZoomDrill'
import { LEVEL_TEXT, readCount } from '../utils/data'
import { mapConfig } from '../utils/mapConfig'
import type { GeoJsonFeature } from '../types'

const props = withDefaults(
  defineProps<{
    initialAdcode?: string
    maxDrillLevel?: 'province' | 'city' | 'district'
    zoomDrillEnabled?: boolean
    zoomDrillThreshold?: number
    deferEntrance?: boolean
    projectData?: Record<number, number | { count: number; names: string[]; ids: string[] }>
    /** 是否显示数据柱（关闭时改为显示地理位置标牌） */
    showColumn?: boolean
    /** 数据柱高值档颜色（分级色板以它为高值锚点） */
    columnColor?: string
    showFlyline?: boolean
    flylineColor?: string
    flylineSpeed?: number
  }>(),
  {
    maxDrillLevel: 'district',
    zoomDrillEnabled: false,
    zoomDrillThreshold: 0.4,
    deferEntrance: false,
    showColumn: true,
    columnColor: '#5FC9EE',
    showFlyline: true,
    flylineColor: '#7FD4F5',
    flylineSpeed: mapConfig.fly.speed,
  },
)

const emit = defineEmits<{
  (e: 'drill-down', properties: GeoJsonFeature['properties']): void
  (e: 'ready'): void
  (e: 'geo-data-loaded', geoJson: unknown): void
  (e: 'reset-to-country'): void
}>()

const canvasHost = ref<HTMLDivElement | null>(null)
const viewport = useMapViewport(() => canvasHost.value)
const layer = useMapLayer(() => viewport.scene())

const markers = useSpotMarkers({
  getRoot: () => layer.root(),
  projectData: () => props.projectData,
  columnColor: () => props.columnColor,
  showColumn: () => props.showColumn,
})

const flies = useFlyLines({
  getRoot: () => layer.root(),
  visible: () => props.showFlyline,
  color: () => props.flylineColor,
  speed: () => props.flylineSpeed,
})

const { stage, busy, crumbs, current, canGoBack, stack, loadCountry, drill, back, resetToCountry, findFeature } =
  useMapLevels({
    maxDrillLevel: () => props.maxDrillLevel,
    onEnter: async (level, { rise, report }) => {
      viewport.focus(level.fit, 0.5)
      await layer.build(level, { rise, report })
      report({ text: '正在投影数据…', ratio: 0.88 })
      markers.build(level, !props.deferEntrance)
      // 柱体长到一半再让流星起飞，两个动画不抢同一个瞬间
      flies.build(level, props.deferEntrance ? 0 : 0.72)
      zoom.reset(viewport.camera(), viewport.controls())
      emit('geo-data-loaded', level.geo)
    },
    // 切层时先清掉悬停态（picker 在下方创建，回调可安全引用：切层发生在挂载之后）
    onLeave: async () => {
      picker.clearHover()
      flies.clear()
      await layer.sink()
      markers.clear()
    },
    onError: (error) => console.error('[china-map-3d] 图层加载失败：', error),
  })

const zoom = useZoomDrill({
  enabled: () => props.zoomDrillEnabled,
  threshold: () => props.zoomDrillThreshold,
  isBusy: () => busy.value,
  hitCenter: () => {
    const camera = viewport.camera()
    const root = layer.root()
    if (!camera || !root) return false
    for (const [sx, sy] of [[0, 0], [0.05, 0], [-0.05, 0], [0, 0.05], [0, -0.05]]) {
      viewport.pointer.set(sx, sy)
      viewport.raycaster.setFromCamera(viewport.pointer, camera)
      const hits = viewport.raycaster.intersectObjects(root.children, true)
      const hit = hits.find((item: any) => item.object.userData?.kind === 'surface')
      const region = (hit?.object as any)?.userData?.region
      if (region?.customProperties) {
        drill(region.customProperties)
        return true
      }
    }
    return false
  },
})

/** 点击锁定：显示该城市的标牌并高亮板块 */
function selectAdcode(adcode: number | null) {
  markers.select(adcode)
  layer.setSelected(adcode)
}

function adcodeOf(pick: PickResult | null): number | null {
  if (!pick) return null
  const info = pick.spot ?? pick.properties
  const adcode = Number(info?.adcode)
  return Number.isFinite(adcode) && adcode > 0 ? adcode : null
}

function handleDrill(pick: PickResult) {
  const info = pick.spot ?? pick.properties
  if (!info) return
  emit('drill-down', info as GeoJsonFeature['properties'])
  drill(info as GeoJsonFeature['properties'])
}

const picker = usePointerPick({
  camera: () => viewport.camera(),
  getRoot: () => layer.root(),
  raycaster: viewport.raycaster,
  pointer: viewport.pointer,
  isBusy: () => busy.value,
  onHover: (pick) => layer.setHover(adcodeOf(pick)),
  onSelect: (pick) => selectAdcode(adcodeOf(pick)),
  onDrill: handleDrill,
})

const tooltip = computed(() => {
  const hover = picker.hovered.value
  const info = hover ? hover.spot ?? hover.properties : null
  if (!info) return { visible: false, x: 0, y: 0, name: '', levelText: '', value: '' }
  const adcode = Number(info.adcode)
  const value = info.value ?? readCount(props.projectData?.[adcode])
  return {
    visible: true,
    x: picker.position.value.x + 16,
    y: picker.position.value.y + 16,
    name: String(info.name ?? ''),
    levelText: LEVEL_TEXT[info.level] ?? String(info.level ?? ''),
    value: value > 0 ? value : '—',
  }
})

const legend = computed(() => markers.legend.value)

function handleBack() {
  selectAdcode(null)
  // 回到全国时通知外部
  if (stack.value.length === 2) emit('reset-to-country')
  back()
}

/** 外部 API：按 adcode 下钻 */
function drillByAdcode(adcode: string) {
  const feature = findFeature(adcode)
  const camera = viewport.camera()
  if (!feature || !camera) return
  handleDrill({ kind: 'region', properties: feature.properties, spot: null, point: camera.position.clone() })
}

/** 外部 API：回到全国 */
function resetToRoot() {
  selectAdcode(null)
  resetToCountry()
}

/** 入场动画（deferEntrance 时由外部触发） */
function playEntrance() {
  layer.playEntrance()
}

defineExpose({
  drillByAdcode,
  resetToCountry: resetToRoot,
  playEntrance,
  currentLevel: () => current.value as MapLevel | null,
})

watch(
  () => props.projectData,
  () => {
    const level = current.value
    // 数据 / 配色变更即时生效，重播入场动画会显得整屏在抖
    if (level && layer.root()) markers.build(level, false)
  },
  { deep: true },
)

watch(
  () => props.showColumn,
  () => markers.applyMode(),
)

watch(
  () => props.columnColor,
  () => {
    const level = current.value
    // 数据 / 配色变更即时生效，重播入场动画会显得整屏在抖
    if (level && layer.root()) markers.build(level, false)
  },
)

watch(
  () => props.showFlyline,
  (visible) => flies.setVisible(visible),
)

watch(
  () => props.flylineColor,
  (color) => flies.setColor(color),
)

watch(
  () => props.flylineSpeed,
  (speed) => flies.setSpeed(speed),
)

let tickOff: (() => void) | null = null

onMounted(async () => {
  await nextTick()
  viewport.start()
  const canvas = viewport.canvas()
  if (canvas) picker.attach(canvas)

  tickOff = viewport.onTick((dt, elapsed) => {
    flies.tick(dt, elapsed, viewport.camera())
    zoom.update(viewport.camera()!, viewport.controls())
  })

  await loadCountry(!props.deferEntrance)
  zoom.reset(viewport.camera(), viewport.controls())
  emit('ready')

  if (props.initialAdcode) drillByAdcode(props.initialAdcode)
})

onUnmounted(() => {
  tickOff?.()
  tickOff = null
  picker.detach()
  markers.clear()
  flies.clear()
  layer.dispose()
  viewport.stop()
})
</script>

<style scoped>
.china-map-3d-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.china-map-3d-canvas {
  width: 100%;
  height: 100%;
  position: relative;
}
.china-map-3d-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
