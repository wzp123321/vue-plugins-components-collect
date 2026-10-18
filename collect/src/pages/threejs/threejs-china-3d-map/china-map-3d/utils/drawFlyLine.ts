import * as THREE from 'three'
import { mapConfig } from './mapConfig'
import { getGlowTexture } from './textures'

/**
 * 飞线 = 连续条带几何（ribbon）+ 加法混合拖尾 + 头部光点。
 *
 * 为什么不用 Line2：Line2 是「每段一个独立四边形」，段长与线宽接近时，
 * 相邻段在端点处宽度方向不一致，接缝会露出 V 形缺口与重叠，
 * 屏幕上看起来就是一节一节的链条。这里改成一条完整的三角带：
 * 顶点左右两列，横向方向 = 切线 × 视线，永远正对相机，接缝天然连续。
 */

/** 等弧长采样点数 */
const SEGMENTS = 140
/** 头部白热核长度（占弧长比例） */
const CORE_SPAN = 0.03

const WHITE = new THREE.Color(1, 1, 1)
const TRACK_NEAR = new THREE.Color(mapConfig.fly.trackColorNear)
const TRACK_FAR = new THREE.Color(mapConfig.fly.trackColorFar)

const sideScratch = new THREE.Vector3()
const toCamScratch = new THREE.Vector3()

export interface FlyAnim {
  /** 等弧长采样点（世界坐标） */
  points: THREE.Vector3[]
  /** 每个采样点的单位切线（静态） */
  tangents: THREE.Vector3[]
  /** 拖尾颜色 */
  tint: THREE.Color
  /** 头部位置 0~1 */
  p: number
  /** 每秒前进的弧长比例 */
  speed: number
  head: THREE.Sprite
  headMat: THREE.SpriteMaterial
  /** 拖尾：顶点位置 / 顶点色（每点 2 个顶点） */
  streakPositions: Float32Array
  streakColors: Float32Array
  streakAttr: THREE.BufferAttribute
  streakColorAttr: THREE.BufferAttribute
  /** 轨道：顶点位置（颜色静态） */
  trackPositions: Float32Array
  trackAttr: THREE.BufferAttribute
  phase: number
}

export interface FlyLine {
  object: THREE.Group
  anim: FlyAnim
}

let trackMaterial: THREE.MeshBasicMaterial | null = null
/** 轨道：正常混合的深青条带，能看出轨迹但不抢戏 */
const getTrackMaterial = (): THREE.MeshBasicMaterial => {
  if (!trackMaterial) {
    trackMaterial = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthTest: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
    })
    trackMaterial.userData = { shared: true }
  }
  return trackMaterial
};

let streakMaterial: THREE.MeshBasicMaterial | null = null
/** 拖尾：加法混合，颜色越暗越接近透明（天然形成尾焰收细的观感） */
const getStreakMaterial = (): THREE.MeshBasicMaterial => {
  if (!streakMaterial) {
    streakMaterial = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthTest: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    streakMaterial.userData = { shared: true }
  }
  return streakMaterial
};

/** 三角带骨架：每点 2 个顶点（左、右），相邻点两两成段 */
const createRibbonGeometry = (pointCount: number) => {
  const positions = new Float32Array(pointCount * 6)
  const colors = new Float32Array(pointCount * 6)
  const indices: number[] = []
  for (let i = 0; i < pointCount - 1; i++) {
    const a = i * 2
    indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
  }
  const geometry = new THREE.BufferGeometry()
  const positionAttr = new THREE.BufferAttribute(positions, 3)
  const colorAttr = new THREE.BufferAttribute(colors, 3)
  positionAttr.setUsage(THREE.DynamicDrawUsage)
  colorAttr.setUsage(THREE.DynamicDrawUsage)
  geometry.setAttribute('position', positionAttr)
  geometry.setAttribute('color', colorAttr)
  geometry.setIndex(indices)
  return { geometry, positions, colors, positionAttr, colorAttr }
};

/**
 * 按当前相机位置重算条带的左右顶点。
 * 横向 = 切线 × 视线，保证条带始终正对相机（否则侧视会退化成一条线）。
 * widthAt 提供每个采样点的半宽：拖尾用它在尾部收细成尖，头部保持饱满。
 */
