import { ref } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'
import { createProjection } from '../utils/projection'
import { anchorOf } from '../utils/anchor'
import { buildTiers, readCount, syntheticCount, tierOf, monthlySeries } from '../utils/data'
import type { ProjectData, Tier } from '../utils/data'
import { mapConfig } from '../utils/mapConfig'
import { applySpotGrowth, applySpotVisibility, createSpotLayer } from '../components/spot/spotLayer'
import type { SpotItem, SpotLayer } from '../components/spot/spotLayer'
import type { MapLevel } from './useMapLayer'

/** 图例条目：颜色 + 文案 */
export interface LegendEntry {
  color: string
  label: string
}

interface Options {
  getRoot: () => THREE.Object3D | null
  projectData: () => ProjectData | undefined
  columnColor: () => string
  showColumn: () => boolean
  /** 标签渲染模式：sprite=Sprite 文本标签；css2d=DOM 标签（此时隐藏全部 Sprite 文本标签，避免双重） */
  labelMode: () => 'sprite' | 'css2d'
}

/** 入场生长时长（秒）：短到不拖沓，长到能看清「长出来」的过程 */
const GROW_DURATION = 0.95
/** 时间轴月份数（与 recentMonthLabels / monthlySeries 保持一致） */
const MONTH_COUNT = 12

/**
 * useSpotMarkers —— 数据标记（层级数据 → 分档 → 柱体 / 标牌 / 热区）。
 *
 * 文件职责：
 *   把当前层级的业务数据按"数值分档"映射成 3D 数据柱与城市标牌，并管理
 *   入场生长、选中弹出、显隐切换与图例。点击城市后只展示该城市的标牌
 *   （数据柱模式下其余标牌保持收起，避免标签糊满屏）。
 *
 * 在整体架构中的角色：
 *   纯表现层。它决定"每个城市画多高、什么颜色、标牌写什么"，但不决定"显示哪一层"
 *   （那由 useMapLevels 调度，本模块在层级切换时被 build() 重建）。
 *
 * 与哪些模块协作：
 *   - useMapLayer：标记挂到同一 root（地图几何父节点）下
 *   - useFlyLines：数据柱顶 = 飞线端点，二者共用 anchorOf 锚点
 *   - utils/data：分档与计数；utils/anchor：取坐标；components/spot/spotLayer：真实几何
 *
 * ⚠️ 坑：标记位置必须走 utils/anchor.ts 的 anchorOf() 取 properties.center，
 *   绝不用 centroid。DataV 的 centroid 是几何质心，内蒙古/西藏/新疆会落进荒漠或边境，
 *   柱子和标牌会"飘在无人区"。anchorOf 在中心点贴边时会朝几何内部回拉。
 *   柱体 / 标牌 / 飞线三处锚点必须共用同一个 anchorOf，否则线头对不上柱顶。
 */
