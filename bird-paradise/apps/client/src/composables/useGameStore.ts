import { reactive, readonly, ref, shallowRef } from "vue";
import type {
  PlayerAccount,
  PlayerPublic,
  SeatIndex,
  WorldSnapshot,
} from "@bird-paradise/shared";
import { GameSocket } from "../net/socket";

const SERVER_URL =
  (import.meta.env.VITE_SERVER_URL as string | undefined) ||
  "http://localhost:4000";

interface State {
  connected: boolean;
  joined: boolean;
  selfId: string | null;
  selfSeat: SeatIndex | null;
  selfName: string;
  roomId: string;
  /** 最近一次服务端快照 */
  snapshot: WorldSnapshot | null;
  /** 玩家加入/离场事件，用于左右闪动 */
  flashSeat: number;
  notice: { kind: "info" | "warn" | "error"; text: string } | null;
  /** 自己账户（充值/扣费即时反映） */
  selfAccount: PlayerAccount;
}

const EMPTY_ACCOUNT: PlayerAccount = { balance: 0, deposited: 0, spent: 0 };

const state = reactive<State>({
  connected: false,
  joined: false,
  selfId: null,
  selfSeat: null,
  selfName: "",
  roomId: "",
  snapshot: null,
  flashSeat: -1,
  notice: null,
  selfAccount: { ...EMPTY_ACCOUNT },
});

const socket = shallowRef(new GameSocket(SERVER_URL));
let latestTick = 0;
let snapUpdateCount = 0;

function bindListeners(s: GameSocket): void {
  s.onSnapshot((snap) => {
    // 跳帧保护：丢弃过期的快照（理论上服务端顺序推送，client 单线程不会过期）
    if (snap.tick < latestTick) return;
    latestTick = snap.tick;
    state.snapshot = snap;
    // 同步自己账户（snapshot 是权威源）
    if (state.selfSeat !== null) {
      const me = snap.players[state.selfSeat];
      if (me) state.selfAccount = { ...me.account };
    }
    snapUpdateCount++;
  });
  s.onPlayerJoined((p) => {
    if (p.id === state.selfId) return;
    state.flashSeat = p.seat;
    setTimeout(() => {
      if (state.flashSeat === p.seat) state.flashSeat = -1;
    }, 600);
  });
  s.onPlayerLeft((seat) => {
    state.flashSeat = seat;
    setTimeout(() => {
      if (state.flashSeat === seat) state.flashSeat = -1;
    }, 600);
  });
  s.onAccountUpdated((u) => {
    if (u.seat === state.selfSeat) {
      state.selfAccount = { ...u.account };
    }
  });
  s.onNotice((n) => {
    state.notice = n;
    setTimeout(() => {
      if (state.notice === n) state.notice = null;
    }, 2400);
  });
}

async function connect(): Promise<void> {
  if (state.connected) return;
  await socket.value.connect();
  state.connected = true;
  bindListeners(socket.value);
}

async function join(
  roomId: string,
  name: string,
  preferredSeat?: SeatIndex,
): Promise<{ ok: boolean; reason?: string }> {
  if (!state.connected) await connect();
  const resp = await socket.value.join({ roomId, name, preferredSeat });
  if (resp.ok && resp.snapshot) {
    state.joined = true;
    state.selfId = resp.selfId ?? null;
    state.selfSeat = resp.seat ?? null;
    state.roomId = roomId;
    state.snapshot = resp.snapshot;
    latestTick = resp.snapshot.tick;
    const me = resp.snapshot.players[resp.seat!];
    if (me) state.selfAccount = { ...me.account };
    return { ok: true };
  }
  return { ok: false, reason: resp.reason || "加入失败" };
}

async function topUp(
  amount: number,
): Promise<{ ok: boolean; reason?: string }> {
  if (!state.joined) return { ok: false, reason: "未加入房间" };
  const resp = await socket.value.topUp(amount);
  if (resp.ok && resp.account) {
    state.selfAccount = { ...resp.account };
  }
  return { ok: resp.ok, reason: resp.reason };
}

function leave(): void {
  if (!state.joined) return;
  socket.value.leave();
  state.joined = false;
  state.selfSeat = null;
  state.selfId = null;
  state.snapshot = null;
  state.selfAccount = { ...EMPTY_ACCOUNT };
  latestTick = 0;
}

function send(input: Parameters<GameSocket["sendInput"]>[0]): void {
  if (!state.joined) return;
  socket.value.sendInput(input);
}

function getPlayer(seat: SeatIndex): PlayerPublic | undefined {
  return state.snapshot?.players[seat];
}

const fps = ref(0);
let lastFpsAt = performance.now();
function reportFps(): void {
  const now = performance.now();
  if (now - lastFpsAt >= 1000) {
    fps.value = snapUpdateCount;
    snapUpdateCount = 0;
    lastFpsAt = now;
  }
}

export function useGameStore() {
  return {
    state: readonly(state),
    socket,
    join,
    leave,
    send,
    topUp,
    getPlayer,
    reportFps,
    fps: readonly(fps),
  };
}
