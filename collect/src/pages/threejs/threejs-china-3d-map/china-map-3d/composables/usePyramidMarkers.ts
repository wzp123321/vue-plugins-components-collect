/**
 * usePyramidMarkers —— 动态棱锥点位（展示型大屏装饰）
 *
 * 文件职责：
 *   在 anchorOf 锚点处生成四棱锥（ConeGeometry radialSegments=4）立体点位，作为
 *   数据柱之外的"能量尖塔"装饰：棱锥绕自身 Z 轴自转 + 轻微脉冲缩放。
 *
 * 在整体架构中的角色：
 *   与 useSpotMarkers（数据柱）并列的纯表现层；复用 anchorOf 锚点与
 *   createProjection 投影，保证棱锥/柱体/标牌落点严格一致。
 *
 * 与哪些模块协作：
 *   - useMapLayer：棱锥挂到同一 root（地图几何父节点）
 *   - useMapViewport.onTick：每帧推进自转/脉冲
 *   - utils/anchor.anchorOf：取坐标（见下方 ⚠️ 坑）
 *
 * ⚠️ 坑：棱锥落点必须走 utils/anchor.ts 的 anchorOf() 取 properties.center，
 *   绝不用 centroid（质心会落在山区/湖中）。柱体/标牌/飞线/棱锥四处锚点必须共用
 *   同一份 anchorOf。
 * ⚠️ 朝向：地图 Z 朝上（camera.up=+Z）。ConeGeometry 默认 apex 沿 +Y，需
 *   rotateX(PI/2) 把 apex 转到 +Z，棱锥才"立"在地图上，而不是躺着。
 */

import * as THREE from 'three'
import { createProjection } from '../utils/projection'
import type { ProjectionFn } from '../utils/projection'
import { anchorOf } from '../utils/anchor'
import { mapConfig } from '../utils/mapConfig'
import type { MapLevel } from './useMapLayer'

interface Options {
  getRoot: () => THREE.Object3D | null
  projectData: () => Record<number, number | { count: number; names: string[]; ids: string[] }> | undefined
  color: () => string
  visible: () => boolean
}

/** 读取项目数据里的"数量"（与 useSpotMarkers 的 readCount 同义，这里内联一份） */
const readValue = (raw: unknown): number => {
  if (typeof raw === 'number') return raw
  if (raw && typeof raw === 'object') {
    const v = (raw as { count?: number }).count
    if (typeof v === 'number') return v
  }
  return 0
}

/**
 * 动态棱锥点位 composable。
 * @param options.getRoot   三维对象挂载根（与 layer.root() 同一场景）
 * @param options.projectData 按 adcode 映射的项目数/统计值，驱动棱锥高度
 * @param options.color    棱锥主题色
 * @param options.visible  总开关
 */
export const usePyramidMarkers = (options: Options) => {
  let group: THREE.Group | null = null
  const spinners: THREE.Mesh[] = []

  /** 释放：dispose 几何 + 材质 + 从父节点摘除 */
  const clear = () => {
    if (!group) return
    group.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.geometry && !(mesh.geometry.userData as { shared?: boolean })?.shared) mesh.geometry.dispose()
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else mat?.dispose()
    })
    group.removeFromParent()
    group = null
    spinners.length = 0
  }

  /**
   * 构建当前层级的棱锥点位。
   * @param level 当前层级（fit 决定投影尺度）
   */
  const build = (level: MapLevel) => {
    clear()
    const root = options.getRoot()
    if (!root) return

    const project: ProjectionFn = createProjection(level.fit.center, level.fit.scale)
    const data = options.projectData()
    const d = mapConfig.decor.pyramid

    group = new THREE.Group()
    group.userData = { kind: 'pyramids' }
    const baseColor = new THREE.Color(options.color())

    for (const feature of level.geo.features) {
      const adcode = Number(feature.properties.adcode)
      if (!adcode) continue
      const value = data ? readValue(data[adcode]) : 0
      // 没有数据的城市不画棱锥，避免全国层一堆无意义的尖塔
      if (value <= 0) continue
      const center = anchorOf(feature)
      if (!center || center.length !== 2) continue
      const [x, y] = project(center)
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue

      // 棱锥高度：随数值增长（封顶），最低也有 60% 体量
      const ratio = Math.min(1, value / 60)
      const h = d.height * (0.6 + 0.4 * ratio)
      // radialSegments=4 → 四棱锥；rotateX(PI/2) 把 apex 从 +Y 转到 +Z 立起
      const geometry = new THREE.ConeGeometry(d.radius, h, 4)
      geometry.rotateX(Math.PI / 2)
      const material = new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 0.92 })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(x, -y, mapConfig.spotZ + h / 2)
      mesh.renderOrder = 9
      // 棱锥参与泛光（bloom 图层），尖顶会晕开
      mesh.layers.enable(mapConfig.bloomLayer)
      mesh.userData = { kind: 'pyramid', phase: Math.random() * Math.PI * 2 }
      group.add(mesh)
      spinners.push(mesh)
    }

    group.visible = options.visible()
    root.add(group)
  }

  /**
   * 每帧推进：绕 Z 轴自转 + 正弦脉冲缩放。
   * @param dt      帧间隔秒
   * @param elapsed 累计时间秒
   */
  const tick = (dt: number, elapsed: number) => {
    if (!group?.visible) return
    for (const mesh of spinners) {
      const phase = (mesh.userData as { phase: number }).phase
      mesh.rotation.z = elapsed * 0.6 + phase
      const pulse = 1 + 0.12 * Math.sin(elapsed * 2 + phase)
      mesh.scale.set(pulse, pulse, 1)
    }
    void dt
  }

  return {
    build,
    clear,
    tick,
    setVisible(visible: boolean) {
      if (group) group.visible = visible
    },
  }
}
