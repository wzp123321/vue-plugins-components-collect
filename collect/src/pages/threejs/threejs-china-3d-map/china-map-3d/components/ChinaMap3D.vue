<template>
  <div class="china-map-3d-wrapper">
    <div ref="canvasHost" class="china-map-3d-canvas"></div>

    <MapSearchBox
      v-if="showSearch"
      ref="searchRef"
      :items="searchItems"
      :disabled="busy"
      @pick="handleSearchPick"
      @search="handleSearchKeyword"
    />
    <MapTooltip v-bind="tooltip" />
    <MapLegend :items="legend" />
    <MapNavBar :crumbs="crumbs" @back="handleBack" @jump="handleJump" />
    <MapStageTip :stage="stage" :notice="notice" :raised="canGoBack" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import MapTooltip from './MapTooltip.vue'
import MapLegend from './MapLegend.vue'
import MapNavBar from './MapNavBar.vue'
import MapStageTip from './MapStageTip.vue'
import MapSearchBox from './MapSearchBox.vue'
import type { SearchItem } from './MapSearchBox.vue'
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
import { checkCountryCompliance } from '../utils/geo'
import { prefetchDistrictGeoJson } from '../utils/amap-loader'
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
    /** 是否显示搜索框（在当前层级内搜索行政区） */
    showSearch?: boolean
    /** 左键拖拽行为：pan=拖动地图（上下拖即远近），rotate=绕地图旋转 */
    dragMode?: 'pan' | 'rotate'
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
    showSearch: true,
    dragMode: 'pan',
  },
)

const emit = defineEmits<{
  (e: 'drill-down', properties: GeoJsonFeature['properties']): void
  (e: 'ready'): void
  (e: 'geo-data-loaded', geoJson: unknown): void
  (e: 'reset-to-country'): void
  (e: 'level-change', level: { name: string; level: MapLevel['level']; adcode: number | null }): void
  (e: 'hover-change', properties: GeoJsonFeature['properties'] | null): void
  (e: 'select-change', adcode: number | null): void
  (e: 'error', error: unknown): void
}>()

const canvasHost = ref<HTMLDivElement | null>(null)
const searchRef = ref<InstanceType<typeof MapSearchBox> | null>(null)
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

/** 一次性提示：错误 / 无数据，优先于进度条展示 */
const notice = ref<{ text: string; tone: 'info' | 'error' } | null>(null)
let noticeTimer: ReturnType<typeof setTimeout> | null = null

const pushNotice = (text: string, tone: 'info' | 'error' = 'info', duration = 2800) => {
  notice.value = { text, tone }
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    notice.value = null
    noticeTimer = null
  }, duration)
};

