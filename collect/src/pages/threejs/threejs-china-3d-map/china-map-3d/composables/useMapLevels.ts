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
  /** 目标行政区没有下级数据（已到最细粒度或数据源缺失） */
  onNoChild?: (name: string) => void
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

/**
 * 层级栈：全国 → 省 → 市 三级下钻。
 * 每次下钻都是「按新层级重建地图」，因此三级共用同一套世界尺度与相机参数。
 */
export const useMapLevels = (options: Options) => {
  const stack = shallowRef<MapLevel[]>([])
  const busy = ref(false)
  const stage = ref<{ text: string; ratio: number } | null>(null)

  const current = computed(() => stack.value[stack.value.length - 1] ?? null)
  const canGoBack = computed(() => stack.value.length > 1)
  const crumbs = computed(() => stack.value.map((level) => ({ name: level.name, count: level.geo.features.length })))

  const report: Report = (next) => {
    stage.value = next
  }

  const enter = async (level: MapLevel, rise: boolean) => {
    await options.onLeave()
    await options.onEnter(level, { rise, report })
  };

  /** 首屏：加载全国数据并建图 */
  const loadCountry = async (rise = true) => {
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
  };

  /** 该行政区是否还能往下钻（与 drill 的前置条件保持一致） */
  const canDrill = (properties: GeoJsonFeature['properties'] | null | undefined): boolean => {
    if (!properties) return false
    const adcode = Number(properties.adcode)
    const level = properties.level as MaxDrill | 'district'
    if (!adcode || level === 'district') return false
    const max = options.maxDrillLevel()
    if (max === 'province' && level !== 'province') return false
    // 已是最后一级（市级）不再往下
    if (current.value?.level === 'city') return false
    return true
  };

  /** 下钻到某个行政区的下级 */
  const drill = async (properties: GeoJsonFeature['properties'] | null | undefined) => {
    if (busy.value || !properties) return
    if (!canDrill(properties)) return
    const adcode = Number(properties.adcode)

    busy.value = true
    try {
      report({ text: `正在加载${properties.name}的下级行政区…`, ratio: 0.2 })
      const geo = await fetchDistrictGeoJson(String(adcode))
      if (!geo?.features?.length) {
        report(null)
        options.onNoChild?.(properties.name)
        return
      }
      report({ text: '正在计算投影范围…', ratio: 0.36 })
      await nextFrame()

      const nextLevel: MapLevel['level'] =
        (properties.level as MaxDrill | 'district') === 'province' ? 'province' : 'city'
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
  };

  /** 返回上一级 */
  const back = async () => {
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
  };

  /** 回到全国 */
  const resetToCountry = async () => {
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
  };

  /** 面包屑跳级：直接切到路径上的某一层（index 为 crumbs 下标） */
  const jumpTo = async (index: number) => {
    if (busy.value) return
    const target = stack.value[index]
    if (!target || index === stack.value.length - 1) return
    busy.value = true
    try {
      stack.value = stack.value.slice(0, index + 1)
      await enter(target, true)
    } catch (error) {
      options.onError?.(error)
    } finally {
      report(null)
      busy.value = false
    }
  };

  /** 名字归一化：去掉行政单位后缀，让「江苏」「江苏省」都能命中 */
  const normalizeName = (name: string): string =>
    String(name ?? '').replace(/(省|市|自治区|特别行政区|自治州|地区|盟|县|区|旗|新区)$/g, '');

  const matchFeature = (level: MapLevel | null, target: string): GeoJsonFeature | null => {
    if (!level || !target) return null
    const key = normalizeName(target)
    const features = level.geo.features
    return (
      features.find((item) => normalizeName(item.properties.name) === key) ??
      features.find((item) => String(item.properties.name ?? '').includes(target)) ??
      features.find((item) => String(item.properties.adcode) === target) ??
      null
    )
  };

  /**
   * 按名字定位：先在当前层找，找不到再退回全国层找。
   * 命中且可下钻 → 下钻；命中但不能下钻（已是最细粒度）→ 只返回 adcode 供调用方选中。
   */
  const locateByName = async (name: string): Promise<{ adcode: number; drilled: boolean } | null> => {
    if (busy.value || !name?.trim()) return null
    const keyword = name.trim()
    let hit = matchFeature(current.value, keyword)
    if (!hit && current.value?.level !== 'country') {
      await resetToCountry()
      hit = matchFeature(current.value, keyword)
    }
    if (!hit) return null

    const adcode = Number(hit.properties.adcode) || 0
    if (canDrill(hit.properties)) {
      await drill(hit.properties)
      return { adcode, drilled: true }
    }
    return { adcode, drilled: false }
  };

  /**
   * 按 adcode 定位：从 adcode 反推层级路径（省 2 位 / 市 4 位），逐级下钻。
   * 例如 320500 → 全国 › 江苏省(320000) › 苏州市(320500)。
   */
  const locateByAdcode = async (code: string | number): Promise<number | null> => {
    const full = String(code ?? '').trim()
    if (busy.value || !/^\d{6}$/.test(full)) return null

    await resetToCountry()
    const provinceCode = `${full.slice(0, 2)}0000`
    const province = stack.value[0]?.geo.features.find((item) => String(item.properties.adcode) === provinceCode)
    if (!province) return null
    if (full === provinceCode) return Number(provinceCode)

    if (!canDrill(province.properties)) return Number(provinceCode)
    await drill(province.properties)

    const cityCode = `${full.slice(0, 4)}00`
    if (full === cityCode) return Number(cityCode)
    const city = current.value?.geo.features.find((item) => String(item.properties.adcode) === cityCode)
    if (!city || !canDrill(city.properties)) return Number(full)

    await drill(city.properties)
    return Number(full)
  };

  /** 按 adcode 找当前层级的行政区（供外部 API 使用） */
  const findFeature = (adcode: string | number) => {
    const scope = [current.value, stack.value[0]].filter(Boolean) as MapLevel[]
    for (const level of scope) {
      const feature = level.geo.features.find((item) => String(item.properties.adcode) === String(adcode))
      if (feature) return feature
    }
    return null
  };

  return {
    stack,
    current,
    busy,
    stage,
    crumbs,
    canGoBack,
    report,
    canDrill,
    loadCountry,
    drill,
    back,
    jumpTo,
    locateByName,
    locateByAdcode,
    resetToCountry,
    findFeature,
  }
};
