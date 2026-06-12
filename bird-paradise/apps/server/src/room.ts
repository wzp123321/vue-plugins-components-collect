import type { Server, Socket } from "socket.io";
import {
  COIN,
  SEAT_CONFIG,
  STAGE,
  TOP_UP_OPTIONS,
  type ClientToServerEvents,
  type PlayerPublic,
  type SeatIndex,
  type ServerToClientEvents,
  type WorldSnapshot,
} from "@bird-paradise/shared";
import { World } from "./game/world.js";

const TICK_RATE = 30;
const TICK_DT = 1 / TICK_RATE;

interface Room {
  id: string;
  world: World;
  sockets: Map<string, Socket<ClientToServerEvents, ServerToClientEvents>>;
  interval: NodeJS.Timeout | null;
  /** 每个 socket -> 占用 seatIndex */
  socketSeat: Map<string, SeatIndex>;
}

const rooms = new Map<string, Room>();

function publicSnapshot(world: World): WorldSnapshot {
  return {
    tick: world.tick,
    serverTime: Date.now(),
    width: world.width,
    height: world.height,
    players: world.seats.map((s) => ({
      id: s.playerId ?? "",
      seat: s.index,
      name: s.name,
      score: s.score,
      multiplier: s.multiplier,
      angle: s.angle,
      firing: s.fireCooldown > 0,
      online: s.online,
      account: { ...s.account },
    })) as WorldSnapshot["players"],
    birds: world.birds,
    bullets: world.bullets,
    events: world.events,
    combo: world.seats.map((s) => s.combo) as WorldSnapshot["combo"],
  };
}

function getOrCreateRoom(roomId: string): Room {
  let r = rooms.get(roomId);
  if (r) return r;
  r = {
    id: roomId,
    world: new World(),
    sockets: new Map(),
    interval: null,
    socketSeat: new Map(),
  };
  r.interval = setInterval(() => {
    const w = r!.world;
    w.step(TICK_DT);
    const snap = publicSnapshot(w);
    for (const s of r!.sockets.values()) s.emit("snapshot", snap);
  }, 1000 / TICK_RATE);
  rooms.set(roomId, r);
  return r;
}

function pickSeat(room: Room, preferred?: SeatIndex | null): SeatIndex | null {
  if (
    typeof preferred === "number" &&
    Number.isInteger(preferred) &&
    preferred >= 0 &&
    preferred < SEAT_CONFIG.maxPlayers
  ) {
    const s = room.world.seats[preferred];
    if (s && !s.online) return preferred as SeatIndex;
  }
  for (let i = 0; i < SEAT_CONFIG.maxPlayers; i++) {
    if (!room.world.seats[i].online) return i as SeatIndex;
  }
  return null;
}

function playerPublic(room: Room, seat: SeatIndex): PlayerPublic {
  const s = room.world.seats[seat];
  return {
    id: s.playerId ?? "",
    seat,
    name: s.name,
    score: s.score,
    multiplier: s.multiplier,
    angle: s.angle,
    firing: s.fireCooldown > 0,
    online: s.online,
    account: { ...s.account },
  };
}