const {
  stage,
  busy,
  crumbs,
  current,
  canGoBack,
  canDrill,
  stack,
  loadCountry,
  drill,
  back,
  jumpTo,
  locateByName,
  locateByAdcode,
  resetToCountry,
  findFeature,
} = useMapLevels({
  maxDrillLevel: () => props.maxDrillLevel,
  onEnter: async (level, { rise, report }) => {
    // 全国底图合规校验：台湾省与九段线缺一不可
    if (level.level === 'country') {
      const compliance = checkCountryCompliance(level.geo)
      if (!compliance.ok) {
        console.warn(`[china-map-3d] 底图缺少要素：${compliance.missing.join('、')}`)
        pushNotice(`底图缺少${compliance.missing.join('、')}，请核对数据源`, 'error', 6000)
      }
    }
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
  onError: (error) => {
    console.error('[china-map-3d] 图层加载失败：', error)
    pushNotice('地理数据加载失败，请检查网络后重试', 'error', 4000)
    emit('error', error)
  },
  onNoChild: (name) => pushNotice(`${name} 暂无下级行政区数据`),
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
const selectAdcode = (adcode: number | null) => {
  markers.select(adcode)
  layer.setSelected(adcode)
  emit('select-change', adcode)
};

const adcodeOf = (pick: PickResult | null): number | null => {
  if (!pick) return null
  const info = pick.spot ?? pick.properties
  const adcode = Number(info?.adcode)
  return Number.isFinite(adcode) && adcode > 0 ? adcode : null
};

const drillProperties = (properties: GeoJsonFeature['properties']) => {
  emit('drill-down', properties)
  drill(properties)
};

const handleDrill = (pick: PickResult) => {
  const info = pick.spot ?? pick.properties
  if (!info) return
  drillProperties(info as GeoJsonFeature['properties'])
};

let lastHoverAdcode: number | null = null

const picker = usePointerPick({
  camera: () => viewport.camera(),
  getRoot: () => layer.root(),
  raycaster: viewport.raycaster,
  pointer: viewport.pointer,
  isBusy: () => busy.value,
  onHover: (pick) => {
    const adcode = adcodeOf(pick)
    layer.setHover(adcode)
    // 悬停即后台预取下级数据，等真正双击时通常已经落在本地
    if (pick?.properties && adcode && canDrill(pick.properties as GeoJsonFeature['properties'])) {
      prefetchDistrictGeoJson(String(adcode))
    }
    if (adcode !== lastHoverAdcode) {
      lastHoverAdcode = adcode
      emit('hover-change', (pick?.spot ?? pick?.properties ?? null) as GeoJsonFeature['properties'] | null)
    }
  },
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

/** 搜索候选项 = 当前层级的全部行政区 */
const searchItems = computed<SearchItem[]>(() =>
  (current.value?.geo.features ?? [])
    .filter((feature) => feature?.properties?.name)
    .map((feature) => ({
      name: String(feature.properties.name),
      adcode: Number(feature.properties.adcode) || 0,
      levelText: LEVEL_TEXT[feature.properties.level] ?? '',
    })),
)

/** 搜索命中：能下钻就下钻，否则只选中 */
const handleSearchPick = (item: SearchItem) => {
  const feature = findFeature(String(item.adcode))
  if (!feature) return
  if (canDrill(feature.properties)) drillProperties(feature.properties)
  else {
    selectAdcode(item.adcode)
    pushNotice(`已选中 ${feature.properties.name}（无下级行政区）`)
  }
};

/** 当前层没有候选时回车 → 退回全国层再找一次 */
const handleSearchKeyword = async (keyword: string) => {
  if (!keyword) return
  const result = await locateByName(keyword)
  if (!result) {
    pushNotice(`未找到「${keyword}」`, 'info')
    return
  }
  if (!result.drilled) selectAdcode(result.adcode)
};

const handleBack = () => {
  selectAdcode(null)
  // 回到全国时通知外部
  if (stack.value.length === 2) emit('reset-to-country')
  back()
};

/** 面包屑跳级 */
const handleJump = (index: number) => {
  selectAdcode(null)
  if (index === 0 && stack.value.length === 2) emit('reset-to-country')
  jumpTo(index)
};

/** 外部 API：按 adcode 下钻 */
const drillByAdcode = (adcode: string) => {
  const feature = findFeature(adcode)
  const camera = viewport.camera()
  if (!feature || !camera) return
  handleDrill({ kind: 'region', properties: feature.properties, spot: null, point: camera.position.clone() })
};

/** 外部 API：按 adcode 跨层级定位（自动沿省→市路径下钻） */
const locateByCode = async (adcode: string | number) => {
  const code = await locateByAdcode(adcode)
  if (code == null) {
    pushNotice(`未找到 adcode ${adcode}`, 'info')
    return null
  }
  selectAdcode(code)
  return code
};

/** 外部 API：按名称定位 */
const locateByNames = async (name: string) => {
  const result = await locateByName(name)
  if (!result) {
    pushNotice(`未找到「${name}」`, 'info')
    return null
  }
  if (!result.drilled) selectAdcode(result.adcode)
  return result.adcode
};

/** 外部 API：回到全国 */
const resetToRoot = () => {
  selectAdcode(null)
  resetToCountry()
};

/** 入场动画（deferEntrance 时由外部触发） */
const playEntrance = () => {
  layer.playEntrance()
};

defineExpose({
  drillByAdcode,
  locateByAdcode: locateByCode,
  locateByName: locateByNames,
  jumpTo: handleJump,
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
  () => props.dragMode,
  (mode) => viewport.setDragMode(mode),
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

// 层级变化对外广播（外部可据此同步标题 / 列表）
watch(
  () => current.value?.adcode,
  () => {
    const level = current.value
    if (!level) return
    emit('level-change', { name: level.name, level: level.level, adcode: level.adcode })
  },
)

/** 键盘：Esc 返回上级 · 空格复位视角 · / 聚焦搜索 */
const handleKeydown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return

  if (event.key === 'Escape' && canGoBack.value) {
    event.preventDefault()
    handleBack()
  } else if (event.code === 'Space') {
    event.preventDefault()
    viewport.focus(current.value?.fit ?? null, 0.5)
  } else if (event.key === '/' && props.showSearch) {
    event.preventDefault()
    searchRef.value?.focus()
  }
};

let tickOff: (() => void) | null = null

onMounted(async () => {
  await nextTick()
  viewport.setDragMode(props.dragMode)
  viewport.start()
  const canvas = viewport.canvas()
  if (canvas) picker.attach(canvas)

  tickOff = viewport.onTick((dt, elapsed) => {
    flies.tick(dt, elapsed, viewport.camera())
    zoom.update(viewport.camera()!, viewport.controls())
  })

  window.addEventListener('keydown', handleKeydown, false)

  await loadCountry(!props.deferEntrance)
  zoom.reset(viewport.camera(), viewport.controls())
  emit('ready')

  if (props.initialAdcode) drillByAdcode(props.initialAdcode)
})

onUnmounted(() => {
  tickOff?.()
  tickOff = null
  window.removeEventListener('keydown', handleKeydown, false)
  if (noticeTimer) clearTimeout(noticeTimer)
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
