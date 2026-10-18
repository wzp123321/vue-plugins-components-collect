/**
 * useMapLevels —— 地图层级栈（下钻 / 返回 / 跳转 / 定位）
 *
 * 文件职责：
 *   维护「全国 → 省 → 市」三级层级栈 history[]（数组，栈尾 = 当前层），
 *   负责加载各级 GeoJSON、计算投影范围（fitProjection），并在层级切换时
 *   通过 onEnter / onLeave 回调通知调用方去「重建地图图层」与「对焦相机」。
 *
 * 在整体架构中的角色：
 *   本 composable 是下钻业务的"状态机 + 数据获取中枢"，自身不碰 three.js。
 *   真正的渲染由 useMapLayer（几何板块）/ useMapViewport（相机与取景）/
 *   useSpotMarkers（数据柱）/ useFlyLines（飞线）协作完成；本文件只负责
 *   「现在该显示哪一层、数据在哪、什么时候沉旧图建新图」。
 *
 * 与哪些模块协作：
 *   - useMapLayer.build / sink：onEnter / onLeave 内部调用，真正建/拆几何
 *   - useMapViewport.focus：onEnter 之后由调用方用当前 fit 对焦相机
 *   - useZoomDrill / usePointerPick：命中下钻时最终调用本文件的 drill()
 *
 * ⚠️ 架构约定：下钻 = 重建地图，不是相机飞入 + pivot 拉伸。
 *   每层（全国/省/市）都经 fitProjection() 把投影后最大边长归一到
 *   MAP_EXTENT = 130 世界单位，因此三级共用同一套相机距离、板块厚度、
 *   柱体尺寸与飞线弧度。层级栈只存"当前是哪一层的数据"，重建时整张图
 *   按当前层 fit 重新投影摆放，相机距离也按 fit 重算，节点永不拉伸变形。
 */
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

/**
 * 等待下一帧：把耗时步骤切成"动画帧 + await"的节奏，
 * 让加载进度条（stage）能逐段刷新，而不是一次性卡住主线程。
 */
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

/**
 * 层级栈 composable：对外暴露当前层、面包屑、下钻/返回/跳转与各定位 API。
 *
 * @param options 由调用方注入的回调与配置（见 Options）。onEnter / onLeave
 *   是核心：前者在"进入新层"时负责建图层+对焦相机，后者在"离开旧层"时
 *   负责把旧图下沉销毁。本 composable 只调度，不渲染。
 * @returns 层级状态与操作函数集合（详见各导出项 JSDoc）。
 */
