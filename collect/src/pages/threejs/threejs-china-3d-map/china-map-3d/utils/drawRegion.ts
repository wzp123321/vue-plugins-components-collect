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
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
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
        // 不在这里转 sRGB：本材质渲染到 composer 的线性 renderTarget，
        // 色彩空间转换统一由最后一道 mixPass 完成（见 useMapViewport 的 bloomMixShader）。
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
 * 同步侧壁共享材质的 depth uniform：扁平模式改了 mapConfig.depth 后必须调用，
 * 否则侧壁竖直渐变仍按旧厚度归一化（vZ/depth 错配），薄板会整体发暗或对比失真。
 * 侧壁是全局单例材质，重建几何不会自动更新它的 uniform。
 */
export const updateRegionDepth = (d: number): void => {
  if (sideMaterial) (sideMaterial.uniforms.depth as { value: number }).value = d
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
 * 把 ExtrudeGeometry 的材质组折叠成两组（盖面 / 侧壁）。
 *
 * ⚠️ 坑：ExtrudeGeometry 对**每个 shape** 各 addGroup 两次 —— 盖面 materialIndex 0、
 *   侧壁 materialIndex 1，N 个 shape 就有 2N 个组。而 Mesh 配材质数组时，
 *   draw call 数取决于**组数**，不是材质数：339 个环合进一个 geometry 后照样是
 *   678 次 draw call，等于白合。
 *   这里按材质重排索引缓冲，让同材质的索引连续，再重建为两个组。
 *   调用前后顶点数据完全不动，视觉零变化。
 */
const collapseExtrudeGroups = (geometry: THREE.ExtrudeGeometry) => {
  const groups = geometry.groups
  if (groups.length <= 2) return

  // ⚠️ ExtrudeGeometry 产出的是「非索引几何」（geometry.index === null），
  //   顶点就是一锅三角形汤，没有索引可重排。先补一份 0..N-1 的索引把它变成索引几何。
  //   顶点本来就不共享，补索引不会减少顶点，纯粹是为让分组能重排 —— 代价是每个顶点
  //   多 4 字节索引（五万顶点约 200KB），换来 draw call 从 2N 降到 2。
  //   顶点数必然超过 65535，必须 Uint32（WebGL2 原生支持）。
  if (!geometry.index) {
    const vertexCount = geometry.attributes.position.count
    const idx = new Uint32Array(vertexCount)
    for (let i = 0; i < vertexCount; i += 1) idx[i] = i
    geometry.setIndex(new THREE.BufferAttribute(idx, 1))
  }

  const index = geometry.index
  if (!index) return

  let lidCount = 0
  for (const g of groups) if (g.materialIndex === 0) lidCount += g.count
  if (lidCount === 0 || lidCount === index.count) return

  // 非索引几何里 group.start 指的就是顶点序号，补完 0..N-1 索引后二者一一对应
  const sorted = new Uint32Array(index.count)
  let lidAt = 0
  let sideAt = lidCount
  for (const g of groups) {
    const src = index.array.subarray(g.start, g.start + g.count)
    if (g.materialIndex === 0) {
      sorted.set(src, lidAt)
      lidAt += g.count
    } else {
      sorted.set(src, sideAt)
      sideAt += g.count
    }
  }

  geometry.setIndex(new THREE.BufferAttribute(sorted, 1))
  geometry.clearGroups()
  geometry.addGroup(0, lidCount, 0)
  geometry.addGroup(lidCount, index.count - lidCount, 1)
}

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

  // 一个行政区只用一份顶面材质。原来按环各 new 一个，全国 339 个环就是 339 个
  // MeshPhongMaterial 实例 —— 既拖慢 draw call 之间的状态切换，hover 改色还得逐个遍历。
  const topMaterial = new THREE.MeshPhongMaterial({
    color: mapConfig.color,
    transparent: true,
    opacity: mapConfig.opacity,
    shininess: 18,
    specular: 0x1a3d55,
  })

  const shapes: THREE.Shape[] = []
  // 边界线改走 LineSegments2：闭合环拆成相邻点对写进同一个 buffer，
  // 一个行政区只发一次 draw call（原来每个环一条 Line2）。
  const linePositions: number[] = []

  for (const ring of rings) {
    // ⚠️ lineZ 贴顶面（depth + 0.06）：线框紧贴板块顶面，斜看不飘离
    const positions = ringPositions(ring, project, mapConfig.lineZ)
    if (!positions) continue

    const shape = new THREE.Shape()
    for (let i = 0; i < positions.length; i += 3) {
      if (i === 0) shape.moveTo(positions[i], positions[i + 1])
      else shape.lineTo(positions[i], positions[i + 1])
    }
    shapes.push(shape)

    // 闭合环：末点接回首点，逐段写入线段对 [ax,ay,az, bx,by,bz]
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
  }

  if (!shapes.length) return null

  // 所有环合成一个 geometry：draw call 从「每环 2 次」压成「每省 2 次」。
  // 海南那种 133 个环（南海诸岛）也照样合进来，只是顶点多一点，不额外发 call。
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: mapConfig.depth,
    bevelEnabled: false,
    curveSegments: 1,
  })
  // 关键：不折叠的话 shape 数量直接等于 draw call 数量（每 shape 两个组）
  collapseExtrudeGroups(geometry)

  const mesh = new THREE.Mesh(geometry, [topMaterial, side])
  // [顶面, 侧壁]：射线只在顶面命中，侧壁不参与拾取
  mesh.userData = { kind: 'surface', region: object }
  mesh.renderOrder = 1
  object.add(mesh)

  if (linePositions.length) {
    const lineGeometry = new LineSegmentsGeometry()
    lineGeometry.setPositions(linePositions)
    const line = new (LineSegments2 as any)(lineGeometry, lineMaterial) as THREE.Object3D
    line.renderOrder = 3
    object.add(line)
  }

  return { object, topMaterials: [topMaterial], properties: feature.properties }
};
