import * as THREE from 'three'
import gsap from 'gsap'
import { createProjection } from '../utils/projection'
import type { ProjectionFn } from '../utils/projection'
import { anchorOf } from '../utils/anchor'
import { createFlyLine, setFlyLineTint, updateFlyLine, createRipple, updateRipple, setRippleTint, hash01 } from '../utils/drawFlyLine'
import type { FlyAnim, Ripple } from '../utils/drawFlyLine'
import { disposeObject3D } from '../utils/dispose'
import { mapConfig } from '../utils/mapConfig'
import type { MapLevel } from './useMapLayer'

/** 全国层级的辐射枢纽：13 座省会 / 直辖市的 [经度, 纬度] 对（北京另算） */
const FLY_CITIES: Array<[number, number]> = [
  [121.47, 31.23],
  [113.26, 23.13],
  [104.07, 30.67],
  [114.31, 30.6],
  [108.95, 34.27],
  [126.63, 45.75],
  [87.62, 43.82],
  [102.71, 25.04],
  [91.11, 29.97],
  [123.43, 41.8],
  [103.83, 36.06],
  [110.35, 20.02],
  [106.55, 29.56],
]

// 北京作为全国层的中心枢纽（单独写死，避免依赖某个 feature 的 center 缺失）
const BEIJING: [number, number] = [116.4, 39.9]

interface Options {
  getRoot: () => THREE.Object3D | null
  visible: () => boolean
  color: () => string
  speed: () => number
}

/**
 * useFlyLines —— 流星飞线（全国以北京为枢纽辐射省会，省内以首市为枢纽辐射其它市）。
 *
 * 文件职责：
 *   根据当前层级计算"枢纽点 + 辐射端点"，用 drawFlyLine 生成带 ribbon 与
 *   头部 Sprite 的飞线，并在渲染循环里逐帧推进动画相位。
 *
 * 在整体架构中的角色：
 *   纯表现层装饰。数据柱(useSpotMarkers)与飞线共用同一套锚点(anchorOf)，
 *   保证"线从柱顶出发、落在另一座城市的柱顶"。层级切换时由外部调 build() 重建。
 *
 * 与哪些模块协作：
 *   - useMapViewport.onTick：每帧调 tick() 推进动画
 *   - utils/anchor.anchorOf：取端点坐标（见下方 ⚠️ 坑）
 *   - useMapLayer：build 时传当前 MapLevel 的 fit 做投影
 *
 * ⚠️ 坑：飞线端点坐标必须走 utils/anchor.ts 的 anchorOf() 取 properties.center，
 *   不要用 centroid。DataV 的 centroid 是几何质心，内蒙古/西藏/新疆会落在荒漠或
 *   边境，飞线会"射进无人区"。anchorOf 在中心点贴边时还会朝几何内部回拉。
 *   柱体/标牌/飞线三处锚点必须共用同一个 anchorOf，否则线头对不上柱顶。
 */