export const useMapLevels = (options: Options) => {
  // 用 shallowRef：栈里存的是普通对象引用，频繁替换整段而不需要深度响应
  const stack = shallowRef<MapLevel[]>([])
  const busy = ref(false)
  const stage = ref<{ text: string; ratio: number } | null>(null)

  const current = computed(() => stack.value[stack.value.length - 1] ?? null)
  const canGoBack = computed(() => stack.value.length > 1)
  // 面包屑：每一层的名称 + 该层行政区数量
  const crumbs = computed(() => stack.value.map((level) => ({ name: level.name, count: level.geo.features.length })))

  // 进度上报：把 {文本, 比例} 写进 stage，UI 层据此画加载进度
  const report: Report = (next) => {
    stage.value = next
  }

  /**
   * 进入某层级：先沉掉旧图（onLeave），再建新图（onEnter）。
   * 这是所有导航（首屏/下钻/返回/跳转）统一走的入口，保证"先拆后建"顺序。
   * @param level 目标层级数据（含 geo / fit）
   * @param rise  是否播放"板块自地面升起"入场动画
   */
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
      // 首屏：栈只保留全国一层
      stack.value = [level]
      await enter(level, rise)
    } catch (error) {
      options.onError?.(error)
    } finally {
      report(null)
      busy.value = false
    }
  };

  /**
   * 该行政区是否还能往下钻（与 drill 的前置条件保持一致）。
   * 判定顺序：有 adcode → 非 district → 未超 maxDrillLevel 限制 → 当前层非 city。
   */
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

  /**
   * 下钻到某个行政区的下级。
   *
   * ⚠️ 坑：下钻不是"相机飞进去"，而是拉取下级 GeoJSON 后 push 进层级栈、
   *   整张地图按新层的 fit 重新投影重建（见文件头架构约定）。
   *   因此全国/省/市三级相机距离、板块厚度、柱体、飞线弧度全部自动对齐，
   *   不需要对当前地图做任何 pivot 拉伸。
   *
   * @param properties 被点击行政区的 GeoJSON properties（含 adcode/level/name）
   */
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

      // 层级对应关系：从省的 properties 下钻得到的是"省内各市"，level 记为 province；
      // 从市的 properties 下钻得到的是"市内各区"，level 记为 city
      const nextLevel: MapLevel['level'] =
        (properties.level as MaxDrill | 'district') === 'province' ? 'province' : 'city'
      const entry: MapLevel = {
        geo,
        adcode,
        name: properties.name,
        level: nextLevel,
        fit: fitProjection(geo),
      }
      // 入栈：栈尾即当前层
      stack.value = [...stack.value, entry]
      await enter(entry, true)
    } catch (error) {
      options.onError?.(error)
    } finally {
      report(null)
      busy.value = false
    }
  };

  /** 返回上一级：弹出栈尾，用新的栈尾（上一级）重建地图 */
  const back = async () => {
    if (busy.value || stack.value.length < 2) return
    busy.value = true
    try {
      // 丢弃栈尾 = 回到上一级；再用新栈尾重建
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

  /** 回到全国：直接截到栈首（全国层） */
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
      // 截断到目标层（含），丢弃其后所有"更深层"
      stack.value = stack.value.slice(0, index + 1)
      await enter(target, true)
    } catch (error) {
      options.onError?.(error)
    } finally {
      report(null)
      busy.value = false
    }
  };

  /**
   * 名字归一化：去掉行政单位后缀，让「江苏」「江苏省」都能命中。
   * 注意用「懒惰匹配 + 结尾 $」确保只剥掉末尾单位，避免误伤中间地名。
   */
  const normalizeName = (name: string): string =>
    String(name ?? '').replace(/(省|市|自治区|特别行政区|自治州|地区|盟|县|区|旗|新区)$/g, '');

  /**
   * 在当前层按名字找 feature，优先级：归一化精确名 → 包含匹配 → adcode 命中。
   * 用于定位时把用户输入的"江苏"映射到 properties.name = "江苏省"。
   */
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
   * @returns 命中 adcode 与是否触发了下钻；未命中返回 null
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
   * @param code 6 位行政区划代码（前 2 位省、前 4 位市）
   * @returns 最终命中的 adcode；中间断档则返回能命中的上一级
   */
  const locateByAdcode = async (code: string | number): Promise<number | null> => {
    const full = String(code ?? '').trim()
    if (busy.value || !/^\d{6}$/.test(full)) return null

    await resetToCountry()
    // 省级代码：把后 4 位补 0（如 320500 → 320000）
    const provinceCode = `${full.slice(0, 2)}0000`
    const province = stack.value[0]?.geo.features.find((item) => String(item.properties.adcode) === provinceCode)
    if (!province) return null
    if (full === provinceCode) return Number(provinceCode)

    if (!canDrill(province.properties)) return Number(provinceCode)
    await drill(province.properties)

    // 市级代码：把后 2 位补 0（如 320512 → 320500）
    const cityCode = `${full.slice(0, 4)}00`
    if (full === cityCode) return Number(cityCode)
    const city = current.value?.geo.features.find((item) => String(item.properties.adcode) === cityCode)
    if (!city || !canDrill(city.properties)) return Number(full)

    await drill(city.properties)
    return Number(full)
  };

  /** 按 adcode 找当前层级的行政区（供外部 API 使用）。先查当前层，再退化查全国层 */
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
