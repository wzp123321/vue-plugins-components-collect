/**
 * drawFlyLine.ts —— 飞线（流星）绘制：连续三角带 ribbon + 加法拖尾 + 头部光点
 *
 * 本文件职责：
 *   在两点之间画一条「流星」飞线：极暗轨道 + 加法混合的彩色拖尾（白热核 + 尾焰）
 *   + 跟随同一条曲线的彗星头 Sprite。createFlyLine 建线，updateFlyLine 逐帧推进。
 *
 * 在整体架构中的角色：地图之上的动态装饰层。端点坐标应来自 anchor.ts 的
 *   anchorOf()（与柱体 / 标牌共用同一锚点），与 projection（投影）、mapConfig
 *   （fly 参数）、textures（光斑）协作。
 *
 * 协作模块：
 *   - anchor.ts（端点锚点）
 *   - mapConfig.ts（fly.* 参数）
 *   - textures.ts（getGlowTexture 头部光点）
 *
 * ⚠️ 坑（飞线连贯性）：progress 必须按 dt 累加推进（见 updateFlyLine 的
 *   `anim.p += dt * anim.speed`），不要用 performance.now()*speed 这种绝对时间
 *   再被帧预算跳过——后者在掉帧时会让流星瞬移、断裂。同一曲线上还挂一个
 *   Sprite「彗星头」跟随，保证视觉连续。
 * ⚠️ 坑（不要用 Line2）：Line2 是「每段一个独立四边形」，段长与线宽接近时相邻
 *   段端点宽度不一致，接缝露 V 形缺口与重叠，看起来就是一节一节链条。正解是用
 *   一条连续三角带 ribbon：每点 2 顶点、横向 = 切线 × 视线、永远正对相机。ribbon
 *   顶点每帧重写 → 包围球不会跟着更新 → 必须 frustumCulled=false，否则会被误裁剪。
 * ⚠️ 坑（等弧长采样）：用 curve.getSpacedPoints() 而非 getPoints()，否则流星在
 *   贝塞尔参数上忽快忽慢，全程匀速靠等弧长采样保证。
 *
 * ⚠️ 坑（缩小后断成一截一截）：条带宽度是按「世界单位」写死的（streakWidth=0.66），
 *   相机拉远时它的屏幕宽度会一路缩到 1 像素以下。WebGL 没有 MSAA 时（本工程用
 *   EffectComposer 后处理，renderTarget 默认 samples=0），不足 1 像素宽的四边形
 *   覆盖率不稳定 → 有的画出一像素、有的整段丢失，看起来就是一节一节的断链。
 *   解法：给一半世界宽度设「屏幕像素下限」——see MIN_STREAK_PX / writeRibbon 的
 *   worldPerPx 参数。拉近时下限不生效，渲染结果与原来完全一致。
 */

import * as THREE from 'three'
import { mapConfig } from './mapConfig'
import { getGlowTexture, getRingTexture } from './textures'

/**
 * 由一对坐标生成的确定性伪随机数（0~1）。
 * ⚠️ 不用 Math.random()：弧高/速度的个体差异如果每次 build 随机，
 *   下钻返回重建后每条线的形状会变，观感「漂移」。用端点坐标做哈希，
 *   同一条线永远得到同一个扰动值，重建前后形状稳定。
 */
export const hash01 = (a: number, b: number, salt = 0): number => {
  const h = Math.sin(a * 12.9898 + b * 78.233 + salt * 37.719) * 43758.5453
  return h - Math.floor(h)
}

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

/**
 * 屏幕像素下限：相机拉远到线宽不足 1px 时，按这几个值反算世界宽度。
 * 取 2px 而非 1px —— 1px 的加法混合条带太细，泛光几乎采不到，反而更糊。
 */
const MIN_STREAK_PX = 2
/** 轨道只是"隐约的路线"，下限比拖尾细一档 */
const MIN_TRACK_PX = 1.2
/** 彗星头光点直径下限（Sprite 也是世界尺寸，拉远会缩成一粒灰点） */
const MIN_HEAD_PX = 6

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
  /** 曲线中点：用来估算「相机到这条线的距离」，把世界宽度换算成屏幕像素 */
  mid: THREE.Vector3
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

