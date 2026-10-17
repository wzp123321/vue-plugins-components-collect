import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { mapConfig } from './mapConfig'
import { getOutlineGlowMaterial, getOutlineMaterial } from './lineMaterials'
import { extractOuterRings } from './geo'
import type { GeoJsonType } from '../types'
import type { ProjectionFn } from './projection'

/**
 * 当前层级的整体外轮廓（国界 / 省界）：实线 + 一层更宽更淡的光晕。
 * 轮廓先于板块出现，所以「先看到边境线、再长地图」的加载节奏靠它。
 */
export function createOutline(geo: GeoJsonType, project: ProjectionFn): THREE.Group {
  const group = new THREE.Group()
  group.userData = { kind: 'outline' }

  const solid = getOutlineMaterial()
  const glow = getOutlineGlowMaterial()
  const z = mapConfig.lineZ + 0.02

  for (const ring of extractOuterRings(geo)) {
    const positions: number[] = []
    let valid = true
    for (const [lng, lat] of ring) {
      const [x, y] = project([lng, lat])
      if (!Number.isFinite(x) || !Number.isFinite(y)) { valid = false; break }
      positions.push(x, -y, z)
    }
    if (!valid || positions.length < 9) continue

    const geometry = new LineGeometry()
    geometry.setPositions(positions)

    const glowLine = new (Line2 as any)(geometry, glow) as THREE.Object3D
    glowLine.renderOrder = 3
    group.add(glowLine)

    const line = new (Line2 as any)(geometry, solid) as THREE.Object3D
    line.renderOrder = 4
    group.add(line)
  }

  return group
}