const writeRibbon = (
  positions: Float32Array,
  points: THREE.Vector3[],
  tangents: THREE.Vector3[],
  cameraPos: THREE.Vector3,
  widthAt: (index: number) => number,
) => {
  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    toCamScratch.copy(cameraPos).sub(point)
    if (toCamScratch.lengthSq() < 1e-8) toCamScratch.set(0, 1, 0)
    else toCamScratch.normalize()
    sideScratch.copy(tangents[i]).cross(toCamScratch)
    if (sideScratch.lengthSq() < 1e-8) sideScratch.set(1, 0, 0)
    else sideScratch.normalize()

    const halfWidth = widthAt(i)
    const o = i * 6
    positions[o] = point.x + sideScratch.x * halfWidth
    positions[o + 1] = point.y + sideScratch.y * halfWidth
    positions[o + 2] = point.z + sideScratch.z * halfWidth
    positions[o + 3] = point.x - sideScratch.x * halfWidth
    positions[o + 4] = point.y - sideScratch.y * halfWidth
    positions[o + 5] = point.z - sideScratch.z * halfWidth
  }
};

const collectTangents = (points: THREE.Vector3[]): THREE.Vector3[] => {
  const tangents: THREE.Vector3[] = []
  for (let i = 0; i < points.length; i++) {
    const prev = points[Math.max(0, i - 1)]
    const next = points[Math.min(points.length - 1, i + 1)]
    const tangent = next.clone().sub(prev)
    if (tangent.lengthSq() < 1e-8) tangent.set(1, 0, 0)
    else tangent.normalize()
    tangents.push(tangent)
  }
  return tangents
};

/** 建线时的临时相机位（首帧 tick 会立刻覆盖成真实相机位置） */
const INITIAL_CAMERA = new THREE.Vector3(0, -180, 300)

export const createFlyLine = (
  from: [number, number],
  to: [number, number],
  options: { tint: string; speed?: number; phase?: number },
): FlyLine => {
  const z = mapConfig.spotZ
  const distance = Math.hypot(to[0] - from[0], to[1] - from[1])
  const arc = mapConfig.fly.arcBase + Math.min(mapConfig.fly.arcMax, distance * mapConfig.fly.arcRatio)
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(from[0], -from[1], z),
    new THREE.Vector3((from[0] + to[0]) / 2, -(from[1] + to[1]) / 2, z + arc),
    new THREE.Vector3(to[0], -to[1], z),
  )

  // getSpacedPoints = 等弧长采样：流星全程匀速，不会在贝塞尔参数上忽快忽慢
  const points = curve.getSpacedPoints(SEGMENTS)
  const n = points.length
  const tangents = collectTangents(points)

  // ── 轨道：两端深、中段略亮 ──
  const track = createRibbonGeometry(n)
  const scratch = new THREE.Color()
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const lift = Math.pow(Math.sin(Math.PI * t), 0.7)
    scratch.copy(TRACK_NEAR).lerp(TRACK_FAR, lift * 0.9)
    const o = i * 6
    for (const offset of [o, o + 3]) {
      track.colors[offset] = scratch.r
      track.colors[offset + 1] = scratch.g
      track.colors[offset + 2] = scratch.b
    }
  }
  const trackHalf = mapConfig.fly.trackWidth / 2
  writeRibbon(track.positions, points, tangents, INITIAL_CAMERA, () => trackHalf)
  track.positionAttr.needsUpdate = true
  track.colorAttr.needsUpdate = true
  const trackMesh = new THREE.Mesh(track.geometry, getTrackMaterial())
  trackMesh.renderOrder = 8
  // 顶点每帧重写，包围球不会跟着更新，交给视锥剔除容易误裁剪
  trackMesh.frustumCulled = false

  // ── 拖尾：初始全黑（加法混合下 = 不可见），逐帧写入亮段 ──
  const streak = createRibbonGeometry(n)
  const streakHalf = mapConfig.fly.streakWidth / 2
  writeRibbon(streak.positions, points, tangents, INITIAL_CAMERA, () => streakHalf)
  streak.positionAttr.needsUpdate = true
  const streakMesh = new THREE.Mesh(streak.geometry, getStreakMaterial())
  streakMesh.renderOrder = 9
  streakMesh.frustumCulled = false
  streakMesh.layers.enable(mapConfig.bloomLayer)

  // 头部光点：小范围高光，靠 bloom 晕开
  const headMaterial = new THREE.SpriteMaterial({
    map: getGlowTexture(),
    color: options.tint,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  })
  const head = new THREE.Sprite(headMaterial)
  head.scale.setScalar(mapConfig.fly.headSize)
  head.renderOrder = 12
  head.layers.enable(mapConfig.bloomLayer)
  head.position.copy(points[0])

  const object = new THREE.Group()
  object.userData = { kind: 'flyline' }
  object.add(trackMesh, streakMesh, head)

  const anim: FlyAnim = {
    points,
    tangents,
    tint: new THREE.Color(options.tint),
    p: options.phase ?? Math.random(),
    speed: options.speed ?? mapConfig.fly.speed,
    head,
    headMat: headMaterial,
    streakPositions: streak.positions,
    streakColors: streak.colors,
    streakAttr: streak.positionAttr,
    streakColorAttr: streak.colorAttr,
    trackPositions: track.positions,
    trackAttr: track.positionAttr,
    phase: Math.random() * Math.PI * 2,
  }
  return { object, anim }
};

