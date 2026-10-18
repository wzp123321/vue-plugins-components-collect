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
 * 数据标记：层级数据 → 分档 → 柱体 / 标牌 / 热区。
 * 点击城市后只展示该城市的标牌（数据柱模式下其余标牌保持收起，避免标签糊满屏）。
 */
export const useSpotMarkers = (options: Options) => {
  const legend = ref<LegendEntry[]>([])
  const selectedAdcode = ref<number | null>(null)

  let layer: SpotLayer | null = null
  let growTween: gsap.core.Tween | null = null

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

  /** 入场：柱体自地面逐根生长，卡片在柱顶长成后淡入 */
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

  /** 重建当前层级的标记 */
  const build = (level: MapLevel, animate = true) => {
    const root = options.getRoot()
    clear()
    if (!root) return

    const items = collectItems(level)
    if (!items.length) return

    const values = items.map((item) => item.value)
    const tiers: Tier[] = buildTiers(values, options.columnColor())
    for (const item of items) item.tier = tierOf(item.value, tiers)
    legend.value = tiers.map((tier) => ({ color: tier.color, label: tier.label }))

    layer = createSpotLayer(items, tiers, Math.max(...values))
    root.add(layer.group)
    applySpotVisibility(layer, options.showColumn(), null)
    // 标牌模式下柱体整体隐藏，不必浪费一次生长动画
    if (animate && options.showColumn()) playGrowth(layer)
    else applySpotGrowth(layer, 1)
  };

  /** 选中某个城市：显示它的标牌并做一次弹出动画 */
  const select = (adcode: number | null) => {
    selectedAdcode.value = adcode
    if (!layer) return
    applySpotVisibility(layer, options.showColumn(), adcode)
    if (adcode == null || !options.showColumn()) return
    const plate = layer.plateByAdcode.get(adcode)
    if (!plate || !plate.visible) return
    const base = plate.scale.x || 1
    plate.scale.set(base * 0.72, base * 0.72, 1)
    gsap.killTweensOf(plate.scale)
    gsap.to(plate.scale, { x: base, y: base, duration: 0.34, ease: 'back.out(2.2)' })
  };

  /** 数据柱开关变化：切换显隐规则 */
  const applyMode = () => {
    if (layer) applySpotVisibility(layer, options.showColumn(), selectedAdcode.value)
  };

  return {
    legend,
    selectedAdcode,
    build,
    clear,
    select,
    applyMode,
  }
};
