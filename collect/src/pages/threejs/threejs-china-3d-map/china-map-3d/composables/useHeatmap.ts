/**
 * useHeatmap —— 高度热力图（展示型大屏装饰）
 *
 * 文件职责：
 *   把各城市数据值在空间上做高斯核扩散，烘焙成一张密度纹理（DataTexture），再用
 *   一张贴地平面 + fragment shader 把密度映射成"蓝→青→绿→黄→红"的渐变热力面，
 *   叠加在地图顶面之上（加法混合，呈现辉光热力）。
 *
 * 在整体架构中的角色：
 *   与 useSpotMarkers 并列的纯表现层；挂到 layer.root()，跟随层级重建。
 *   复用 anchorOf 锚点取坐标，与柱体/标牌严格对齐。
 *
 * 与哪些模块协作：
 *   - useMapLayer：热力平面挂到同一 root（与板块顶面同尺度）
 *   - utils/anchor.anchorOf：取坐标
 *   - utils/projection.createProjection：经纬度 → 世界坐标
 *
 * ⚠️ 坑：投影后 y 是"向下"的（d3 约定），世界坐标要取 -y，否则热力面会上下翻转。
 * ⚠️ 坑：热力面 z 必须略高于顶面（depth+eps），否则与顶面 z-fighting 闪烁；但
 *   不要高太多（原 lineZ 教训：悬浮会让面"飘"在板块外）。
 * ⚠️ 纹理用 UnsignedByteType（兼容性最好，避免部分设备不支持 float 纹理）。
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
  visible: () => boolean
}

const readValue = (raw: unknown): number => {
  if (typeof raw === 'number') return raw
  if (raw && typeof raw === 'object') {
    const v = (raw as { count?: number }).count
    if (typeof v === 'number') return v
  }
  return 0
}

/** 顶点着色器：平面 uv 直通，供 fragment 采样密度纹理 */
const HEAT_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * 片元着色器：把 uv 采样到的密度(0~1)映射成热力色带 + 透明度。
 * 色带：深蓝 → 青 → 绿 → 黄 → 红（低→高）。
 */
const HEAT_FRAG = `
  uniform sampler2D uTex;
  uniform float uOpacity;
  varying vec2 vUv;

  vec3 heatColor(float t) {
    // 五段线性插值：蓝(0.0) → 青(0.25) → 绿(0.5) → 黄(0.75) → 红(1.0)
    vec3 c0 = vec3(0.05, 0.12, 0.55);
    vec3 c1 = vec3(0.0, 0.75, 0.85);
    vec3 c2 = vec3(0.15, 0.85, 0.30);
    vec3 c3 = vec3(0.95, 0.85, 0.15);
    vec3 c4 = vec3(0.95, 0.20, 0.15);
    vec3 c;
    if (t < 0.25)      c = mix(c0, c1, t / 0.25);
    else if (t < 0.5)  c = mix(c1, c2, (t - 0.25) / 0.25);
    else if (t < 0.75) c = mix(c2, c3, (t - 0.5) / 0.25);
    else               c = mix(c3, c4, (t - 0.75) / 0.25);
    return c;
  }

  void main() {
    float h = texture2D(uTex, vUv).r;
    if (h <= 0.001) discard;
    vec3 col = heatColor(clamp(h, 0.0, 1.0));
    // 边缘柔和淡出（uv 接近 0/1 时降透明度），避免平面出现硬边方块
    float edge = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x)
               * smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.94, vUv.y);
    float alpha = h * uOpacity * edge;
    gl_FragColor = vec4(col * (0.5 + 0.5 * h), alpha);
  }
`

/**
 * 高度热力图 composable。
 * @param options.getRoot     三维对象挂载根
 * @param options.projectData 按 adcode 映射的统计值，驱动热力强度
 * @param options.visible    总开关
 */
