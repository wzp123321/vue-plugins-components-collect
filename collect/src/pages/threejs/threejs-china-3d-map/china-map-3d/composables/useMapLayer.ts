import * as THREE from 'three'
import gsap from 'gsap'
import { mapConfig, applyTheme, type ThemeName } from '../utils/mapConfig'
import { createProjection } from '../utils/projection'
import type { FitProjection } from '../utils/projection'
import { createOutline } from '../utils/drawOutline'
import { createRegion } from '../utils/drawRegion'
import type { RegionNode } from '../utils/drawRegion'
import { disposeObject3D } from '../utils/dispose'
import type { GeoJsonType } from '../types'

/** 单层地图的数据描述：GeoJSON + 投影信息 + 层级元信息 */
export interface MapLevel {
  geo: GeoJsonType
  adcode: number | null
  name: string
  /** 当前展示的容器层级：country=全国 / province=省内市 / city=市内区 */
  level: 'country' | 'province' | 'city'
  fit: FitProjection
}

/** 加载进度回调：UI 层据此渲染进度条；传 null 表示结束 */
export type Report = (stage: { text: string; ratio: number } | null) => void

/** 每帧最多占用的构建时间：超出就让出主线程，保证加载动画不掉帧 */
const SLICE_BUDGET_MS = 8

/** 悬停 / 选中时板块沿 Z 轴抬起的高度（世界单位） */
const LIFT_HOVER = 1.8
const LIFT_FOCUS = 0.9

const nextFrame = () => new Promise<void>((resolve) => {
  requestAnimationFrame(() => resolve())
})

/**
 * useMapLayer ——「一层地图」的几何内容（外轮廓 + 各行政区立体板块）。
 *
 * 文件职责：
 *   把某个 MapLevel 的 GeoJSON 投影成 three.js 几何：先一笔画出边境轮廓线，
 *   再按时间切片逐块生成立体板块并让它们"升"起来；同时管理悬停/选中的
 *   抬升与配色、切层时的下沉动画与资源释放。
 *
 * 在整体架构中的角色：
 *   是"地图主体"的建造者。它本身不决定"现在显示哪一层"——那由 useMapLevels
 *   调度（下钻即重建）；本文件只负责"把给定的一层画出来 / 拆掉"。
 *
 * 与哪些模块协作：
 *   - useMapLevels：onEnter 调 build() 建新层，onLeave 调 sink()/clear() 拆旧层
 *   - useMapViewport：scene 挂载点来自其 getScene()
 *   - utils/drawOutline、utils/drawRegion、utils/dispose：真实几何与释放逻辑
 *
 * ⚠️ 架构约定：每次切层都是"重建"，不是相机飞入 + pivot 拉伸。
 *   每层经 fitProjection() 把投影后最大边长归一化到 MAP_EXTENT=130，
 *   因此无论全国/省/市，build() 都按当前 fit 重新投影，板块尺寸、厚度、
 *   拉伸比例天然一致，节点永不拉伸变形。
 */
