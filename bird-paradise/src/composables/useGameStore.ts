import { reactive, readonly, ref, shallowRef } from 'vue'
import type { PlayerPublic, SeatIndex, WorldSnapshot } from '../protocol'
import { GameSocket } from '../net/socket'

const SERVER_URL = (import.meta.env.VITE_SERVER_URL as string | undefined) || 'http://localhost:4000'

interface State {
  connected: boolean
  joined: boolean
  selfId: string | null
  selfSeat: SeatIndex | null
  selfName: string
  roomId: string
  /** 最近一次服务端快照 */
  snapshot: WorldSnapshot | null
  /** 玩家加入/离场事件，用于左右闪动 */
  flashSeat: number
  notice: { kind: 'info' | 'warn' | 'error'; text: string } | null
}

const state = reactive<State>({
  connected: false,
  joined: false,
  selfId: null,
  selfSeat: null,
  selfName: '',
  roomId: '',
  snapshot: null,
  flashSeat: -1,
  notice: null
})

const socket = shallowRef(new GameSocket(SERVER_URL))
let latestTick = 0
let snapUpdateCount = 0

function bindListeners(s: GameSocket): void {
  s.onSnapshot((snap) => {
    // 跳帧保护：丢弃过期的快照（理论上服务端顺序推送，client 单线程不会过期）
    if (snap.tick < latestTick) return
    latestTick = snap.tick
    state.snapshot = snap
    snapUpdateCount++
  })
  s.onPlayerJoined((p) => {
    if (p.id === state.selfId) return
    state.flashSeat = p.seat
    setTimeout(() => { if (state.flashSeat === p.seat) state.flashSeat = -1 }, 600)
  })
  s.onPlayerLeft((seat) => {
    state.flashSeat = seat
    setTimeout(() => { if (state.flashSeat === seat) state.flashSeat = -1 }, 600)
  })
  s.onNotice((n) => {
    state.notice = n
    setTimeout(() => { if (state.notice === n) state.notice = null }, 2400)
  })
}

async function connect(): Promise<void> {
  if (state.connected) return
  await socket.value.connect()
  state.connected = true
  bindListeners(socket.value)
}

async function join(roomId: string, name: string, preferredSeat?: SeatIndex): Promise<{ ok: boolean; reason?: string }> {
  if (!state.connected) await connect()
  const resp = await socket.value.join({ roomId, name, preferredSeat })
  if (resp.ok && resp.snapshot) {
    state.joined = true
    state.selfId = resp.selfId ?? null
    state.selfSeat = resp.seat ?? null
    state.roomId = roomId
    state.snapshot = resp.snapshot
    latestTick = resp.snapshot.tick
    return { ok: true }
  }
  return { ok: false, reason: resp.reason || '加入失败' }
}

function leave(): void {
  if (!state.joined) return
  socket.value.leave()
  state.joined = false
  state.selfSeat = null
  state.selfId = null
  state.snapshot = null
  latestTick = 0
}

function send(input: Parameters<GameSocket['sendInput']>[0]): void {
  if (!state.joined) return
  socket.value.sendInput(input)
}

function getPlayer(seat: SeatIndex): PlayerPublic | undefined {
  return state.snapshot?.players[seat]
}

const fps = ref(0)
let lastFpsAt = performance.now()
function reportFps(): void {
  const now = performance.now()
  if (now - lastFpsAt >= 1000) {
    fps.value = snapUpdateCount
    snapUpdateCount = 0
    lastFpsAt = now
  }
}

export function useGameStore() {
  return {
    state: readonly(state),
    socket,
    join,
    leave,
    send,
    getPlayer,
    reportFps,
    fps: readonly(fps)
  }
}
