/**
 * drawOutline.ts —— 当前层级整体外轮廓绘制（国界 / 省界）
 *
 * 本文件职责：
 *   用 geo.extractOuterRings 取出当前层级的整体外边界，画成「实线 + 一层更宽
 *   更淡的光晕」两层 Line2；再用 geo.nineDashSegments 把九段线画成断续线段。
 *   轮廓先于板块出现——「先看到边境线、再长地图」的加载节奏靠它实现。
 *
 * 在整体架构中的角色：地图外框层。与 geo.ts（extractOuterRings / nineDashSegments）、
 *   lineMaterials.ts（实线 + 光晕 + 九段线材质）、projection.ts（project）协作。
 *
 * 协作模块：
 *   - geo.ts（extractOuterRings）
 *   - lineMaterials.ts（getOutlineMaterial / getOutlineGlowMaterial）
 *
 * ⚠️ 坑：外轮廓线 z = lineZ + 0.02 仍须贴顶面（lineZ 本身已是 depth + 0.06），
 *   只是比内部界线再高一点点以免被顶面 z-fighting；斜视角下不会离开板块边缘。
 */

import * as THREE from 'three'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { mapConfig } from './mapConfig'
import { getNineDashMaterial, getOutlineGlowMaterial, getOutlineMaterial } from './lineMaterials'
import { extractOuterRings, nineDashSegments } from './geo'
import type { GeoJsonType } from '../types'
import type { ProjectionFn } from './projection'

/**
 * 当前层级的整体外轮廓（国界 / 省界）：实线 + 一层更宽更淡的光晕。
 * 轮廓先于板块出现，所以「先看到边境线、再长地图」的加载节奏靠它。
 *
 * @param geo     当前层级 GeoJSON
 * @param project 当前层级投影函数
 * @returns 装好实线 + 光晕的外轮廓 Group
 */
export const createOutline = (geo: GeoJsonType, project: ProjectionFn): THREE.Group => {
  const group = new THREE.Group()
  // nineDashSegments 供 useMapLayer.build 做「渲染级」合规校验：数据有九段线，
  // 还得真的写进场景，光查 adcode 挡不住被取景裁掉 / 被过滤掉这类漏画。
  group.userData = { kind: 'outline', nineDashSegments: 0 }

  const solid = getOutlineMaterial()
  const glow = getOutlineGlowMaterial()
  // 贴顶面再抬高 0.02，比内部界线略高，避免与顶面 z-fighting
  const z = mapConfig.lineZ + 0.02

  // 所有环合成一份线段 buffer：外轮廓原来每环建两条 Line2（实线 + 光晕），
  // 中国地图的岛屿环有上百个，仅这一项就能吃掉几百次 draw call。
  // 合并后整层只剩 2 次（实线 + 光晕共用同一个 geometry）。
  const linePositions: number[] = []

  extractOuterRings(geo).forEach((ring) => {
    const positions: number[] = []
    let valid = true
    for (let r = 0; r < ring.length; r++) {
      const [lng, lat] = ring[r]
      const [x, y] = project([lng, lat])
      if (!Number.isFinite(x) || !Number.isFinite(y)) { valid = false; break }
      // 屏幕 y（向下）翻成世界 y（向上）
      positions.push(x, -y, z)
    }
    if (!valid || positions.length < 9) return

    // 闭合环：末点接回首点，逐段写入线段对
    const pointCount = positions.length / 3
    for (let i = 0; i < pointCount; i++) {
      const a = i * 3
      const b = ((i + 1) % pointCount) * 3
      linePositions.push(
        positions[a],
        positions[a + 1],
        positions[a + 2],
        positions[b],
        positions[b + 1],
        positions[b + 2],
      )
    }
  })

  if (linePositions.length) {
    const geometry = new LineSegmentsGeometry()
    geometry.setPositions(linePositions)

    const glowLine = new (LineSegments2 as any)(geometry, glow) as THREE.Object3D
    glowLine.renderOrder = 3
    group.add(glowLine)

    const line = new (LineSegments2 as any)(geometry, solid) as THREE.Object3D
    line.renderOrder = 4
    group.add(line)
  }

  // 九段线：每条中心线是一条非闭合折线，段与段之间天然断开。
  // ⚠️ 不能像外轮廓那样把末点接回首点，否则会画成细长闭合框而不是断续线。
  const dashPositions: number[] = []
  let dashCount = 0
  nineDashSegments(geo).forEach((segment) => {
    const points: number[] = []
    let valid = true
    segment.forEach(([lng, lat]) => {
      const [x, y] = project([lng, lat])
      if (!Number.isFinite(x) || !Number.isFinite(y)) { valid = false; return }
      points.push(x, -y, z)
    })
    const pointCount = points.length / 3
    if (!valid || pointCount < 2) return
    for (let i = 0; i < pointCount - 1; i++) {
      const a = i * 3
      const b = (i + 1) * 3
      dashPositions.push(
        points[a], points[a + 1], points[a + 2],
        points[b], points[b + 1], points[b + 2],
      )
    }
    dashCount += 1
  })
  if (dashPositions.length) {
    const dashGeometry = new LineSegmentsGeometry()
    dashGeometry.setPositions(dashPositions)
    const dashLine = new (LineSegments2 as any)(dashGeometry, getNineDashMaterial()) as THREE.Object3D
    dashLine.renderOrder = 4
    group.add(dashLine)
  }
  group.userData.nineDashSegments = dashCount

  return group
};
