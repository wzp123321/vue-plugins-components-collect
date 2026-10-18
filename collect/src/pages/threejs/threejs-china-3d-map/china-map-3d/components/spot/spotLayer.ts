import * as THREE from 'three'
import { mapConfig } from '../../utils/mapConfig'
import { getGlowTexture } from '../../utils/textures'
import type { Tier } from '../../utils/data'
import { createAnchor, createPlate, createValueCard } from './spotCanvas'

export interface SpotItem {
  adcode: number
  /** 投影后的世界坐标 [x, y]（y 向下，与 d3 一致） */
  coord: [number, number]
  name: string
  value: number
  /** 所在数据分档下标 */
  tier: number
  properties: Record<string, any>
}

/** 入场动画里逐根柱体的生长参数 */
export interface SpotGrower {
  column: THREE.Object3D
  cap: THREE.Object3D
  cards: THREE.Sprite[]
  /** 地面标高 */
  baseZ: number
  /** 目标柱高 */
  height: number
  /** 错峰延迟（0~GROW_MAX_DELAY），高值柱先长 */
  delay: number
  /** 卡片原始尺寸，用于生长时按比例缩放 */
  cardSize: Array<[number, number]>
  cardLift: number
}

export interface SpotLayer {
  group: THREE.Group
  columns: THREE.Group
  plates: THREE.Group
  hits: THREE.Group
  plateByAdcode: Map<number, THREE.Sprite>
  anchorByAdcode: Map<number, THREE.Mesh>
  cardByAdcode: Map<number, THREE.Sprite>
  leaderByAdcode: Map<number, THREE.Line>
  growers: SpotGrower[]
}

/** 入场错峰的最大延迟比例（相对整段动画时长） */
const GROW_MAX_DELAY = 0.34

/**
 * 按全局进度 t（0~1）写入柱体生长状态。
 *
 * 只改 transform 与卡片透明度，不动 visible —— 否则会和
 * `applySpotVisibility` 的显隐规则互相覆盖。
 */
export const applySpotGrowth = (layer: SpotLayer, t: number) => {
  for (const grower of layer.growers) {
    const span = 1 - grower.delay
    const raw = span > 0 ? (t - grower.delay) / span : t
    const k = raw <= 0 ? 0 : raw >= 1 ? 1 : 1 - (1 - raw) * (1 - raw) * (1 - raw)

    const height = grower.height * k
    grower.column.scale.z = Math.max(0.0001, height)
    grower.column.position.z = grower.baseZ + height / 2
    // 柱顶光点始终跟着柱顶走：柱高为 0 时就是地面上的一颗亮点，正好当「种子」
    grower.cap.position.z = grower.baseZ + height

    if (!grower.cards.length) continue
    const appear = Math.min(1, Math.max(0, (k - 0.5) / 0.5))
    const eased = 1 - (1 - appear) * (1 - appear)
    for (let i = 0; i < grower.cards.length; i++) {
      const card = grower.cards[i]
      const [sx, sy] = grower.cardSize[i]
      card.position.z = grower.baseZ + height + grower.cardLift
      card.scale.set(sx * (0.88 + 0.12 * eased), sy * (0.88 + 0.12 * eased), 1)
      const material = card.material as THREE.SpriteMaterial
      material.opacity = eased
    }
  }
};

/** 同一档位共用一个柱体材质 */
const columnMaterials = new Map<string, THREE.ShaderMaterial>()
/** 柱体几何只有一份（单位平面，逐项 scale 拉伸） */
let columnGeometry: THREE.PlaneGeometry | null = null
/** 柱顶光点材质按色缓存 */
const topMaterials = new Map<string, THREE.SpriteMaterial>()

const Z_AXIS = new THREE.Vector3(0, 0, 1)
const faceScratch = new THREE.Vector3()

/**
 * 柱体 = 一个竖直的面向相机的平面（宽沿 X、高沿 Z），片元里按圆柱截面着色。
 *
 * 为什么不用 CylinderGeometry：柱体在屏幕上只有 2~3px 宽，
 * 圆柱每一段的顶点法线独立、轮廓是多边形，投影到这么窄的区域里
 * 就成了硬锯齿 + 明暗台阶（正是「一节一节错位」的来源）。
 * 单个平面没有任何分段，边缘用 smoothstep 做解析抗锯齿，既干净又省多边形。
 */
const getColumnGeometry = (): THREE.PlaneGeometry => {
  if (!columnGeometry) {
    const geometry = new THREE.PlaneGeometry(1, 1)
    // 立起来：uv.v = 1 落在柱顶
    geometry.rotateX(Math.PI / 2)
    geometry.userData = { shared: true }
    columnGeometry = geometry
  }
  return columnGeometry
};