export const useHeatmap = (options: Options) => {
  let mesh: THREE.Mesh | null = null
  let texture: THREE.DataTexture | null = null

  const clear = () => {
    if (mesh) {
      mesh.removeFromParent()
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
      texture?.dispose()
      mesh = null
      texture = null
    }
  }

  /**
   * 构建当前层级的热力面。
   * @param level 当前层级（fit 决定投影尺度与中心）
   */
  const build = (level: MapLevel) => {
    clear()
    const root = options.getRoot()
    if (!root) return
    const data = options.projectData()
    if (!data) return

    const project: ProjectionFn = createProjection(level.fit.center, level.fit.scale)
    const d = mapConfig.decor.heat

    // 收集世界坐标点（注意 y 取负，见 ⚠️ 坑）
    const pts: Array<{ wx: number; wy: number; v: number }> = []
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const feature of level.geo.features) {
      const adcode = Number(feature.properties.adcode)
      if (!adcode) continue
      const v = readValue(data[adcode])
      if (v <= 0) continue
      const center = anchorOf(feature)
      if (!center || center.length !== 2) continue
      const [x, y] = project(center)
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue
      const wx = x
      const wy = -y
      pts.push({ wx, wy, v })
      minX = Math.min(minX, wx)
      maxX = Math.max(maxX, wx)
      minY = Math.min(minY, wy)
      maxY = Math.max(maxY, wy)
    }
    if (pts.length < 2) return

    // 外扩边距，避免热力被平面边缘截断
    const pad = Math.max(maxX - minX, maxY - minY) * 0.1 + 6
    minX -= pad
    maxX += pad
    minY -= pad
    maxY += pad
    const spanX = maxX - minX
    const spanY = maxY - minY

    // 烘焙密度纹理：每个点在以高斯扩散到邻近网格，记录最大峰值用于归一化
    const N = d.grid
    const pixels = new Uint8Array(N * N * 4)
    const sigma = Math.max(spanX, spanY) * 0.05 + 2 // 世界单位的扩散半径
    let peak = 0
    const raw = new Float32Array(N * N)
    for (const p of pts) {
      const gi = ((p.wx - minX) / spanX) * (N - 1)
      const gj = ((p.wy - minY) / spanY) * (N - 1)
      const i0 = Math.max(0, Math.floor(gi - sigma))
      const i1 = Math.min(N - 1, Math.ceil(gi + sigma))
      const j0 = Math.max(0, Math.floor(gj - sigma))
      const j1 = Math.min(N - 1, Math.ceil(gj + sigma))
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const dx = i - gi
          const dy = j - gj
          const contrib = p.v * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma))
          const idx = j * N + i
          raw[idx] += contrib
          if (raw[idx] > peak) peak = raw[idx]
        }
      }
    }
    // 归一化写入纹理（R 通道存热力，A=255）
    for (let k = 0; k < N * N; k++) {
      const val = peak > 0 ? Math.min(1, raw[k] / peak) : 0
      pixels[k * 4] = Math.round(val * 255)
      pixels[k * 4 + 1] = pixels[k * 4]
      pixels[k * 4 + 2] = pixels[k * 4]
      pixels[k * 4 + 3] = 255
    }
    texture = new THREE.DataTexture(pixels, N, N, THREE.RGBAFormat, THREE.UnsignedByteType)
    texture.needsUpdate = true
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    const geometry = new THREE.PlaneGeometry(spanX, spanY)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTex: { value: texture },
        uOpacity: { value: d.opacity },
      },
      vertexShader: HEAT_VERT,
      fragmentShader: HEAT_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
    })
    mesh = new THREE.Mesh(geometry, material)
    // 平面默认在 XY 面（法线 +Z），正好贴着地图顶面；居中放在数据包围盒中心
    mesh.position.set((minX + maxX) / 2, (minY + maxY) / 2, mapConfig.depth + d.zOffset)
    mesh.renderOrder = 7
    mesh.visible = options.visible()
    root.add(mesh)
  }

  return {
    build,
    clear,
    setVisible(visible: boolean) {
      if (mesh) mesh.visible = visible
    },
  }
}