/**
 * 三角带骨架：每点 2 个顶点（左、右），相邻点两两成段。
 * 位置 / 颜色缓冲标 DynamicDrawUsage（每帧重写），索引一次性建好。
 */
const createRibbonGeometry = (pointCount: number) => {
  const positions = new Float32Array(pointCount * 6)
  const colors = new Float32Array(pointCount * 6)
  const indices: number[] = []
  // 每相邻两点（共 4 个顶点）拼成一个四边形：2 个三角形
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
 *
 * @param positions 待写入的位置缓冲（每点 6 个分量：左右各 xyz）
 * @param points    等弧长采样点
 * @param tangents  各点单位切线
 * @param cameraPos 相机世界坐标
 * @param widthAt   半宽函数（按采样下标返回）
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
    // 相机与当前点重合时退化，给一个默认视线方向避免 cross 出零向量
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

/**
 * 由采样点计算逐点单位切线（端点用单边差分，避免越界）。
 */
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

/**
 * 创建一条飞线。
 * @param from    起点经纬度 [lng, lat]（应来自 anchorOf，与标牌 / 柱体共用锚点）
 * @param to      终点经纬度 [lng, lat]
 * @param options tint=拖尾色调；speed=每秒弧长比例（缺省走 mapConfig）；phase=起始进度
 * @returns FlyLine（含 object 与 anim，anim 交给 updateFlyLine 逐帧推进）
 */
export const createFlyLine = (
  from: [number, number],
  to: [number, number],
  options: { tint: string; speed?: number; phase?: number },
): FlyLine => {
  const z = mapConfig.spotZ
  // 平面距离越大，弧线抬升越高（封顶 arcMax），避免长线被压平
  const distance = Math.hypot(to[0] - from[0], to[1] - from[1])
  // 弧高个体差异（±15%，确定性哈希）：同一高度族会让弧场显得机械
  const arcJitter = 0.85 + hash01(from[0] + to[0], from[1] + to[1], 1) * 0.3
  const arc = (mapConfig.fly.arcBase + Math.min(mapConfig.fly.arcMax, distance * mapConfig.fly.arcRatio)) * arcJitter
  // 二次贝塞尔：端点 + 中点抬高 arc 作控制点
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
    // 用 sin(πt) 做中段提亮：两端靠近地平线更暗，中段最亮
    const lift = (Math.sin(Math.PI * t)) ** 0.7
    scratch.copy(TRACK_NEAR).lerp(TRACK_FAR, lift * 0.9)
    const o = i * 6
    // 同一份颜色写左右两顶点（三角带每点 2 顶点共用一个颜色）
    ;[o, o + 3].forEach((offset) => {
      track.colors[offset] = scratch.r
      track.colors[offset + 1] = scratch.g
      track.colors[offset + 2] = scratch.b
    })
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
    mid: points[Math.floor(points.length / 2)].clone(),
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

/**
 * 在采样点序列上按弧长比例 p 线性插值取点（用于彗星头定位）。
 * clamp 到 [0, 0.999999) 避免 index+1 越界。
 */
const samplePoint = (points: THREE.Vector3[], p: number): THREE.Vector3 => {
  const clamped = Math.min(0.999999, Math.max(0, p))
  const raw = clamped * (points.length - 1)
  const index = Math.floor(raw)
  const next = Math.min(points.length - 1, index + 1)
  return sampleScratch.copy(points[index]).lerp(points[next], raw - index)
};

/** 飞行起步的淡入弧长比例（较长，出现柔和） */
const FADE_IN = 0.08
/** 落地收尾的淡出弧长比例（短促，流星「砸」在终点涟漪上熄灭） */
const FADE_OUT = 0.03

/**
 * 逐帧推进流星：
 * - 循环 = 飞行(p∈[0,1]) + 停顿(p∈(1,1+restGap))：到终点熄灭后歇一拍再发射，
 *   不会出现「上一颗还没走完、下一颗已经起飞」的连发感
 * - 头部 = 白热核（短、全白），尾部 = 色调拖尾（长、按幂次衰减）
 * - 起步 8% 弧长淡入 / 落地 3% 弧长急熄（不对称：亮着到达，让涟漪接住落点）
 * - 相机移动时同步重算条带朝向；相机静止则跳过，省一半顶点写入
 *
 * ⚠️ 坑：progress 必须按 dt 累加（见下方 `anim.p += dt * anim.speed`），
 *   不要改用 performance.now()*speed，否则掉帧时流星会瞬移 / 断裂。
 *
 * @param anim        飞线动画状态（createFlyLine 产出）
 * @param dt          帧间隔（秒），用于推进 progress
 * @param elapsed     总时长（秒），用于头部呼吸闪烁
 * @param cameraPos   相机世界坐标（用于重算条带朝向），null 则跳过几何重写
 * @param cameraMoved 相机本帧是否移动（静止时连轨道朝向都不重算，省开销）
 * @param worldPerPx  当前缩放下「1 个 CSS 像素 = 多少世界单位」（用于线宽下限；
 *                    传 0 表示不做下限，等同于旧行为）
 */
export const updateFlyLine = (
  anim: FlyAnim,
  dt: number,
  elapsed: number,
  cameraPos: THREE.Vector3 | null,
  cameraMoved: boolean,
  worldPerPx = 0,
) => {
  const band = mapConfig.fly.streakBand
  const restGap = mapConfig.fly.restGap
  // ⚠️ 关键：按 dt 累加推进，保证掉帧时连贯。周期 = 飞行 1 + 停顿 restGap
  anim.p += dt * anim.speed
  if (anim.p >= 1 + restGap) anim.p -= 1 + restGap
  // 飞行进度：停顿段(anim.p>1)钳在 1 —— 条带颜色全部乘 fade=0，整条熄灭
  const flight = Math.min(anim.p, 1)
  const resting = anim.p > 1
  // 不对称淡入淡出：起步柔和淡入，落地急熄（resting 时 fade=0，整条不可见）
  const fade = resting
    ? 0
    : Math.min(1, flight / FADE_IN, (1 - flight) / FADE_OUT)
  const { points, tangents, tint } = anim
  const n = points.length
  const colors = anim.streakColors

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const behind = flight - t
    let r = 0
    let g = 0
    let b = 0
    // 只在「头部后方 band 长度内」写亮色；幂次衰减形成尾焰由亮到暗
    if (behind >= 0 && behind < band) {
      const tail = ((1 - behind / band) ** 1.7) * mapConfig.fly.tailGain
      const core = behind < CORE_SPAN ? ((1 - behind / CORE_SPAN) ** 2) * mapConfig.fly.coreGain : 0
      r = (tint.r * tail + WHITE.r * core) * fade
      g = (tint.g * tail + WHITE.g * core) * fade
      b = (tint.b * tail + WHITE.b * core) * fade
    }
    const o = i * 6
    // 左右两顶点写同一份颜色
    colors[o] = r
    colors[o + 1] = g
    colors[o + 2] = b
    colors[o + 3] = r
    colors[o + 4] = g
    colors[o + 5] = b
  }
  anim.streakColorAttr.needsUpdate = true

  if (cameraPos) {
    // 屏幕像素下限换算成世界半宽：拉远时托住线宽，避免断成一截一截
    const minStreakHalf = (MIN_STREAK_PX * 0.5) * worldPerPx
    const minTrackHalf = (MIN_TRACK_PX * 0.5) * worldPerPx
    // 拖尾：头部饱满、尾部收细成尖，每帧随 flight 一起推进（k 越靠近头部越宽）
    const half = mapConfig.fly.streakWidth / 2
    writeRibbon(anim.streakPositions, points, tangents, cameraPos, (index) => {
      const k = Math.min(1, Math.max(0, (flight - index / (n - 1)) / band))
      const shaped = half * (0.85 - 0.5 * (k ** 0.7))
      // 下限作用在「收细之后」的宽度上：否则尾部依旧会断
      return Math.max(shaped, minStreakHalf)
    })
    anim.streakAttr.needsUpdate = true
    if (cameraMoved) {
      const trackHalf = mapConfig.fly.trackWidth / 2
      writeRibbon(anim.trackPositions, points, tangents, cameraPos, () =>
        Math.max(trackHalf, minTrackHalf),
      )
      anim.trackAttr.needsUpdate = true
    }
  }

  // 彗星头 Sprite 跟随同一条曲线上的当前进度位置（停顿段钳在终点、透明不可见）
  anim.head.position.copy(samplePoint(points, flight))
  // 头部轻微呼吸，像流星掠过时的闪烁；
  // 拉远时同样给屏幕像素下限，否则光点会缩成一粒看不清的灰点
  const pulse = 1 + Math.sin(elapsed * 9 + anim.phase) * 0.1
  anim.head.scale.setScalar(
    Math.max(mapConfig.fly.headSize * pulse, MIN_HEAD_PX * worldPerPx),
  )
  anim.headMat.opacity = mapConfig.fly.headOpacity * fade
};

/** 修改拖尾色调（控制台换色时调用，下一帧立即生效） */
export const setFlyLineTint = (anim: FlyAnim, tint: string) => {
  anim.tint.set(tint)
  anim.headMat.color.set(tint)
};

// ── 端点涟漪：飞线起点 / 落点的扩散圆环 ──────────────────────────────
// 大屏飞线的经典收尾：流星落地处一圈圈扩散光环，让端点「有生命」而不只是
// 两个静止坐标。全部涟漪共用一个单位平面几何（userData.shared，下钻重建时
// 不会被 disposeObject3D 误释放），材质逐个独立（各自的颜色 / 透明度）。

export interface Ripple {
  mesh: THREE.Mesh
  material: THREE.MeshBasicMaterial
  /** 扩散相位（0~1，错峰让多个涟漪不同步） */
  phase: number
  /** 最大世界直径 */
  size: number
}

let rippleGeometry: THREE.PlaneGeometry | null = null

/** 涟漪几何：单位平面躺在地图平面（XY），仅一份、跨层级复用 */
const getRippleGeometry = (): THREE.PlaneGeometry => {
  if (!rippleGeometry) {
    rippleGeometry = new THREE.PlaneGeometry(1, 1)
    rippleGeometry.userData = { shared: true }
  }
  return rippleGeometry
};

/**
 * 创建一个端点涟漪。
 * @param point 世界坐标（地图平面上的锚点，z 取 spotZ 即可）
 * @param tint  涟漪颜色（与飞线拖尾同色，换色时由外部同步更新）
 * @param size  最大世界直径
 * @param phase 扩散相位 0~1
 */
export const createRipple = (
  point: { x: number; y: number; z: number },
  tint: string,
  size: number,
  phase: number,
): Ripple => {
  const material = new THREE.MeshBasicMaterial({
    map: getRingTexture(),
    color: tint,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  })
  const mesh = new THREE.Mesh(getRippleGeometry(), material)
  mesh.position.set(point.x, point.y, point.z + 0.15)
  mesh.scale.setScalar(size * 0.3)
  mesh.renderOrder = 7
  // 进泛光图层：涟漪与拖尾一样被 UnrealBloom 晕开，融合成一片光
  mesh.layers.enable(mapConfig.bloomLayer)
  return { mesh, material, phase, size }
};

/**
 * 逐帧推进涟漪：直径从 30% 扩到 100%，透明度按 (1-prog)^1.6 衰减，
 * 循环往复。由 useFlyLines.tick 每帧调用（飞线隐藏时 tick 早退，涟漪自动停）。
 */
export const updateRipple = (ripple: Ripple, elapsed: number) => {
  const prog = (elapsed * mapConfig.fly.ripple.speed + ripple.phase) % 1
  ripple.mesh.scale.setScalar(ripple.size * (0.3 + 0.7 * prog))
  ripple.material.opacity = ((1 - prog) ** 1.6) * mapConfig.fly.ripple.opacity
};

/** 修改涟漪颜色（控制台换色时与拖尾同步） */
export const setRippleTint = (ripple: Ripple, tint: string) => {
  ripple.material.color.set(tint)
};
