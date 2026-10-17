import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { mapConfig } from './mapConfig'
import { getInnerLineMaterial } from './lineMaterials'
import { featureRings } from './geo'
import type { GeoJsonFeature } from '../types'
import type { ProjectionFn } from './projection'
import type { Ring } from './geo'

/** 一个行政区的 3D 板块：顶面（可高亮）+ 侧壁渐变 + 顶面边界线 */
export interface RegionNode {
  /** 区域根节点（挂在它上面的 customProperties 供拾取使用） */
  object: THREE.Object3D
  /** 顶面材质，悬停 / 选中时改色 */
  topMaterials: THREE.MeshPhongMaterial[]
  properties: GeoJsonFeature['properties']
}

let sideMaterial: THREE.ShaderMaterial | null = null

/** 侧壁：竖直渐变，所有区域共用一套材质（只需编译一次） */
function getSideMaterial(): THREE.ShaderMaterial {
  if (sideMaterial) return sideMaterial
  sideMaterial = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(mapConfig.sideColorTop) },
      bottomColor: { value: new THREE.Color(mapConfig.sideColorBottom) },
      depth: { value: mapConfig.depth },
    },
    vertexShader: `
      varying float vZ;
      void main() {
        vZ = position.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float depth;
      varying float vZ;
      void main() {
        gl_FragColor = vec4(mix(bottomColor, topColor, clamp(vZ / depth, 0.0, 1.0)), 1.0);
      }
    `,
  })
  sideMaterial.userData = { shared: true }
  return sideMaterial
}

function ringPositions(ring: Ring, project: ProjectionFn, z: number): number[] | null {
  const positions: number[] = []
  for (const [lng, lat] of ring) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
    const [x, y] = project([lng, lat])
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    positions.push(x, -y, z)
  }
  // 至少 3 个点才构成面
  return positions.length >= 9 ? positions : null
}

/**
 * 生成单个行政区的 3D 板块。
 * 顶面用 Phong 受光，与外轮廓线共用同一份投影，保证边界严丝合缝。
 */
export function createRegion(feature: GeoJsonFeature, project: ProjectionFn): RegionNode | null {
  const rings = featureRings(feature)
  if (!rings.length) return null

  const object: any = new THREE.Object3D()
  object.userData = { kind: 'region' }
  object.customProperties = feature.properties

  const side = getSideMaterial()
  const lineMaterial = getInnerLineMaterial()
  const topMaterials: THREE.MeshPhongMaterial[] = []

  for (const ring of rings) {
    const positions = ringPositions(ring, project, mapConfig.lineZ)
    if (!positions) continue

    const shape = new THREE.Shape()
    for (let i = 0; i < positions.length; i += 3) {
      if (i === 0) shape.moveTo(positions[i], positions[i + 1])
      else shape.lineTo(positions[i], positions[i + 1])
    }

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: mapConfig.depth,
      bevelEnabled: false,
      curveSegments: 1,
    })

    const topMaterial = new THREE.MeshPhongMaterial({
      color: mapConfig.color,
      transparent: true,
      opacity: mapConfig.opacity,
      shininess: 18,
      specular: 0x1a3d55,
    })
    topMaterials.push(topMaterial)

    const mesh = new THREE.Mesh(geometry, [topMaterial, side])
    // [顶面, 侧壁]：射线只在顶面命中，侧壁不参与拾取
    mesh.userData = { kind: 'surface', region: object }
    mesh.renderOrder = 1
    object.add(mesh)

    const lineGeometry = new LineGeometry()
    lineGeometry.setPositions(positions)
    const line = new (Line2 as any)(lineGeometry, lineMaterial) as THREE.Object3D
    line.renderOrder = 3
    object.add(line)
  }

  if (!topMaterials.length) return null
  return { object, topMaterials, properties: feature.properties }
}
