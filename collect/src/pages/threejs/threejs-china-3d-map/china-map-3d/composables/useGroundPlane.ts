/**
 * useGroundPlane —— 三维底板（地图下方随视角透视的网格盘）
 *
 * 文件职责：
 *   在地图正下方铺一块圆形网格底板（同心圆 + 放射线 + 中心光晕），
 *   纯 Canvas 程序化生成纹理，不需要任何图片素材；主题切换时换一整套配色。
 *
 * 在整体架构中的角色：
 *   与 starfield 同级的「背景装饰层」——常驻 scene，不随层级重建。
 *   与页面层的 2D 大屏底图（ChinaMap3D 里的 .map-bg-image）互补：
 *     - 2D 底图贴在屏幕平面，不随相机透视变化；
 *     - 本底板躺在世界坐标 XY 平面，随相机平移/缩放产生真实透视。
 *
 * 与哪些模块协作：
 *   - ChinaMap3D：onMounted 里建、watch(showGroundPlane/theme) 里调、onUnmounted 里释放
 *   - useMapViewport：提供 scene 作为挂载点
 *
 * ⚠️ 约定：
 * 1. 底板是纯装饰，不进泛光图层（默认 layer 0），否则网格线会被 bloom 糊成一片。
 * 2. 暗主题用 AdditiveBlending（发光感），亮主题必须换 NormalBlending ——
 *    浅色底上加法混合等于"越叠越白"，网格会彻底消失。
 * 3. z 放在地图底面(z=0)与底部辉光(-0.1)之下，避免共面 z-fighting。
 */
import * as THREE from 'three'
import { MAP_EXTENT } from '../utils/projection'

/** 底板贴图分辨率（1:1 正方形，圆环居中） */
const TEXTURE_SIZE = 1024
/** 底板边长（世界单位）：地图最大边归一化为 MAP_EXTENT=130，底板向外留一圈余量 */
const PLANE_SIZE = MAP_EXTENT * 3.4
/** 底板平面高度：低于地图底面与底部辉光，避免共面闪烁 */
const PLANE_Z = -0.6

type ThemeName = 'dark' | 'light'

/** 两套主题的线条/光晕配色与混合方式 */
const PALETTE: Record<ThemeName, { line: string; glow: string; blending: THREE.Blending; opacity: number }> = {
  dark: { line: '95,216,255', glow: '64,170,255', blending: THREE.AdditiveBlending, opacity: 1 },
  light: { line: '38,104,168', glow: '86,158,220', blending: THREE.NormalBlending, opacity: 0.85 },
}

/**
 * 画一张径向网格纹理：中心光晕 + 同心圆环 + 24 条放射刻度。
 * @param theme 主题，决定线条颜色（暗=青，亮=深蓝）
 */
const createTexture = (theme: ThemeName): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = TEXTURE_SIZE
  const ctx = canvas.getContext('2d')!
  const center = TEXTURE_SIZE / 2
  const maxRadius = center - 10
  const palette = PALETTE[theme]

  // ① 中心光晕：让地图正下方有一团底光，边缘完全透明
  const glow = ctx.createRadialGradient(center, center, 0, center, center, maxRadius)
  glow.addColorStop(0, `rgba(${palette.glow},0.30)`)
  glow.addColorStop(0.35, `rgba(${palette.glow},0.12)`)
  glow.addColorStop(1, `rgba(${palette.glow},0)`)
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

  // ② 同心圆环：从地图外缘开始画（内圈留给地图本体，避免圆环透过半透明板块显脏），
  //    越靠内越亮，形成向心的聚焦感
  ctx.lineWidth = 1.4
  const step = TEXTURE_SIZE * 0.04
  /** 地图半宽约 65，底板半径约 221，0.34 倍刚好落在地图边缘之外 */
  const innerRadius = maxRadius * 0.34
  for (let radius = innerRadius; radius <= maxRadius; radius += step) {
    const closeness = 1 - radius / maxRadius
    ctx.strokeStyle = `rgba(${palette.line},${(0.08 + 0.26 * closeness).toFixed(3)})`
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, Math.PI * 2)
    ctx.stroke()
  }

  // ③ 放射刻度：长短交替，同样只画地图外圈
  ctx.lineWidth = 1.2
  ctx.strokeStyle = `rgba(${palette.line},0.16)`
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2
    const inner = i % 2 === 0 ? innerRadius : maxRadius * 0.66
    ctx.beginPath()
    ctx.moveTo(center + Math.cos(angle) * inner, center + Math.sin(angle) * inner)
    ctx.lineTo(center + Math.cos(angle) * maxRadius, center + Math.sin(angle) * maxRadius)
    ctx.stroke()
  }

  // ④ 外缘亮环：给底板一个明确的边界，不至于渐隐到看不见
  ctx.lineWidth = 2.5
  ctx.strokeStyle = `rgba(${palette.line},0.45)`
  ctx.beginPath()
  ctx.arc(center, center, maxRadius * 0.96, 0, Math.PI * 2)
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

