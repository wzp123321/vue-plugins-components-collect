// 客户端协议镜像 - 与 bird-paradise-server/src/protocol.ts 保持一致

export type BirdKind =
  | 'sparrow' | 'goldfinch' | 'hummingbird' | 'owl' | 'halo'
  | 'parrot' | 'phoenix' | 'lucky' | 'split'

export type SeatIndex = 0 | 1 | 2 | 3

export interface PlayerInput {
  seat: SeatIndex
  angle: number
  multiplier: number
  firing: boolean
  t: number
}

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
  phase: number
  wingSpeed: number
  haloPhase: number
  age: number
}

export interface BulletState {
  id: number
  ownerSeat: SeatIndex
  x: number
  y: number
  vx: number
  vy: number
  damage: number
  ttl: number
}

export interface FloatTextEvent {
  id: number
  seat: SeatIndex | -1
  x: number
  y: number
  text: string
  color: string
  size: number
}

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

export interface HitEvent {
  id: number
  seat: SeatIndex
  birdId: number
  x: number
  y: number
  damage: number
}

export interface WorldSnapshot {
  tick: number
  serverTime: number
  width: number
  height: number
  players: [PlayerPublic, PlayerPublic, PlayerPublic, PlayerPublic]
  birds: BirdState[]
  bullets: BulletState[]
  events: Array<FloatTextEvent | KillEvent | HitEvent>
  combo: [number, number, number, number]
}

export interface JoinResponse {
  ok: boolean
  selfId?: string
  seat?: SeatIndex
  reason?: string
  snapshot?: WorldSnapshot
}
