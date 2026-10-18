/**
 * drawRegion.ts —— 单个行政区 3D 板块绘制（顶面 + 侧壁 + 边界线）
 *
 * 本文件职责：
 *   把一个 GeoJSON Feature 投影后拉伸成一块 3D 板块：
 *   - 顶面：MeshPhongMaterial 受光，悬停 / 选中时改色（供拾取与高亮）
 *   - 侧壁：共享 ShaderMaterial 竖直渐变（只编译一次）
 *   - 边界线：Line2 内部界线，与外轮廓共用同一份投影，保证边界严丝合缝
 *
 * 在整体架构中的角色：地图「地块」的构建单元。外层遍历 features 逐个调用
 *   createRegion，拼成当前层级地图。与 projection（投影）、lineMaterials
 *   （界线材质）、geo（取环）协作。
 *
 * 协作模块：
 *   - projection.ts（project 函数）
 *   - lineMaterials.ts（getInnerLineMaterial）
 *   - geo.ts（featureRings）
 *
 * ⚠️ 坑：线框层级 z 必须贴顶面（mapConfig.lineZ = depth + 0.06）。原来悬浮 1.5，
 *   斜视角下北侧边境线会明显离开板块边缘；紧贴顶面后斜看不飘离。
 */

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

/**
 * 侧壁：竖直渐变 + 自上而下的"扫描流光"带，所有区域共用一套材质（只需编译一次）。
 * 顶点里直接传 position.z（0=底, depth=顶），片元按 vZ/depth 在底/顶色间 mix，
 * 并叠加一条随时间自下而上扫掠的发光带（uScanIntensity=0 时完全不显示，等同原版）。
 * 注意：侧壁不参与拾取，射线只在顶面命中（见 createRegion 中 mesh.userData）。
 */
const getSideMaterial = (): THREE.ShaderMaterial => {
  if (sideMaterial) return sideMaterial
  sideMaterial = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(mapConfig.sideColorTop) },
      bottomColor: { value: new THREE.Color(mapConfig.sideColorBottom) },
      depth: { value: mapConfig.depth },
      uTime: { value: 0 },
      uScanColor: { value: new THREE.Color(mapConfig.decor.scan.color) },
      uScanWidth: { value: mapConfig.decor.scan.width },
      uScanSpeed: { value: mapConfig.decor.scan.speed },
      uScanIntensity: { value: 0 },
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
      uniform float uTime;
      uniform vec3 uScanColor;
      uniform float uScanWidth;
      uniform float uScanSpeed;
      uniform float uScanIntensity;
      varying float vZ;
      void main() {
        vec3 base = mix(bottomColor, topColor, clamp(vZ / depth, 0.0, 1.0));
        // 自下而上扫掠的发光带：head 从 0 升到 1 循环，窄带高亮
        float h = clamp(vZ / depth, 0.0, 1.0);
        float head = fract(uTime * uScanSpeed);
        float d = abs(h - head);
        // 环形过渡：到顶/底不突变（用 min 距离两端）
        d = min(d, abs((h + 1.0) - head));
        float scan = smoothstep(uScanWidth, 0.0, d);
        // 极淡的静态等高条纹，增加"科技感"底纹（强度仅 0.05，几乎不可见）
        float contour = 0.04 * (0.5 + 0.5 * sin(h * 46.0 - uTime * 0.6));
        base += uScanColor * (scan * uScanIntensity + contour * uScanIntensity * 0.18);
        gl_FragColor = vec4(base, 1.0);
      }
    `,
  })
  sideMaterial.userData = { shared: true }
  return sideMaterial
};

/**
 * 每帧推进侧壁扫描动画的时间戳（驱动 uTime）。
 * @param elapsed 渲染循环累计秒数
 */
export const updateRegionScan = (elapsed: number) => {
  if (sideMaterial) (sideMaterial.uniforms.uTime as { value: number }).value = elapsed
};

/**
 * 开启 / 关闭侧壁扫描流光（直接改共享材质的强度 uniform）。
 * @param enabled true=显示扫掠带，false=回到纯渐变（等同原版）
 */
export const setRegionScan = (enabled: boolean): void => {
  if (sideMaterial) {
    (sideMaterial.uniforms.uScanIntensity as { value: number }).value = enabled
      ? mapConfig.decor.scan.intensity
      : 0
  }
};

/**
 * 把一个环投影成顶面用的三维点序列 [x, y, z, ...]（z = lineZ 贴顶面）。
 * 坐标转换：世界 (x, -y, z)，即把投影的屏幕 y（向下）翻成世界 y（向上）。
 * @returns 点序列；若合法点少于 3 个（构不成面）返回 null
 */
const ringPositions = (ring: Ring, project: ProjectionFn, z: number): number[] | null => {
  const positions: number[] = []
  for (const [lng, lat] of ring) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
    const [x, y] = project([lng, lat])
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    positions.push(x, -y, z)
  }
  // 至少 3 个点才构成面
  return positions.length >= 9 ? positions : null
};

/**
 * 生成单个行政区的 3D 板块。
 * 顶面用 Phong 受光，与外轮廓线共用同一份投影，保证边界严丝合缝。
 *
 * @param feature GeoJSON Feature
 * @param project 当前层级的投影函数
 * @returns RegionNode；无环或全环非法时返回 null
 */
export const createRegion = (feature: GeoJsonFeature, project: ProjectionFn): RegionNode | null => {
  const rings = featureRings(feature)
  if (!rings.length) return null

  const object: any = new THREE.Object3D()
  object.userData = { kind: 'region' }
  object.customProperties = feature.properties

  const side = getSideMaterial()
  const lineMaterial = getInnerLineMaterial()
  const topMaterials: THREE.MeshPhongMaterial[] = []

  for (const ring of rings) {
    // ⚠️ lineZ 贴顶面（depth + 0.06）：线框紧贴板块顶面，斜看不飘离
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
};
