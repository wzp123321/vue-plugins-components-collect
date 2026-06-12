// 共享协议类型 - 客户端与服务端一致

/** 鸟的种类键 */
export type BirdKind =
  | 'sparrow' | 'goldfinch' | 'hummingbird' | 'owl' | 'halo'
  | 'parrot' | 'phoenix' | 'lucky' | 'split'

/** 玩家炮台槽位（屏幕底部 4 等分） */
export type SeatIndex = 0 | 1 | 2 | 3

/** 玩家输入意图 */
export interface PlayerInput {
  seat: SeatIndex
  /** 炮台当前角度（弧度，0 = 向右，-PI/2 = 向上） */
  angle: number
  /** 炮台当前倍数（100-2000，步进 100） */
  multiplier: number
  /** 是否正在射击（按住 = 连续） */
  firing: boolean
  /** 输入时间戳（用于过期丢弃） */
  t: number
}

/** 玩家公开信息 */
export interface PlayerPublic {
  id: string
  seat: SeatIndex
  name: string
  score: number
  multiplier: number
  angle: number
  firing: boolean
  online: boolean
}

/** 单只飞鸟（服务端权威） */
export interface BirdState {
  id: number
  kind: BirdKind
  x: number
  y: number
  vx: number
  vy: number
  r: number
  hp: number
  maxHp: number
  /** 振翅/光环相位（用于客户端动画） */
  phase: number
  wingSpeed: number
  haloPhase: number
  /** 已存活时间（秒） */
  age: number
}

/** 子弹 */
export interface BulletState {
  id: number
  ownerSeat: SeatIndex
  x: number
  y: number
  vx: number
  vy: number
  damage: number
  /** 子弹剩余生命（秒） */
  ttl: number
}

/** 飘字（仅持续几帧的事件，客户端播放） */
export interface FloatTextEvent {
  id: number
  seat: SeatIndex | -1 // -1 表示全场
  x: number
  y: number
  text: string
  color: string
  size: number
}

/** 击杀事件（客户端触发粒子/音效） */
export interface KillEvent {
  id: number
  seat: SeatIndex
  birdId: number
  kind: BirdKind
  x: number
  y: number
  score: number
  baseScore: number
  combo: number
  totalMultiplier: number
}

/** 命中/受击事件（未死） */
export interface HitEvent {
  id: number
  seat: SeatIndex
  birdId: number
  x: number
  y: number
  damage: number
}

/** 房间快照 - 服务端 30fps 推送 */
export interface WorldSnapshot {
  /** 帧序号 */
  tick: number
  /** 服务端时间戳（毫秒） */
  serverTime: number
  /** 画布尺寸（逻辑像素） */
  width: number
  height: number
  /** 4 个玩家 */
  players: [PlayerPublic, PlayerPublic, PlayerPublic, PlayerPublic]
  /** 当前所有鸟 */
  birds: BirdState[]
  /** 当前所有子弹 */
  bullets: BulletState[]
  /** 本帧事件（飘字/击杀/命中） */
  events: Array<FloatTextEvent | KillEvent | HitEvent>
  /** 击杀连击（每个玩家） */
  combo: [number, number, number, number]
}

/** 客户端 -> 服务端事件 */
export interface ClientToServerEvents {
  join: (data: { roomId: string; name: string; preferredSeat?: SeatIndex }, cb: (resp: JoinResponse) => void) => void
  leave: () => void
  input: (data: PlayerInput) => void
  /** 请求完整快照（重连时用） */
  resync: (cb: (snap: WorldSnapshot) => void) => void
}

/** 服务端 -> 客户端事件 */
export interface ServerToClientEvents {
  snapshot: (snap: WorldSnapshot) => void
  /** 玩家加入/离开/座位 */
  playerJoined: (p: PlayerPublic) => void
  playerLeft: (seat: SeatIndex) => void
  /** 系统消息（如房间满/已开始） */
  notice: (msg: { kind: 'info' | 'warn' | 'error'; text: string }) => void
}

export interface JoinResponse {
  ok: boolean
  selfId?: string
  seat?: SeatIndex
  reason?: string
  snapshot?: WorldSnapshot
}
