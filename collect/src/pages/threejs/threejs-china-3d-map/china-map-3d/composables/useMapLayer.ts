import * as THREE from 'three'
import gsap from 'gsap'
import { mapConfig } from '../utils/mapConfig'
import { createProjection } from '../utils/projection'
import type { FitProjection } from '../utils/projection'
import { createOutline } from '../utils/drawOutline'
import { createRegion } from '../utils/drawRegion'
import type { RegionNode } from '../utils/drawRegion'
import { disposeObject3D } from '../utils/dispose'
import type { GeoJsonType } from '../types'

export interface MapLevel {
  geo: GeoJsonType
  adcode: number | null
  name: string
  /** 当前展示的容器层级：country=全国 / province=省内市 / city=市内区 */
  level: 'country' | 'province' | 'city'
  fit: FitProjection
}

export type Report = (stage: { text: string; ratio: number } | null) => void

/** 每帧最多占用的构建时间：超出就让出主线程，保证加载动画不掉帧 */
const SLICE_BUDGET_MS = 8

/** 悬停 / 选中时板块沿 Z 轴抬起的高度（世界单位） */
const LIFT_HOVER = 1.8
const LIFT_FOCUS = 0.9

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

/**
 * 地图图层：负责「一层地图」的几何内容（外轮廓 + 各行政区板块）。
 *
 * 加载节奏刻意分两步：先把边境线画出来（一次成型、很快），
 * 再按时间切片逐块生成立体板块并让它们「升」起来。
 */
export const useMapLayer = (getScene: () => THREE.Scene | null) => {
  let root: THREE.Object3D | null = null
  let outline: THREE.Object3D | null = null
  let regions: RegionNode[] = []
  let hoveredAdcode: number | null = null
  let selectedAdcode: number | null = null
  let disposed = false

  const adcodeOf = (node: RegionNode) => Number(node.properties.adcode) || 0

  /** 悬停抬得最高，选中次之，其余贴回原位 */
  const liftOf = (adcode: number): number => {
    if (adcode && adcode === hoveredAdcode) return LIFT_HOVER
    if (adcode && adcode === selectedAdcode) return LIFT_FOCUS
    return 0
  };

  const paint = () => {
    for (const node of regions) {
      const adcode = adcodeOf(node)
      const active = adcode === selectedAdcode ? 'focus' : adcode === hoveredAdcode ? 'hover' : 'base'
      for (const material of node.topMaterials) {
        material.color.set(
          active === 'focus' ? mapConfig.focusColor : active === 'hover' ? mapConfig.hoverColor : mapConfig.color,
        )
        material.opacity = active === 'base' ? mapConfig.opacity : 1
      }

      // 抬升：只给「高度变了」的板块补间，避免每帧重复起 tween
      const target = liftOf(adcode)
      const current = Number(node.object.userData.lift ?? 0)
      if (current !== target) {
        node.object.userData.lift = target
        gsap.killTweensOf(node.object.position)
        gsap.to(node.object.position, { z: target, duration: 0.22, ease: 'power2.out' })
      }
    }
  };

  /** 清空当前图层：移除节点并释放 GPU 资源 */
  const clear = () => {
    if (!root) return
    // 抬升补间还挂在旧板块上，先掐断再释放
    for (const node of regions) gsap.killTweensOf(node.object.position)
    const scene = getScene()
    disposeObject3D(root)
    scene?.remove(root)
    root = null
    outline = null
    regions = []
    hoveredAdcode = null
    selectedAdcode = null
  };

  const build = async (level: MapLevel, options: { rise: boolean; report: Report }) => {
    const scene = getScene()
    if (!scene) return
    clear()
    if (disposed) return

    const project = createProjection(level.fit.center, level.fit.scale)
    const group = new THREE.Object3D()
    group.userData = { kind: 'mapRoot' }
    group.position.set(-level.fit.bounds.cx, -level.fit.bounds.cy, 0)
    scene.add(group)
    root = group

    // ① 边境线先行：让人先看到轮廓，再看板块生长
    options.report({ text: '正在描绘边境线…', ratio: 0.12 })
    await nextFrame()
    if (disposed || root !== group) return
    outline = createOutline(level.geo, project)
    group.add(outline)

    // ② 时间切片逐块生成：单帧超过预算就让出主线程
    const total = level.geo.features.length
    const created: THREE.Object3D[] = []
    let sliceStart = performance.now()
    for (let index = 0; index < total; index++) {
      if (disposed || root !== group) return
      const node = createRegion(level.geo.features[index], project)
      if (node) {
        regions.push(node)
        group.add(node.object)
        created.push(node.object)
      }
      const elapsed = performance.now() - sliceStart
      if (elapsed >= SLICE_BUDGET_MS || index === total - 1) {
        options.report({ text: `正在生成立体板块 ${index + 1}/${total}`, ratio: 0.14 + 0.7 * ((index + 1) / total) })
        await nextFrame()
        sliceStart = performance.now()
      }
    }

    // ③ 逐块升起：延迟按序递增，形成「由西向东长出来」的观感
    if (options.rise) {
      created.forEach((object, index) => {
        object.scale.z = 0.001
        gsap.to(object.scale, { z: 1, duration: 0.5, ease: 'power2.out', delay: index * 0.012 })
      })
    }
    options.report(null)
  };

  /** 旧图下沉：板块竖向压扁到 0，再释放资源（切层过渡） */
  const sink = (duration = 0.28): Promise<void> => {
    const current = root
    if (!current) return Promise.resolve()
    return new Promise((resolve) => {
      let finished = false
      const finish = () => {
        if (finished) return
        finished = true
        clear()
        resolve()
      }
      gsap.to(current.scale, { z: 0.001, duration, ease: 'power2.in', onComplete: finish })
      setTimeout(finish, duration * 1000 + 260)
    })
  };

  return {
    build,
    clear,
    sink,
    paint,
    setHover(adcode: number | null) {
      if (hoveredAdcode === adcode) return
      hoveredAdcode = adcode
      paint()
    },
    setSelected(adcode: number | null) {
      if (selectedAdcode === adcode) return
      selectedAdcode = adcode
      paint()
    },
    selectedAdcode: () => selectedAdcode,
    root: () => root,
    /** 入场动画（deferEntrance 时由外部触发） */
    playEntrance() {
      if (!root) return
      regions.forEach((node, index) => {
        node.object.scale.z = 0.001
        gsap.to(node.object.scale, { z: 1, duration: 0.5, ease: 'power2.out', delay: index * 0.012 })
      })
    },
    dispose() {
      disposed = true
      clear()
    },
  }
};
