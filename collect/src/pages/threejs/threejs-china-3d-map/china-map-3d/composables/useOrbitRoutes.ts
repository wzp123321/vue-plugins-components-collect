/**
 * useOrbitRoutes —— 轨道路线（展示型大屏装饰）
 *
 * 文件职责：
 *   在地图外侧生成若干条倾斜的"轨道环"（TubeGeometry 发光管），每条轨道上跑一颗
 *   带辉光的"卫星"Sprite，沿曲线匀速运动。营造卫星环绕地图的科技感。
 *
 * 在整体架构中的角色：
 *   纯表现层装饰。与 useFlyLines 并列，挂在 layer.root() 下，在 onTick 里推进卫星。
 *   轨道几何独立于地图投影（按世界单位 MAP_EXTENT 尺度布置），不依赖业务数据。
 *
 * 与哪些模块协作：
 *   - useMapLayer：轨道挂到同一 root；中心对齐地图中心（root 已平移到原点）
 *   - useMapViewport.onTick：每帧推进卫星相位
 *   - utils/textures.getGlowTexture：卫星辉光贴图（与柱顶光点共用）
 *
 * ⚠️ 约定：轨道环用 CatmullRomCurve3（闭合）采样生成，便于 getPointAt 匀速取点；
 *   不必用 Line2（链条感），直接用 TubeGeometry 即可。卫星位置每帧 getPointAt(t)
 *   重算，t 按 dt 累加（不要用 performance.now()*speed 再被帧预算跳过 → 卡顿掉帧）。
 */

import * as THREE from 'three'
import { getGlowTexture } from '../utils/textures'
import { mapConfig } from '../utils/mapConfig'

interface Options {
  getRoot: () => THREE.Object3D | null
  visible: () => boolean
}

/** 单颗卫星的运行态 */
interface Satellite {
  curve: THREE.CatmullRomCurve3
  mesh: THREE.Sprite
  t: number
  speed: number
}

/** 生成一条绕地图中心、整体倾斜 tilt 弧度的闭合轨道曲线 */
const makeOrbit = (radius: number, tilt: number, lift: number): THREE.CatmullRomCurve3 => {
  const points: THREE.Vector3[] = []
  const segments = 64
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2
    const x = radius * Math.cos(a)
    const y = radius * Math.sin(a)
    // 绕 X 轴倾斜 tilt：把 (x,y,0) 平面环抬成有立体感的轨道
    const z = y * Math.sin(tilt)
    const yy = y * Math.cos(tilt)
    points.push(new THREE.Vector3(x, yy, z + lift))
  }
  return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5)
}

/** 释放一个 group 内全部几何与材质（轨道专用，避免误 dispose 共享资源） */
const disposeGroup = (group: THREE.Group) => {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.geometry && !(mesh.geometry.userData as { shared?: boolean })?.shared) mesh.geometry.dispose()
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
    else mat?.dispose()
  })
}

/**
 * 轨道路线 composable。
 * @param options.getRoot  三维对象挂载根
 * @param options.visible 总开关
 */
export const useOrbitRoutes = (options: Options) => {
  let group: THREE.Group | null = null
  let satellites: Satellite[] = []

  /** 释放：dispose 所有几何/材质 + 从父节点摘除 */
  const clear = () => {
    if (!group) return
    disposeGroup(group)
    group.removeFromParent()
    group = null
    satellites = []
  }

  /** 构建当前层级的轨道与卫星（几何与层级无关，仅借 root 挂载）。 */
  const build = () => {
    clear()
    const root = options.getRoot()
    if (!root) return

    const d = mapConfig.decor.orbit
    group = new THREE.Group()
    group.userData = { kind: 'orbits' }
    group.position.set(0, 0, mapConfig.depth) // 轨道环中心对齐地图顶面中心

    const count = Math.max(1, d.count)
    for (let k = 0; k < count; k++) {
      // 多条轨道由近到远，倾斜方向交替，避免叠成一条
      const radius = d.radiusNear + (d.radiusFar - d.radiusNear) * (count > 1 ? k / (count - 1) : 0)
      const tilt = d.tilt * (k % 2 === 0 ? 1 : -1) + 0.25 * k
      const curve = makeOrbit(radius, tilt, d.lift)

      const tube = new THREE.TubeGeometry(curve, 160, d.tube, 8, true)
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(d.color),
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const ring = new THREE.Mesh(tube, ringMat)
      ring.renderOrder = 8
      ring.layers.enable(mapConfig.bloomLayer)
      group.add(ring)

      // 卫星：辉光 Sprite，沿曲线跑
      const satMat = new THREE.SpriteMaterial({
        map: getGlowTexture(),
        color: new THREE.Color(d.color),
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      })
      const sat = new THREE.Sprite(satMat)
      sat.scale.setScalar(d.satSize)
      sat.renderOrder = 14
      sat.layers.enable(mapConfig.bloomLayer)
      group.add(sat)
      satellites.push({ curve, mesh: sat, t: Math.random(), speed: d.speed * (0.6 + 0.4 * Math.random()) })
    }

    group.visible = options.visible()
    root.add(group)
  }

  /**
   * 每帧推进卫星相位（t 按 dt 累加，匀速）。
   * @param dt 帧间隔秒
   */
  const tick = (dt: number) => {
    if (!group?.visible) return
    // 每帧热路径：C 式 for 避免迭代协议与临时闭包开销
    for (let i = 0; i < satellites.length; i++) {
      const sat = satellites[i]
      sat.t = (sat.t + dt * sat.speed) % 1
      if (sat.t < 0) sat.t += 1
      const p = sat.curve.getPointAt(sat.t)
      sat.mesh.position.copy(p)
    }
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
