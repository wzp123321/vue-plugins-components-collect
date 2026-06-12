import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  PlayerPublic,
  SeatIndex,
  ServerToClientEvents,
  WorldSnapshot,
} from "./protocol.js";
import { SEAT_CONFIG, STAGE } from "./game/config.js";
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

function pickSeat(room: Room, preferred?: SeatIndex): SeatIndex | null {
  if (preferred !== undefined) {
    const s = room.world.seats[preferred];
    if (!s.online) return preferred;
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
    socket.emit("playerJoined", playerPublic(room, seat));
    for (const so of room.sockets.values()) {
      if (so.id !== socket.id)
        so.emit("playerJoined", playerPublic(room, seat));
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
      room.world.fire(s, SEAT_CONFIG.bulletBaseDamage, SEAT_CONFIG.bulletSpeed);
    }
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
