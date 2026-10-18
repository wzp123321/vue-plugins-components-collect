import { ref } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'
import { createProjection } from '../utils/projection'
import { anchorOf } from '../utils/anchor'
import { buildTiers, readCount, syntheticCount, tierOf } from '../utils/data'
import type { ProjectData, Tier } from '../utils/data'
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
}

/** 入场生长时长（秒）：短到不拖沓，长到能看清「长出来」的过程 */
const GROW_DURATION = 0.95

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

  /**
   * 把当前层级所有 features 收集成 SpotItem：取数值、算锚点、投影到世界坐标。
   * 数值优先用业务数据 readCount，缺失则 syntheticCount 兜底（保证有东西可画）。
   */
  const collectItems = (level: MapLevel): SpotItem[] => {
    const project = createProjection(level.fit.center, level.fit.scale)
    const items: SpotItem[] = []
    for (const feature of level.geo.features) {
      const adcode = Number(feature.properties.adcode)
      if (!adcode) continue
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
    // 各分档城市数量（供饼图统计用）
    const counts = new Array<number>(tiers.length).fill(0)
    for (const item of items) counts[item.tier]++
    tierCounts.value = counts

    // 以最大值为柱高归一化基准，建出柱体 + 标牌 + 热区
    layer = createSpotLayer(items, tiers, Math.max(...values))
    root.add(layer.group)
    applySpotVisibility(layer, options.showColumn(), null)
    // 标牌模式下柱体整体隐藏，不必浪费一次生长动画
    if (animate && options.showColumn()) playGrowth(layer)
    else applySpotGrowth(layer, 1)
  };

  /**
   * 选中某个城市：显示它的标牌并做一次弹出动画。
   * @param adcode 选中的行政区 adcode；null 表示取消选中
   */
  const select = (adcode: number | null) => {
    selectedAdcode.value = adcode
    if (!layer) return
    applySpotVisibility(layer, options.showColumn(), adcode)
    if (adcode == null || !options.showColumn()) return
    const plate = layer.plateByAdcode.get(adcode)
    if (!plate || !plate.visible) return
    // 先压到 0.72 倍再弹回 1 倍，营造"卡片弹出"的弹性反馈
    const base = plate.scale.x || 1
    plate.scale.set(base * 0.72, base * 0.72, 1)
    gsap.killTweensOf(plate.scale)
    gsap.to(plate.scale, { x: base, y: base, duration: 0.34, ease: 'back.out(2.2)' })
  };

  /** 数据柱开关变化：切换显隐规则（柱体模式 ↔ 标牌模式） */
  const applyMode = () => {
    if (layer) applySpotVisibility(layer, options.showColumn(), selectedAdcode.value)
  };

  return {
    legend,
    tierCounts,
    selectedAdcode,
    build,
    clear,
    select,
    applyMode,
    /** CSS2D 标签模式下隐藏 Sprite 数值卡片，避免两种标签重叠 */
    setCardsVisible(visible: boolean) {
      if (!layer) return
      for (const card of layer.cardByAdcode.values()) card.visible = visible
    },
  }
};