const getColumnMaterial = (color: string): THREE.ShaderMaterial => {
  const cached = columnMaterials.get(color)
  if (cached) return cached
  const material = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) } },
    vertexShader: `
      varying float vH;
      varying float vX;
      void main() {
        // uv.y: 0=柱底, 1=柱顶；uv.x: 0=左边缘, 1=右边缘
        vH = uv.y;
        vX = uv.x;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vH;
      varying float vX;
      void main() {
        // 把平面横向当作圆柱截面：中间正对相机最亮，两侧掠射渐暗
        float dx = vX * 2.0 - 1.0;
        float body = sqrt(max(0.0, 1.0 - dx * dx));
        float shade = 0.6 + 0.4 * pow(body, 0.75);

        vec3 col = mix(uColor * 0.45, uColor, pow(vH, 0.7)) * shade;
        float alpha = mix(0.5, 1.0, pow(vH, 0.5));
        // 横向边缘解析抗锯齿，细柱也不会出现硬边台阶
        alpha *= smoothstep(1.0, 0.86, abs(dx));
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthTest: true,
    depthWrite: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
  })
  material.userData = { shared: true }
  columnMaterials.set(color, material)
  return material
};

const getTopMaterial = (color: string): THREE.SpriteMaterial => {
  const cached = topMaterials.get(color)
  if (cached) return cached
  const material = new THREE.SpriteMaterial({
    map: getGlowTexture(),
    color,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  })
  material.userData = { shared: true }
  topMaterials.set(color, material)
  return material
};

/** 卡片避让：相邻太近的次级卡片不画，否则华东一片会糊成一团 */
const CARD_MIN_SEPARATION = 12
/** 卡片数量上限：省/市级城市密集时只保留数值最大的一批，画面更干净 */
const CARD_MAX_COUNT = 18
/** 标牌错层：相邻太近的标牌向上抬一档 */
const PLATE_MIN_SEPARATION = 11.5
/** 标牌抬高基准：与柱顶解耦，避免高柱把标牌顶到屏幕外 */
const PLATE_BASE_LIFT = 5

/**
 * 生成一层的标记组：
 * - columns：细光柱 + 柱顶光点 + 数值卡片
 * - plates：地理标牌 + 定位点（默认隐藏，点击城市时显示）
 * - hits：透明热区（拾取用，不参与渲染视觉）
 */
export const createSpotLayer = (items: SpotItem[], tiers: Tier[], maxValue: number): SpotLayer => {
  const group = new THREE.Group()
  group.userData = { kind: 'spots' }
  const columns = new THREE.Group()
  const plates = new THREE.Group()
  const hits = new THREE.Group()
  group.add(columns, plates, hits)

  const plateByAdcode = new Map<number, THREE.Sprite>()
  const anchorByAdcode = new Map<number, THREE.Mesh>()
  const cardByAdcode = new Map<number, THREE.Sprite>()
  const leaderByAdcode = new Map<number, THREE.Line>()

  const cardSlots: Array<[number, number]> = []
  const cardAllowed = new Set<SpotItem>()
  for (const item of [...items].sort((a, b) => b.value - a.value).slice(0, CARD_MAX_COUNT)) {
    const [x, y] = item.coord
    if (cardSlots.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < CARD_MIN_SEPARATION)) continue
    cardSlots.push([x, y])
    cardAllowed.add(item)
  }

  const geometry = getColumnGeometry()
  const hitGeometry = new THREE.CircleGeometry(2.4, 16)
  hitGeometry.userData = { shared: true }
  const hitMaterial = new THREE.MeshBasicMaterial({
    color: 0x5fc9ee,
    opacity: 0.01,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })
  hitMaterial.userData = { shared: true }

  const z = mapConfig.spotZ
  const placedPlates: Array<{ x: number; y: number; bump: number }> = []
  const growers: SpotGrower[] = []

  // 生长错峰：数值大的柱子先长出来，避免整屏同时拔起
  const delayed = [...items].sort((a, b) => b.value - a.value)
  const delayOf = new Map<SpotItem, number>()
  delayed.forEach((item, index) => {
    const ratio = delayed.length > 1 ? index / (delayed.length - 1) : 0
    delayOf.set(item, ratio * GROW_MAX_DELAY)
  })

  for (const item of items) {
    const [x, y] = item.coord
    const tier = tiers[item.tier] ?? tiers[tiers.length - 1]
    const color = tier.color
    const ratio = Math.max(0.05, Math.min(1, item.value / Math.max(1, maxValue)))
    const height = mapConfig.columnHeight * (0.22 + 0.78 * Math.pow(ratio, 0.85))
    const payload = { ...item.properties, value: item.value, name: item.name }

    const column: any = new THREE.Mesh(geometry, getColumnMaterial(color))
    column.scale.set(mapConfig.columnRadius * 2, 1, height)
    column.position.set(x, -y, z + height / 2)
    // 始终正对相机：只绕 Z 转方位角，柱身保持竖直
    column.onBeforeRender = (_renderer: unknown, _scene: unknown, camera: THREE.Camera) => {
      faceScratch.subVectors(camera.position, column.position)
      column.quaternion.setFromAxisAngle(Z_AXIS, Math.atan2(-faceScratch.x, faceScratch.y))
    }
    column.renderOrder = 10
    column.userData = { kind: 'spot', variant: 'column' }
    column.customProperties = payload
    column.layers.enable(mapConfig.bloomLayer)
    columns.add(column)

    const cap: any = new THREE.Sprite(getTopMaterial(color))
    cap.position.set(x, -y, z + height)
    cap.scale.setScalar(0.95)
    cap.renderOrder = 11
    cap.userData = { kind: 'spot', variant: 'cap' }
    cap.customProperties = payload
    cap.layers.enable(mapConfig.bloomLayer)
    columns.add(cap)

    const grower: SpotGrower = {
      column,
      cap,
      cards: [],
      baseZ: z,
      height,
      delay: delayOf.get(item) ?? 0,
      cardSize: [],
      cardLift: 0,
    }
    growers.push(grower)

    if (cardAllowed.has(item)) {
      const card: any = createValueCard(item.name, String(item.value), color)
      card.position.set(x, -y, z + height + card.scale.y * 0.5 + 0.6)
      card.customProperties = payload
      columns.add(card)
      cardByAdcode.set(item.adcode, card)
      grower.cards.push(card)
      grower.cardSize.push([card.scale.x, card.scale.y])
      grower.cardLift = card.scale.y * 0.5 + 0.6
    }

    const plate: any = createPlate(item.name, String(item.value), color)
    let bump = 0
    for (let i = placedPlates.length - 1; i >= Math.max(0, placedPlates.length - 12); i--) {
      const other = placedPlates[i]
      if (Math.hypot(other.x - x, other.y - y) < PLATE_MIN_SEPARATION) bump = other.bump + 1
    }
    placedPlates.push({ x, y, bump })
    // 标牌压在柱顶之上，避免与数值卡片同一高度打架；太近的标牌逐级抬高错层
    plate.position.set(x + bump * 1.1, -y, z + Math.min(height, PLATE_BASE_LIFT) + plate.scale.y * 0.5 + 0.8 + bump * 1.6)
    plate.visible = false
    plate.customProperties = payload
    plates.add(plate)
    plateByAdcode.set(item.adcode, plate)

    // 细引线：把标牌与地图上的定位点连起来，避免标牌「悬空」
    const leaderGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, -y, z + 0.02),
      new THREE.Vector3(plate.position.x, -y, plate.position.z - plate.scale.y * 0.5),
    ])
    const leader = new THREE.Line(
      leaderGeometry,
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45, depthTest: false, depthWrite: false }),
    )
    leader.renderOrder = 12
    leader.visible = false
    plates.add(leader)
    leaderByAdcode.set(item.adcode, leader)

    const anchor: any = createAnchor(color)
    anchor.position.set(x, -y, z + 0.02)
    anchor.visible = false
    anchor.customProperties = payload
    plates.add(anchor)
    anchorByAdcode.set(item.adcode, anchor)

    const hit: any = new THREE.Mesh(hitGeometry, hitMaterial)
    hit.position.set(x, -y, z)
    hit.renderOrder = 13
    hit.userData = { kind: 'spotHit' }
    hit.customProperties = payload
    hits.add(hit)
  }

  return {
    group,
    columns,
    plates,
    hits,
    plateByAdcode,
    anchorByAdcode,
    cardByAdcode,
    leaderByAdcode,
    growers,
  }
};

/**
 * 应用到显隐规则：
 * - 数据柱模式：只显示被点选城市的标牌（其余收起，避免满屏标签）；被选中城市自身的数值卡片让位给标牌
 * - 标牌模式（关闭数据柱）：显示全部标牌
 */
export const applySpotVisibility = (layer: SpotLayer, showColumns: boolean, selectedAdcode: number | null) => {
  layer.columns.visible = showColumns
  for (const [adcode, plate] of layer.plateByAdcode) {
    plate.visible = showColumns ? adcode === selectedAdcode : true
  }
  for (const [adcode, anchor] of layer.anchorByAdcode) {
    anchor.visible = showColumns ? adcode === selectedAdcode : true
  }
  for (const [adcode, leader] of layer.leaderByAdcode) {
    leader.visible = showColumns ? adcode === selectedAdcode : true
  }
  for (const [adcode, card] of layer.cardByAdcode) {
    card.visible = adcode !== selectedAdcode
  }
};