export const useMapLayer = (getScene: () => THREE.Scene | null) => {
  let root: THREE.Object3D | null = null
  let outline: THREE.Object3D | null = null
  let regions: RegionNode[] = []
  let hoveredAdcode: number | null = null
  /** 选中集合：支持框选 / 多选（P0 交互），单值选中只是容量为 1 的特例 */
  let selectedSet: Set<number> = new Set()
  /**
   * 板块填色模式（choropleth）：adcode → 顶面基色。
   * null = 关闭（回到统一底色）；悬停 / 选中色始终优先于填色。
   * 数据源是 markers 的分档结果（与柱体 / 图例同一套 tier 色）。
   */
  let valueFill: Map<number, string> | null = null
  let disposed = false

  const adcodeOf = (node: RegionNode) => Number(node.properties.adcode) || 0

  /** 悬停抬得最高，选中次之，其余贴回原位 */
  const liftOf = (adcode: number): number => {
    if (adcode && adcode === hoveredAdcode) return LIFT_HOVER
    if (adcode && selectedSet.has(adcode)) return LIFT_FOCUS
    return 0
  };

  /** 重新上色 + 补间抬升：根据 hovered/selected 状态刷新所有板块外观 */
  const paint = () => {
    regions.forEach((node) => {
      const adcode = adcodeOf(node)
      let active: 'focus' | 'hover' | 'base'
      if (selectedSet.has(adcode)) active = 'focus'
      else if (adcode === hoveredAdcode) active = 'hover'
      else active = 'base'
      // 基色：填色模式按分档色上顶面，未命中的区域回退统一底色
      const baseColor = valueFill?.get(adcode) ?? mapConfig.color
      node.topMaterials.forEach((material) => {
        let paintColor: string
        if (active === 'focus') paintColor = mapConfig.focusColor
        else if (active === 'hover') paintColor = mapConfig.hoverColor
        else paintColor = baseColor
        material.color.set(paintColor)
        material.opacity = active === 'base' ? mapConfig.opacity : 1
      })

      // 抬升：只给「高度变了」的板块补间，避免每帧重复起 tween
      const target = liftOf(adcode)
      const current = Number(node.object.userData.lift ?? 0)
      if (current !== target) {
        node.object.userData.lift = target
        // 用 scale.z 把板块「拉高」，而不是 position.z 整体上移。
        // 几何原点在底面（ExtrudeGeometry 的 z 从 0 到 depth），所以放大 z 只推高顶面、
        // 底面纹丝不动 —— 底边留在原地才有"从地里抬起来"的参照；整体上移时底边一起走，
        // 在斜俯视透视下会被读成"整块平移"，不像抬升。
        // 线框与顶面同处一个 object，会按同一比例跟着上移，不会脱开。
        gsap.killTweensOf(node.object.scale)
        gsap.to(node.object.scale, {
          z: 1 + target / mapConfig.depth,
          duration: 0.22,
          ease: 'power2.out',
        })
      }
    })
  };

  /** 清空当前图层：移除节点并释放 GPU 资源 */
  const clear = () => {
    if (!root) return
    // 抬升补间还挂在旧板块上，先掐断再释放
    regions.forEach((node) => gsap.killTweensOf(node.object.scale))
    const scene = getScene()
    disposeObject3D(root)
    scene?.remove(root)
    root = null
    outline = null
    regions = []
    hoveredAdcode = null
    selectedSet.clear()
  };

  /**
   * 构建一层地图：先画边境线，再切片生成立体板块，最后逐块升起。
   *
   * @param level   要构建的层级数据（含 geo / fit）。fit 已把投影最大边归一化到
   *                MAP_EXTENT，故不同层级共用同一世界尺度（见文件头架构约定）。
   * @param options.rise   是否播放板块自地面"长出来"的入场动画
   * @param options.report 加载进度回调
   */
  const build = async (level: MapLevel, options: { rise: boolean; report: Report }) => {
    const scene = getScene()
    if (!scene) return
    clear()
    if (disposed) return

    // 按当前层 fit 建投影器：把经纬度映射到"以地图中心为原点、最大边=MAP_EXTENT"的 XY 平面
    const project = createProjection(level.fit.center, level.fit.scale)
    const group = new THREE.Object3D()
    group.userData = { kind: 'mapRoot' }
    // 把"地理中心"搬到世界原点：group 平移 -中心，使整张图居中于 (0,0)
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
    const buildSlice = async (index: number): Promise<void> => {
      if (index >= total) return
      if (disposed || root !== group) return
      const node = createRegion(level.geo.features[index], project)
      if (node) {
        regions.push(node)
        group.add(node.object)
        created.push(node.object)
      }
      const elapsed = performance.now() - sliceStart
      // 预算耗尽或最后一块 → 让出一帧并刷新进度，避免长列表一次性卡死主线程
      if (elapsed >= SLICE_BUDGET_MS || index === total - 1) {
        options.report({ text: `正在生成立体板块 ${index + 1}/${total}`, ratio: 0.14 + 0.7 * ((index + 1) / total) })
        await nextFrame()
        sliceStart = performance.now()
      }
      await buildSlice(index + 1)
    }
    await buildSlice(0)

    // ③ 逐块升起：延迟按序递增，形成「由西向东长出来」的观感
    if (options.rise) {
      created.forEach((object, index) => {
        // 先压扁到近乎 0（scale.z≈0.001），再补间到 1，营造"生长"而非"出现"
        object.scale.z = 0.001
        gsap.to(object.scale, { z: 1, duration: 0.5, ease: 'power2.out', delay: index * 0.012 })
      })
    }
    options.report(null)
  };

  /**
   * 旧图下沉：板块竖向压扁到 0，再释放资源（切层过渡）。
   * @param duration 下沉动画时长(秒)
   * @returns 动画结束(资源已释放)后的 Promise
   */
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
      // 兜底：保险丝，防止 onComplete 因异常未触发导致调用方永远 await 不下去
      setTimeout(finish, duration * 1000 + 260)
    })
  };

  /** 应用新的选中集合：内容相同则跳过，避免重复 paint / 起重 tween */
  const applySelection = (next: Set<number>) => {
    const same = next.size === selectedSet.size && [...next].every((a) => selectedSet.has(a))
    selectedSet = next
    if (!same) paint()
  }

  return {
    build,
    clear,
    sink,
    paint,
    /**
     * 板块填色模式开关：传入 adcode→颜色映射开启（立即重绘），传 null 关闭。
     * 由 ChinaMap3D 在 markers.build 之后调用，保证映射与当前层数据同步。
     */
    setValueFill(map: Map<number, string> | null) {
      valueFill = map
      paint()
    },
    setHover(adcode: number | null) {
      if (hoveredAdcode === adcode) return
      hoveredAdcode = adcode
      paint()
    },
    /** 单值选中（容量为 1 的集合），保留兼容旧调用方 */
    setSelected(adcode: number | null) {
      applySelection(adcode != null ? new Set([adcode]) : new Set<number>())
    },
    /** 多选：直接套用整个集合（框选 / 累加选择用） */
    setSelectedSet(set: Set<number>) {
      applySelection(new Set(set))
    },
    /** 切换某个 adcode 的选中态（Shift 累加点选用），返回切换后的集合 */
    toggleSelection(adcode: number): Set<number> {
      const next = new Set(selectedSet)
      if (next.has(adcode)) next.delete(adcode)
      else next.add(adcode)
      applySelection(next)
      return next
    },
    /** 当前选中集合（只读副本） */
    selectedSet: () => new Set(selectedSet),
    /**
     * 暴露当前层所有行政区的世界坐标（含 group 平移后的绝对坐标），
     * 供框选投影 / 批量统计 / 画框缩放计算包围盒。框选不逐帧调用，性能无忧。
     */
    regions: () =>
      regions.map((r) => {
        const v = new THREE.Vector3()
        r.object.getWorldPosition(v)
        return { adcode: Number(r.properties.adcode) || 0, world: v }
      }),
    root: () => root,
    /** 入场动画（deferEntrance 时由外部触发） */
    playEntrance() {
      if (!root) return
      regions.forEach((node, index) => {
        node.object.scale.z = 0.001
        gsap.to(node.object.scale, { z: 1, duration: 0.5, ease: 'power2.out', delay: index * 0.012 })
      })
    },
    /**
     * 切换主题（暗 / 亮）：覆写 mapConfig 配色后重新 paint 现有层；
     * 新层级（下钻 / 返回）重建时自动沿用新主题，无需额外处理。
     */
    setTheme(name: ThemeName) {
      applyTheme(name)
      paint()
    },
    dispose() {
      disposed = true
      clear()
    },
  }
};