export const useFlyLines = (options: Options) => {
  let group: THREE.Group | null = null
  let anims: FlyAnim[] = []
  /** 端点涟漪：枢纽 + 各辐射端点的扩散圆环（与飞线同色、同生命周期） */
  let ripples: Ripple[] = []
  /** 延迟起飞计时器（柱体长完再让流星出现） */
  let revealTimer: gsap.core.Tween | null = null
  /** 相机上一次位置：用于判断是否需要重算条带朝向 */
  const lastCameraPos = new THREE.Vector3()
  let needsOrientation = true

  /** 释放：杀掉延迟计时器 + dispose 几何与材质 + 从父节点摘除 */
  const clear = () => {
    revealTimer?.kill()
    revealTimer = null
    if (group) {
      // 每条飞线自带 ribbon 几何与头部 Sprite 材质，必须显式释放
      disposeObject3D(group)
      group.removeFromParent()
      group = null
    }
    anims = []
    ripples = []
    needsOrientation = true
  };

  /**
   * 根据层级算"枢纽 + 辐射端点"（均为已投影的世界坐标集合前一步的经纬度）。
   * @returns hub 枢纽经纬度；spokes 各辐射目标经纬度
   */
  const projectHub = (
    level: MapLevel,
    project: ProjectionFn,
  ): { hub: [number, number]; spokes: [number, number][] } | null => {
    if (level.level === 'country') {
      // 全国层：枢纽=北京（优先用 adcode=110000 的 center，缺失则回退 BEIJING 常量）
      const beijing = level.geo.features.find((feature) => Number(feature.properties.adcode) === 110000)
      const hub = (beijing && anchorOf(beijing)) || BEIJING
      const spokes: [number, number][] = []
      for (const coord of FLY_CITIES) {
        const point = project(coord)
        if (Number.isFinite(point[0]) && Number.isFinite(point[1])) spokes.push(point)
      }
      return spokes.length ? { hub, spokes } : null
    }

    // 省/市层：枢纽取 features[0] 的 anchor（首府/首市），其余城市作辐射端
    const first = level.geo.features[0]
    const hub = first && anchorOf(first)
    if (!hub) return null
    const spokes: [number, number][] = []
    for (const feature of level.geo.features) {
      // ⚠️ 坑：端点用 anchorOf 取 center，不能用 feature 的几何 centroid
      const center = anchorOf(feature)
      if (!center || center.length !== 2) continue
      if (center[0] === hub[0] && center[1] === hub[1]) continue
      const point = project(center)
      if (Number.isFinite(point[0]) && Number.isFinite(point[1])) spokes.push(point)
    }
    return spokes.length ? { hub, spokes } : null
  };

  /**
   * 构建当前层级的飞线。
   * @param level 当前层级（fit 决定投影尺度）
   * @param delay 延迟起飞秒数（>0 时先隐藏，等数据柱长完再统一从起点出发）
   */
  const build = (level: MapLevel, delay = 0) => {
    clear()
    const root = options.getRoot()
    // 区县层级连线过密，不绘制
    if (!root || level.level === 'city') return

    const project = createProjection(level.fit.center, level.fit.scale)
    const graph = projectHub(level, project)
    if (!graph) return
    const hubPoint = project(graph.hub)
    if (!Number.isFinite(hubPoint[0]) || !Number.isFinite(hubPoint[1])) return

    group = new THREE.Group()
    group.userData = { kind: 'flylines' }
    const tint = options.color()
    const speed = options.speed() ?? mapConfig.fly.speed
    // 地图平面上的锚点 → 世界坐标（屏幕 y 向下 → 世界 y 向上，与 drawFlyLine 同约定）
    const rippleZ = mapConfig.spotZ
    const worldOf = (point: [number, number]) => ({
      x: point[0],
      y: -point[1],
      z: rippleZ,
    })
    // 涟漪相位错峰：用辐射端点数均匀铺开，避免所有圈同起同落的机械感
    const count = graph.spokes.length + 1
    let phaseIndex = 0
    // 枢纽涟漪更大（辐射源）：先放枢纽，再放各端点
    ripples = [
      createRipple(worldOf(hubPoint), tint, mapConfig.fly.ripple.size * mapConfig.fly.ripple.hubScale, phaseIndex++ / count),
    ]
    for (const spoke of graph.spokes) {
      // 速度个体差异（±18%，确定性哈希）：整齐划一的速度会让弧场像节拍器
      const speedMul = 0.82 + hash01(spoke[0], spoke[1], 3) * 0.36
      const { object, anim } = createFlyLine(hubPoint, spoke, {
        tint,
        speed: speed * speedMul,
        phase: Math.random(),
      })
      group.add(object)
      anims.push(anim)
      // 端点涟漪：流星落点一圈圈扩散
      ripples.push(
        createRipple(worldOf(spoke), tint, mapConfig.fly.ripple.size, phaseIndex++ / count),
      )
    }
    for (const ripple of ripples) group.add(ripple.mesh)
    root.add(group)

    if (delay > 0 && options.visible()) {
      // 等柱体长完再起飞：隐藏期间 tick 不推进，reveal 时统一从起点出发
      group.visible = false
      revealTimer = gsap.delayedCall(delay, () => {
        revealTimer = null
        if (!group) return
        // 重置所有飞线相位到 0，确保"同时起跑"，而不是各自残留进度
        for (const anim of anims) anim.p = 0
        group.visible = options.visible()
      })
    } else {
      group.visible = options.visible()
    }
  };

  return {
    build,
    clear,
    /**
     * 每帧推进飞线动画。
     * @param dt      帧间隔秒
     * @param elapsed 累计时间秒
     * @param camera 当前相机（条带朝向依赖相机位置）
     * @param view   视口度量（可选；给了才能按屏幕像素托住线宽，见 drawFlyLine 的像素下限）
     */
    tick(
      dt: number,
      elapsed: number,
      camera: THREE.PerspectiveCamera | null,
      view?: { height: number },
    ) {
      if (!group?.visible || !camera) return
      // 条带朝向依赖相机位置：相机不动就不用重算顶点，省一半写入
      const position = camera.position
      const moved = needsOrientation || lastCameraPos.distanceToSquared(position) > 1e-4
      if (moved) {
        lastCameraPos.copy(position)
        needsOrientation = false
      }
      // fov 是「垂直」视角：1 CSS 像素对应的世界长度 = 2·tan(fov/2)·距离 / 视口高度。
      // 每条线用自己中点到相机的距离，近处的线不会被远处的比例拖细。
      const tanHalf = Math.tan((camera.fov * Math.PI) / 360)
      const viewHeight = view?.height ?? 0
      for (const anim of anims) {
        const worldPerPx =
          viewHeight > 0 ? (2 * tanHalf * position.distanceTo(anim.mid)) / viewHeight : 0
        updateFlyLine(anim, dt, elapsed, position, moved, worldPerPx)
      }
      // 端点涟漪与流星同帧推进（tick 开头已做过 group.visible 早退）
      for (const ripple of ripples) updateRipple(ripple, elapsed)
    },
    /** 重建 / 换层级后强制重算一次朝向 */
    invalidate() {
      needsOrientation = true
    },
    setVisible(visible: boolean) {
      if (group) group.visible = visible
    },
    setColor(color: string) {
      for (const anim of anims) setFlyLineTint(anim, color)
      // 涟漪与拖尾同色：控制台换色时同步
      for (const ripple of ripples) setRippleTint(ripple, color)
    },
    setSpeed(speed: number) {
      for (const anim of anims) anim.speed = speed
    },
  }
};
