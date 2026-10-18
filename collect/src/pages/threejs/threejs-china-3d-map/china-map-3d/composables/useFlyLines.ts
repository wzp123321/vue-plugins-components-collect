import * as THREE from 'three'
import gsap from 'gsap'
import { createProjection } from '../utils/projection'
import type { ProjectionFn } from '../utils/projection'
import { anchorOf } from '../utils/anchor'
import { createFlyLine, setFlyLineTint, updateFlyLine } from '../utils/drawFlyLine'
import type { FlyAnim } from '../utils/drawFlyLine'
import { disposeObject3D } from '../utils/dispose'
import { mapConfig } from '../utils/mapConfig'
import type { MapLevel } from './useMapLayer'

/** 全国层级的辐射枢纽：13 座省会 / 直辖市 */
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

const BEIJING: [number, number] = [116.4, 39.9]

interface Options {
  getRoot: () => THREE.Object3D | null
  visible: () => boolean
  color: () => string
  speed: () => number
}

/**
 * 流星飞线：全国以北京为枢纽辐射省会，省内以首市为枢纽辐射其它市。
 * 逐帧推进交给渲染循环（dt 累加），与帧率完全解耦。
 */
export const useFlyLines = (options: Options) => {
  let group: THREE.Group | null = null
  let anims: FlyAnim[] = []
  /** 延迟起飞计时器（柱体长完再让流星出现） */
  let revealTimer: gsap.core.Tween | null = null
  /** 相机上一次位置：用于判断是否需要重算条带朝向 */
  const lastCameraPos = new THREE.Vector3()
  let needsOrientation = true

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
    needsOrientation = true
  };

  const projectHub = (
    level: MapLevel,
    project: ProjectionFn,
  ): { hub: [number, number]; spokes: [number, number][] } | null => {
    if (level.level === 'country') {
      const beijing = level.geo.features.find((feature) => Number(feature.properties.adcode) === 110000)
      const hub = (beijing && anchorOf(beijing)) || BEIJING
      const spokes: [number, number][] = []
      for (const coord of FLY_CITIES) {
        const point = project(coord)
        if (Number.isFinite(point[0]) && Number.isFinite(point[1])) spokes.push(point)
      }
      return spokes.length ? { hub, spokes } : null
    }

    const first = level.geo.features[0]
    const hub = first && anchorOf(first)
    if (!hub) return null
    const spokes: [number, number][] = []
    for (const feature of level.geo.features) {
      const center = anchorOf(feature)
      if (!center || center.length !== 2) continue
      if (center[0] === hub[0] && center[1] === hub[1]) continue
      const point = project(center)
      if (Number.isFinite(point[0]) && Number.isFinite(point[1])) spokes.push(point)
    }
    return spokes.length ? { hub, spokes } : null
  };

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
    for (const spoke of graph.spokes) {
      const { object, anim } = createFlyLine(hubPoint, spoke, { tint, speed, phase: Math.random() })
      group.add(object)
      anims.push(anim)
    }
    root.add(group)

    if (delay > 0 && options.visible()) {
      // 等柱体长完再起飞：隐藏期间 tick 不推进，reveal 时统一从起点出发
      group.visible = false
      revealTimer = gsap.delayedCall(delay, () => {
        revealTimer = null
        if (!group) return
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
    tick(dt: number, elapsed: number, camera: THREE.PerspectiveCamera | null) {
      if (!group?.visible || !camera) return
      // 条带朝向依赖相机位置：相机不动就不用重算顶点，省一半写入
      const position = camera.position
      const moved = needsOrientation || lastCameraPos.distanceToSquared(position) > 1e-4
      if (moved) {
        lastCameraPos.copy(position)
        needsOrientation = false
      }
      for (const anim of anims) updateFlyLine(anim, dt, elapsed, position, moved)
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
    },
    setSpeed(speed: number) {
      for (const anim of anims) anim.speed = speed
    },
  }
};