/** 复用同一个临时向量，避免每帧为每条飞线分配新对象 */
const sampleScratch = new THREE.Vector3()

const samplePoint = (points: THREE.Vector3[], p: number): THREE.Vector3 => {
  const clamped = Math.min(0.999999, Math.max(0, p))
  const raw = clamped * (points.length - 1)
  const index = Math.floor(raw)
  const next = Math.min(points.length - 1, index + 1)
  return sampleScratch.copy(points[index]).lerp(points[next], raw - index)
};

/**
 * 逐帧推进流星：
 * - 头部 = 白热核（短、全白），尾部 = 色调拖尾（长、按幂次衰减）
 * - 弧线首尾各留一小段淡入淡出，避免「瞬移」的突兀感
 * - 相机移动时同步重算条带朝向；相机静止则跳过，省一半顶点写入
 */
export const updateFlyLine = (
  anim: FlyAnim,
  dt: number,
  elapsed: number,
  cameraPos: THREE.Vector3 | null,
  cameraMoved: boolean,
) => {
  const band = mapConfig.fly.streakBand
  anim.p += dt * anim.speed
  if (anim.p >= 1) anim.p -= 1

  const edge = Math.min(anim.p, 1 - anim.p)
  const fade = Math.min(1, edge / 0.08)
  const { points, tangents, tint, p } = anim
  const n = points.length
  const colors = anim.streakColors

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const behind = p - t
    let r = 0
    let g = 0
    let b = 0
    if (behind >= 0 && behind < band) {
      const tail = Math.pow(1 - behind / band, 1.7) * mapConfig.fly.tailGain
      const core = behind < CORE_SPAN ? Math.pow(1 - behind / CORE_SPAN, 2) * mapConfig.fly.coreGain : 0
      r = (tint.r * tail + WHITE.r * core) * fade
      g = (tint.g * tail + WHITE.g * core) * fade
      b = (tint.b * tail + WHITE.b * core) * fade
    }
    const o = i * 6
    colors[o] = r
    colors[o + 1] = g
    colors[o + 2] = b
    colors[o + 3] = r
    colors[o + 4] = g
    colors[o + 5] = b
  }
  anim.streakColorAttr.needsUpdate = true

  if (cameraPos) {
    // 拖尾：头部饱满、尾部收细成尖，每帧随 p 一起推进
    const half = mapConfig.fly.streakWidth / 2
    writeRibbon(anim.streakPositions, points, tangents, cameraPos, (index) => {
      const k = Math.min(1, Math.max(0, (p - index / (n - 1)) / band))
      return half * (0.85 - 0.5 * Math.pow(k, 0.7))
    })
    anim.streakAttr.needsUpdate = true
    if (cameraMoved) {
      const trackHalf = mapConfig.fly.trackWidth / 2
      writeRibbon(anim.trackPositions, points, tangents, cameraPos, () => trackHalf)
      anim.trackAttr.needsUpdate = true
    }
  }

  anim.head.position.copy(samplePoint(points, p))
  // 头部轻微呼吸，像流星掠过时的闪烁
  const pulse = 1 + Math.sin(elapsed * 9 + anim.phase) * 0.1
  anim.head.scale.setScalar(mapConfig.fly.headSize * pulse)
  anim.headMat.opacity = mapConfig.fly.headOpacity * fade
};

/** 修改拖尾色调（控制台换色时调用，下一帧立即生效） */
export const setFlyLineTint = (anim: FlyAnim, tint: string) => {
  anim.tint.set(tint)
  anim.headMat.color.set(tint)
};