/**
 * 三维底板控制。
 * @param getScene 返回 viewport 的 scene；为空时惰性跳过（start 之前调用不报错）
 * @returns setVisible / setTheme / syncToFocus / dispose
 */
export const useGroundPlane = (getScene: () => THREE.Scene | null) => {
  let mesh: THREE.Mesh | null = null
  let theme: ThemeName = 'dark'
  let visible = true
  let disposed = false
  /** 底板中心的 x/y 偏移（跟随视点），z 恒为 PLANE_Z */
  let focusX = 0
  let focusY = 0

  /** 把当前焦点偏移写回 mesh（惰性创建时也要调一次，否则新网格停在原点） */
  const applyFocus = () => {
    if (!mesh) return
    mesh.position.x = focusX
    mesh.position.y = focusY
  }

  /** 惰性创建：首次 setVisible / setTheme 时把底板挂进场景 */
  const ensure = () => {
    if (disposed || mesh) return
    const scene = getScene()
    if (!scene) return

    const palette = PALETTE[theme]
    const geometry = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE)
    const material = new THREE.MeshBasicMaterial({
      map: createTexture(theme),
      transparent: true,
      opacity: palette.opacity,
      depthWrite: false,
      blending: palette.blending,
      // 允许相机绕 Z 轴转到任意侧视角度时仍可见
      side: THREE.DoubleSide,
      toneMapped: false,
    })
    mesh = new THREE.Mesh(geometry, material)
    // 平面默认躺在 XY 平面朝 +Z，正是地图的"地面"，无需旋转
    mesh.position.z = PLANE_Z
    applyFocus()
    mesh.visible = visible
    mesh.userData = { kind: 'groundPlane' }
    scene.add(mesh)
  }

  /** 释放旧材质与贴图，再按新主题重建（主题切换是低频操作，重建比逐材质改色可靠） */
  const applyTheme = (name: ThemeName) => {
    theme = name
    if (!mesh) return
    const material = mesh.material as THREE.MeshBasicMaterial
    material.map?.dispose()
    material.map = createTexture(theme)
    material.blending = PALETTE[theme].blending
    material.opacity = PALETTE[theme].opacity
    material.needsUpdate = true
  }

  return {
    /** 显示 / 隐藏底板（不销毁几何，切回来立即生效） */
    setVisible(value: boolean) {
      visible = value
      if (value) ensure()
      if (mesh) mesh.visible = value
    },
    /** 切换主题配色：暗=青色加法混合，亮=深蓝正常混合 */
    setTheme(name: ThemeName) {
      theme = name
      // 先改主题再 ensure：让首次创建直接用新配色，避免"建一次再重建一次"
      if (mesh) applyTheme(name)
      else ensure()
    },
    /**
     * 底板中心跟随视点平移。
     * ⚠️ 只跟 x/y：底板固定在世界原点时，地图平移/下钻后圆环会偏到一边，像"盘子歪了"。
     *    z 必须保持 PLANE_Z，否则会与地图底面共面闪烁。
     * 传入 null 表示回正到世界原点。
     */
    syncToFocus(target: { x: number; y: number } | null) {
      const x = target ? target.x : 0
      const y = target ? target.y : 0
      // 静止时跳过，省掉每帧无意义的矩阵更新
      if (Math.abs(x - focusX) < 1e-3 && Math.abs(y - focusY) < 1e-3) return
      focusX = x
      focusY = y
      applyFocus()
    },
    dispose() {
      disposed = true
      if (!mesh) return
      const material = mesh.material as THREE.MeshBasicMaterial
      material.map?.dispose()
      material.dispose()
      mesh.geometry.dispose()
      getScene()?.remove(mesh)
      mesh = null
    },
  }
}