export function bindRoomHandlers(
  _io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
): void {
  let currentRoomId: string | null = null;

  socket.on("join", (data, cb) => {
    const roomId = (data.roomId || "lobby").slice(0, 24);
    const name = (data.name || "玩家").slice(0, 8);
    const room = getOrCreateRoom(roomId);
    const seat = pickSeat(room, data.preferredSeat);
    if (seat === null) {
      cb({ ok: false, reason: "房间已满（最多 4 人）" });
      return;
    }
    // 同一 socket 二次 join：先清理
    if (currentRoomId) {
      const old = rooms.get(currentRoomId);
      if (old) {
        const prevSeat = old.socketSeat.get(socket.id);
        if (prevSeat !== undefined) {
          const s = old.world.seats[prevSeat];
          s.online = false;
          s.playerId = null;
          s.name = "";
          old.world.resetAccount(s);
          old.socketSeat.delete(socket.id);
          for (const so of old.sockets.values())
            so.emit("playerLeft", prevSeat);
        }
        old.sockets.delete(socket.id);
      }
    }
    const s = room.world.seats[seat];
    s.online = true;
    s.playerId = socket.id;
    s.name = name;
    s.score = 0;
    s.combo = 0;
    s.angle = -Math.PI / 2;
    s.multiplier = 100;
    s.fireCooldown = 0;
    // 入场赠送初始币
    room.world.grantInitial(s);
    room.sockets.set(socket.id, socket);
    room.socketSeat.set(socket.id, seat);
    currentRoomId = roomId;
    socket.join(roomId);
    cb({
      ok: true,
      selfId: socket.id,
      seat,
      snapshot: publicSnapshot(room.world),
    });
    const pub = playerPublic(room, seat);
    socket.emit("accountUpdated", { seat, account: pub.account });
    socket.emit("playerJoined", pub);
    for (const so of room.sockets.values()) {
      if (so.id !== socket.id) so.emit("playerJoined", pub);
    }
  });

  socket.on("input", (data) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    const seat = room.socketSeat.get(socket.id);
    if (seat === undefined) return;
    const s = room.world.seats[seat];
    s.angle = data.angle;
    s.multiplier = Math.min(
      SEAT_CONFIG.multiplierMax,
      Math.max(
        SEAT_CONFIG.multiplierMin,
        Math.round(data.multiplier / 100) * 100,
      ),
    );
    s.lastInputAt = Date.now();
    if (data.firing) {
      const r = room.world.tryFire(
        s,
        SEAT_CONFIG.bulletBaseDamage,
        SEAT_CONFIG.bulletSpeed,
      );
      if (!r.ok && r.cost > 0) {
        // 余额不足
        socket.emit("notice", {
          kind: "warn",
          text: `币不足（需要 ${r.cost}，余额 ${s.account.balance}），请上币`,
        });
      }
      // 扣费成功时主动推送一次账户更新（snapshot 每 33ms 一次，扣费反馈要即时）
      if (r.ok) {
        socket.emit("accountUpdated", { seat, account: { ...s.account } });
        if (s.account.balance <= COIN.lowBalanceWarn) {
          socket.emit("notice", {
            kind: "warn",
            text: `余额仅剩 ${s.account.balance}，请及时上币`,
          });
        }
      }
    }
  });

  socket.on("topUp", (data, cb) => {
    if (!currentRoomId) return cb({ ok: false, reason: "未加入房间" });
    const room = rooms.get(currentRoomId);
    if (!room) return cb({ ok: false, reason: "房间不存在" });
    const seat = room.socketSeat.get(socket.id);
    if (seat === undefined) return cb({ ok: false, reason: "座位无效" });
    const opt = TOP_UP_OPTIONS.find((o) => o.amount === data?.amount);
    if (!opt) return cb({ ok: false, reason: "无效充值档位" });
    const s = room.world.seats[seat];
    room.world.topUp(s, opt.amount, opt.bonus);
    const account = { ...s.account };
    cb({ ok: true, account });
    // 广播给同房间所有人
    for (const so of room.sockets.values()) {
      so.emit("accountUpdated", { seat, account });
    }
    socket.emit("notice", {
      kind: "info",
      text: `上币成功 +${opt.amount}${opt.bonus > 0 ? ` 赠 ${opt.bonus}` : ""}`,
    });
  });

  socket.on("resync", (cb) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (room) cb(publicSnapshot(room.world));
  });

  socket.on("leave", () => {
    cleanup(socket, currentRoomId);
    currentRoomId = null;
  });

  socket.on("disconnect", () => {
    cleanup(socket, currentRoomId);
  });
}

function cleanup(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  roomId: string | null,
): void {
  if (!roomId) return;
  const room = rooms.get(roomId);
  if (!room) return;
  const seat = room.socketSeat.get(socket.id);
  if (seat === undefined) return;
  const s = room.world.seats[seat];
  s.online = false;
  s.playerId = null;
  s.name = "";
  s.fireCooldown = 0;
  room.socketSeat.delete(socket.id);
  room.sockets.delete(socket.id);
  for (const so of room.sockets.values()) so.emit("playerLeft", seat);
  if (room.sockets.size === 0) {
    if (room.interval) clearInterval(room.interval);
    rooms.delete(roomId);
  }
}

void STAGE;
