import { computed, ref, shallowRef } from 'vue'
import { fetchChinaGeoJson, fetchDistrictGeoJson } from '../utils/amap-loader'
import { fitProjection } from '../utils/projection'
import type { GeoJsonFeature } from '../types'
import type { MapLevel, Report } from './useMapLayer'

type MaxDrill = 'province' | 'city' | 'district'

interface Options {
  maxDrillLevel: () => MaxDrill
  /** 进入某个层级：由调用方负责建图层、对焦相机 */
  onEnter: (level: MapLevel, context: { rise: boolean; report: Report }) => Promise<void>
  /** 离开当前层级：旧图下沉销毁 */
  onLeave: () => Promise<void> | void
  /** 加载失败 / 无数据时的回调 */
  onError?: (error: unknown) => void
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

/**
 * 层级栈：全国 → 省 → 市 三级下钻。
 * 每次下钻都是「按新层级重建地图」，因此三级共用同一套世界尺度与相机参数。
 */
export function useMapLevels(options: Options) {
  const stack = shallowRef<MapLevel[]>([])
  const busy = ref(false)
  const stage = ref<{ text: string; ratio: number } | null>(null)

  const current = computed(() => stack.value[stack.value.length - 1] ?? null)
  const canGoBack = computed(() => stack.value.length > 1)
  const crumbs = computed(() => stack.value.map((level) => ({ name: level.name, count: level.geo.features.length })))

  const report: Report = (next) => {
    stage.value = next
  }

  async function enter(level: MapLevel, rise: boolean) {
    await options.onLeave()
    await options.onEnter(level, { rise, report })
  }

  /** 首屏：加载全国数据并建图 */
  async function loadCountry(rise = true) {
    busy.value = true
    report({ text: '正在加载地理数据…', ratio: 0.04 })
    await nextFrame()
    try {
      const geo = await fetchChinaGeoJson()
      report({ text: '正在计算投影范围…', ratio: 0.08 })
      await nextFrame()
      const level: MapLevel = {
        geo,
        adcode: null,
        name: '中国',
        level: 'country',
        fit: fitProjection(geo),
      }
      stack.value = [level]
      await enter(level, rise)
    } catch (error) {
      options.onError?.(error)
    } finally {
      report(null)
      busy.value = false
    }
  }

  /** 下钻到某个行政区的下级 */
  async function drill(properties: GeoJsonFeature['properties'] | null | undefined) {
    if (busy.value || !properties) return
    const adcode = Number(properties.adcode)
    const level = properties.level as MaxDrill | 'district'
    if (!adcode || level === 'district') return

    // 下钻深度限制
    const max = options.maxDrillLevel()
    if (max === 'province' && level !== 'province') return
    // 已是最后一级（市级）不再往下
    if (current.value?.level === 'city') return

    busy.value = true
    try {
      report({ text: `正在加载${properties.name}的下级行政区…`, ratio: 0.2 })
      const geo = await fetchDistrictGeoJson(String(adcode))
      if (!geo?.features?.length) {
        report(null)
        return
      }
      report({ text: '正在计算投影范围…', ratio: 0.36 })
      await nextFrame()

      const nextLevel: MapLevel['level'] = level === 'province' ? 'province' : 'city'
      const entry: MapLevel = {
        geo,
        adcode,
        name: properties.name,
        level: nextLevel,
        fit: fitProjection(geo),
      }
      stack.value = [...stack.value, entry]
      await enter(entry, true)
    } catch (error) {
      options.onError?.(error)
    } finally {
      report(null)
      busy.value = false
    }
  }

  /** 返回上一级 */
  async function back() {
    if (busy.value || stack.value.length < 2) return
    busy.value = true
    try {
      stack.value = stack.value.slice(0, -1)
      const previous = stack.value[stack.value.length - 1]
      await enter(previous, true)
    } catch (error) {
      options.onError?.(error)
    } finally {
      report(null)
      busy.value = false
    }
  }

  /** 回到全国 */
  async function resetToCountry() {
    if (busy.value || stack.value.length <= 1) return
    busy.value = true
    try {
      stack.value = stack.value.slice(0, 1)
      await enter(stack.value[0], true)
    } catch (error) {
      options.onError?.(error)
    } finally {
      report(null)
      busy.value = false
    }
  }

  /** 按 adcode 找当前层级的行政区（供外部 API 使用） */
  function findFeature(adcode: string | number) {
    const scope = [current.value, stack.value[0]].filter(Boolean) as MapLevel[]
    for (const level of scope) {
      const feature = level.geo.features.find((item) => String(item.properties.adcode) === String(adcode))
      if (feature) return feature
    }
    return null
  }

  return {
    stack,
    current,
    busy,
    stage,
    crumbs,
    canGoBack,
    report,
    loadCountry,
    drill,
    back,
    resetToCountry,
    findFeature,
  }
}