export const useSpotMarkers = (options: Options) => {
  const legend = ref<LegendEntry[]>([])
  const tierCounts = ref<number[]>([])
  const selectedAdcode = ref<number | null>(null)

  let layer: SpotLayer | null = null
  let growTween: gsap.core.Tween | null = null
  /** 当前层条目（含 value/adcode），供阈值聚焦按值过滤柱体 */
  let lastItems: SpotItem[] = []
  /** 当前层最大值，阈值按"比例 × 最大值"换算成绝对值 */
  let lastMax = 1
  /** 阈值过滤比例（0~1，0=不过滤）：低于该比例的柱体淡出 */
  const thresholdRatio = ref(0)
  /** 时间轴：每个 adcode 的近 12 月序列（确定性，与看板趋势同源） */
  let seriesByAdcode = new Map<number, number[]>()
  /** 时间轴：所有月度值的最大值，作为柱高归一化基准（避免某月超原始最大值后柱体溢出） */
  let seriesMax = 1
  /** adcode → 分档色：build 时生成，供「板块填色模式」给顶面上色（与柱体/图例同一套分档） */
  let tierColorByAdcode = new Map<number, string>()

  /**
   * 把当前层级所有 features 收集成 SpotItem：取数值、算锚点、投影到世界坐标。
   * 数值优先用业务数据 readCount，缺失则 syntheticCount 兜底（保证有东西可画）。
   */
  const collectItems = (level: MapLevel): SpotItem[] => {
    const project = createProjection(level.fit.center, level.fit.scale)
    const items: SpotItem[] = []
    // ⚠️ 按 adcode 去重：省/市级 GeoJSON 偶尔会把上级行政区自身也塞进 features，
    //   一旦同 adcode 出现两次就会建出两份卡片/标牌；而 plateByAdcode / cardByAdcode
    //   是 Map（后写覆盖前写），第一份永远不会被 applySpotVisibility 接管、停在创建时的
    //   visible=true，表现就是「同一省份出现两个标牌」。入口处去重是最省事的一道闸。
    const seen = new Set<number>()
    for (const feature of level.geo.features) {
      const adcode = Number(feature.properties.adcode)
      if (!adcode || seen.has(adcode)) continue
      seen.add(adcode)
      const value =
        readCount(options.projectData()?.[adcode]) || syntheticCount(adcode, feature.properties.level)
      if (value <= 0) continue
      // 锚点 = 主城区坐标，贴边时自动往几何内部收；柱体 / 标牌 / 飞线共用同一套
      // ⚠️ 坑：这里用 anchorOf(feature) 取 properties.center，切勿改用 centroid
      const center = anchorOf(feature)
      if (!center || center.length !== 2) continue
      const [x, y] = project(center)
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue
      items.push({
        adcode,
        coord: [x, y],
        name: feature.properties.name,
        value,
        tier: 0,
        properties: { ...feature.properties, value },
      })
    }
    return items
  };

  /** 释放当前图层：杀掉生长补间、从父节点摘除 */
  const clear = () => {
    growTween?.kill()
    growTween = null
    if (layer) {
      layer.group.removeFromParent()
      layer = null
    }
    legend.value = []
    selectedAdcode.value = null
    tierColorByAdcode = new Map()
  };

  /** 入场生长：把 state.t 从 0 补间到 1，每帧把生长比例写进图层 */
  const playGrowth = (target: SpotLayer) => {
    const state = { t: 0 }
    applySpotGrowth(target, 0)
    growTween = gsap.to(state, {
      t: 1,
      duration: GROW_DURATION,
      ease: 'power2.out',
      onUpdate: () => {
        // 期间可能已切层级，旧图层不再写入
        if (layer === target) applySpotGrowth(target, state.t)
      },
    })
  };

  /**
   * 重建当前层级的标记：收集数据 → 分档 → 建图层 → 播放生长/显隐。
   * @param level   当前层级
   * @param animate 是否播放"柱子长出来"动画（标牌模式下无需生长，直接显现）
   */
  const build = (level: MapLevel, animate = true) => {
    const root = options.getRoot()
    clear()
    if (!root) return

    const items = collectItems(level)
    if (!items.length) return

    // 按数值分档（颜色档位 + 文案），并给每个 item 标注所属档位
    const values = items.map((item) => item.value)
    const tiers: Tier[] = buildTiers(values, options.columnColor())
    for (const item of items) item.tier = tierOf(item.value, tiers)
    legend.value = tiers.map((tier) => ({ color: tier.color, label: tier.label }))
    // 同步生成 adcode → 分档色映射（板块填色模式的数据源；clear 时一并丢弃）
    tierColorByAdcode = new Map(items.map((item) => [item.adcode, tiers[item.tier].color]))
    // 各分档城市数量（供饼图统计用）
    const counts = new Array<number>(tiers.length).fill(0)
    for (const item of items) counts[item.tier]++
    tierCounts.value = counts

    // 以最大值为柱高归一化基准，建出柱体 + 标牌 + 热区
    layer = createSpotLayer(items, tiers, Math.max(...values))
    root.add(layer.group)
    applySpotVisibility(layer, options.showColumn(), null, options.labelMode())
    // 标牌模式下柱体整体隐藏，不必浪费一次生长动画
    if (animate && options.showColumn()) playGrowth(layer)
    else applySpotGrowth(layer, 1)

    // 预生成各行政区的近 12 月序列（确定性，与看板趋势同源）；同时求月度全局最大值
    // 作为时间轴柱高归一化基准，避免旺季值超过原始最大值后柱体溢出视窗
    seriesByAdcode = new Map()
    let sm = 1
    for (const item of items) {
      const s = monthlySeries(item.adcode, item.value, MONTH_COUNT)
      seriesByAdcode.set(item.adcode, s)
      for (const v of s) if (v > sm) sm = v
    }
    seriesMax = sm

    // 记录当前层数据并应用已有的阈值过滤（切换层级时不丢过滤状态）
    lastItems = items
    lastMax = Math.max(...values, 1)
    setThreshold(thresholdRatio.value)
  };

  /**
   * 阈值聚焦：把低于阈值比例的柱体淡出（隐藏柱体 + 柱顶光点），高于阈值的保留。
   * 只切 visible，不重建几何，性能无忧；阈值变化即时生效。
   * @param ratio 0~1 比例（相对当前层最大值），0 = 不过滤
   */
  const setThreshold = (ratio: number) => {
    thresholdRatio.value = Math.max(0, Math.min(1, ratio))
    if (!layer) return
    const actual = thresholdRatio.value * lastMax
    layer.growers.forEach((g, i) => {
      const item = lastItems[i]
      if (!item) return
      const visible = item.value >= actual
      g.column.visible = visible
      g.cap.visible = visible
    })
  };

  /**
   * 时间轴：把数据柱高度切到指定月份的值（其它月份淡出/生长由补间完成）。
   * 柱高沿用 build 时的归一化公式，基准改为「月度全局最大值 seriesMax」，保证
   * 12 个月之间量级可比、不会溢出。只改 transform（scale.z / position.z），不重建几何。
   * @param index   月份下标 0~MONTH_COUNT-1
   * @param animate 是否补间过渡（拖动滑块/自动播放用 true，跳变用 false）
   */
  const setMonth = (index: number, animate = true) => {
    if (!layer) return
    const i = Math.max(0, Math.min(MONTH_COUNT - 1, Math.round(index)))
    // 进入时间轴前先停掉入场生长补间，避免二者抢 scale.z
    growTween?.kill()
    const z = mapConfig.spotZ
    layer.growers.forEach((g, idx) => {
      const item = lastItems[idx]
      if (!item) return
      const series = seriesByAdcode.get(item.adcode)
      const value = series ? series[i] : item.value
      const ratio = Math.max(0.05, Math.min(1, value / seriesMax))
      const height = mapConfig.columnHeight * (0.22 + 0.78 * Math.pow(ratio, 0.85))
      g.height = height
      if (animate) {
        gsap.to(g.column.scale, { z: Math.max(0.0001, height), duration: 0.55, ease: 'power2.out', overwrite: true })
        gsap.to(g.column.position, { z: z + height / 2, duration: 0.55, ease: 'power2.out', overwrite: true })
        gsap.to(g.cap.position, { z: z + height, duration: 0.55, ease: 'power2.out', overwrite: true })
      } else {
        g.column.scale.z = Math.max(0.0001, height)
        g.column.position.z = z + height / 2
        g.cap.position.z = z + height
      }
    })
  };

  /** 时间轴：当前层各行政区逐月合计（供时间轴 HUD / 看板联动显示月度总量） */
  const monthTotals = (): number[] => {
    const sums = new Array(MONTH_COUNT).fill(0)
    seriesByAdcode.forEach((s) => {
      for (let i = 0; i < MONTH_COUNT; i++) sums[i] += s[i] ?? 0
    })
    return sums
  };

  /**
   * 选中某个城市：显示它的标牌并做一次弹出动画。
   * @param adcode 选中的行政区 adcode；null 表示取消选中
   */
  const select = (adcode: number | null) => {
    selectedAdcode.value = adcode
    if (!layer) return
    applySpotVisibility(layer, options.showColumn(), adcode, options.labelMode())
    if (adcode == null || !options.showColumn()) return
    const plate = layer.plateByAdcode.get(adcode)
    if (!plate || !plate.visible) return
    // ⚠️ 坑：Sprite 是宽高不等的矩形（标牌约 13 × 3.2），绝不能拿 scale.x 同时赋给
    //    scale.y —— 那会把贴图纵向拉伸 4 倍，既「大小不对」又把纹理拉伸得发糊。
    //    基准尺寸在首次选中时记入 userData，后续弹跳都以它为准（避免上次动画残留漂移）。
    const data = plate.userData as { baseScale?: [number, number] }
    if (!data.baseScale) data.baseScale = [plate.scale.x, plate.scale.y]
    const [baseX, baseY] = data.baseScale
    gsap.killTweensOf(plate.scale)
    // 先压到 0.72 倍再弹回 1 倍，营造"卡片弹出"的弹性反馈
    plate.scale.set(baseX * 0.72, baseY * 0.72, 1)
    gsap.to(plate.scale, { x: baseX, y: baseY, duration: 0.34, ease: 'back.out(2.2)' })
  };

  /** 数据柱开关 / 标签模式变化：切换显隐规则（柱体模式 ↔ 标牌模式；sprite ↔ css2d） */
  const applyMode = () => {
    if (layer) applySpotVisibility(layer, options.showColumn(), selectedAdcode.value, options.labelMode())
  };

  return {
    legend,
    tierCounts,
    selectedAdcode,
    build,
    clear,
    select,
    applyMode,
    /** adcode → 分档色映射（板块填色模式用；随 build 生成、clear 清空） */
    tierColorByAdcode: () => tierColorByAdcode,
    /** 阈值聚焦：ratio 0~1（相对最大值），0=不过滤 */
    setThreshold,
    /** 时间轴：把数据柱高度切到指定月份（0~11），animate=是否补间 */
    setMonth,
    /** 时间轴月份数 */
    monthCount: MONTH_COUNT,
    /** 时间轴：当前层各行政区逐月合计 */
    monthTotals,
  }
};
