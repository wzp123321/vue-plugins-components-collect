/**
 * useCss2dLabels —— CSS2D / CSS3D 渲染标签（展示型大屏，替换 Sprite 标牌）
 *
 * 文件职责：
 *   用 three 的 CSS2DObject 在指定城市锚点处挂"DOM 标签"（城市名 + 数值），相对
 *   Sprite 贴图，DOM 标签天然高清、可放富文本、不受分辨率影响。
 *
 * 在整体架构中的角色：
 *   与 useSpotMarkers 的 Sprite 标牌并列的"标签层"。本文件只负责创建/管理
 *   CSS2DObject（挂到 layer.root()）；真正的 CSS2DRenderer 由 ChinaMap3D 持有
 *   （与 WebGLRenderer 共用同一 canvas 宿主），每帧 render(scene, camera)。
 *
 * 与哪些模块协作：
 *   - useMapLayer：标签挂到同一 root；坐标复用 anchorOf
 *   - utils/anchor.anchorOf：取坐标（见下方 ⚠️ 坑）
 *   - CSS2DRenderer（ChinaMap3D 内）：把 CSS2DObject 投影到屏幕并定位 DOM
 *
 * ⚠️ 坑：标签落点必须走 anchorOf() 取 properties.center（与柱体/标牌一致）。
 * ⚠️ 约定：CSS2D 标签不参与 WebGL 深度测试，会从 3D 物体"背后"穿透显示；
 *   仅保留数值最大的前若干城市（与 Sprite 卡片同口径），避免城市密集时标签糊成一团。
 * ⚠️ 坑（关键）：CSS2DRenderer 判断显隐时只看 **CSS2DObject 自身**的 visible
 *   （源码 `visible = object.visible === true && ...`），而遍历用的是 `scene.traverse`
 *   —— 不看祖先的 visible。因此把父 Group 设成 `visible=false` 对 DOM 标签毫无作用，
 *   标签照样显示。要隐藏必须逐个对象设 visible（本文件的 applyVisibility），
 *   否则"sprite 模式下 DOM 标签仍在"→ 同一省份既有 DOM 标签又有 Sprite 卡片，
 *   看起来就是"有的省份出现两个标牌"（CSS2D 只取前 18 名，故只有部分省有）。
 */

import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { createProjection } from '../utils/projection'
import type { ProjectionFn } from '../utils/projection'
import { anchorOf } from '../utils/anchor'
import { mapConfig } from '../utils/mapConfig'
import type { MapLevel } from './useMapLayer'

interface Options {
  getRoot: () => THREE.Object3D | null
  projectData: () => Record<number, number | { count: number; names: string[]; ids: string[] }> | undefined
  visible: () => boolean
}

/** CSS2D 标签数量上限（与 Sprite 卡片 CARD_MAX_COUNT 同口径，防 DOM 过载） */
const C2D_MAX = 18

const readValue = (raw: unknown): number => {
  if (typeof raw === 'number') return raw
  if (raw && typeof raw === 'object') {
    const v = (raw as { count?: number }).count
    if (typeof v === 'number') return v
  }
  return 0
}

/**
 * CSS2D 标签 composable。
 * @param options.getRoot     三维对象挂载根
 * @param options.projectData 按 adcode 映射的统计值（驱动标签数值）
 * @param options.visible    总开关（'css2d' 标签模式时开，'sprite' 时关）
 */
export const useCss2dLabels = (options: Options) => {
  let group: THREE.Group | null = null

  /**
   * 按开关逐个设置标签显隐。
   * ⚠️ 必须逐个对象设置，不能只设 group.visible：CSS2DRenderer 遍历时不看祖先
   *   visible（见文件头说明）。element.style.display 也一并写，保证即使某一帧
   *   没有 render 也不会残留上一帧的显示状态。
   */
  const applyVisibility = (visible: boolean) => {
    if (!group) return
    group.visible = visible
    group.children.forEach((child) => {
      child.visible = visible
      const el = (child as CSS2DObject).element
      if (el) el.style.display = visible ? '' : 'none'
    })
  }

  /** 释放：摘除所有 CSS2DObject（其 DOM 元素会随对象移除自动脱离文档） */
  const clear = () => {
    if (!group) return
    group.children.slice().forEach((child) => {
      const label = child as CSS2DObject
      label.element?.remove()
      label.removeFromParent()
    })
    group.removeFromParent()
    group = null
  }

  /** 生成一个标签 DOM（暗底圆角 + 名称/数值 + 左侧色条） */
  const makeElement = (name: string, value: string, color: string): HTMLDivElement => {
    const el = document.createElement('div')
    el.className = 'map-c2d-label'
    el.style.borderColor = color
    el.innerHTML = `<span class="map-c2d-label__name">${name}</span><span class="map-c2d-label__value">${value}</span>`
    return el
  }

  /**
   * 构建当前层级的 CSS2D 标签（仅数值最大的前 C2D_MAX 个城市）。
   * @param level 当前层级
   */
  const build = (level: MapLevel) => {
    clear()
    const root = options.getRoot()
    if (!root) return
    const data = options.projectData()
    if (!data) return

    const project: ProjectionFn = createProjection(level.fit.center, level.fit.scale)
    // 取数值最大的前 N 个城市，避免密集区标签糊成一团
    const ranked = level.geo.features
      .map((feature) => ({ feature, value: readValue(data[Number(feature.properties.adcode)]) }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, C2D_MAX)

    // 闭包内（forEach 回调）拿不到 let 变量的赋值收窄，先用局部 const 承接
    const g = new THREE.Group()
    group = g
    g.userData = { kind: 'c2dLabels' }
    ranked.forEach(({ feature, value }) => {
      const center = anchorOf(feature)
      if (!center || center.length !== 2) return
      const [x, y] = project(center)
      if (!Number.isFinite(x) || !Number.isFinite(y)) return
      const el = makeElement(String(feature.properties.name), String(value), '#5FC9EE')
      const label = new CSS2DObject(el)
      // 标签锚点抬到柱顶附近高度，避免压在板块上
      label.position.set(x, -y, mapConfig.spotZ + 2)
      g.add(label)
    })
    group.visible = options.visible()
    root.add(group)
    // 逐个对象同步显隐：只在 sprite 模式下把每个标签也置为不可见，否则 DOM 标签会漏显
    applyVisibility(options.visible())
  }

  return {
    build,
    clear,
    setVisible(visible: boolean) {
      applyVisibility(visible)
    },
  }
}
