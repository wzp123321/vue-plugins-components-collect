import type {
  BirdKind,
  BirdState,
  FloatTextEvent,
  HitEvent,
  KillEvent,
  SeatIndex,
} from "../protocol.js";
import {
  BIRD_CONFIGS,
  NORMAL_KINDS,
  BOSS_KINDS,
  SPAWN_CONFIG,
  STAGE,
  rand,
  pickWeighted,
} from "./config.js";

let nextBirdId = 1;
let nextEventId = 1;
function newBirdId(): number {
  return nextBirdId++;
}
function newEventId(): number {
  return nextEventId++;
}

/** 玩家炮台状态（服务端权威） */
export interface Seat {
  index: SeatIndex;
  playerId: string | null;
  name: string;
  online: boolean;
  /** 炮台 x 坐标（屏幕底部四等分中心） */
  x: number;
  y: number;
  angle: number; // 弧度
  multiplier: number;
  score: number;
  combo: number;
  /** 距离下次可发射的剩余冷却（毫秒） */
  fireCooldown: number;
  lastInputAt: number;
}

export function createSeats(): [Seat, Seat, Seat, Seat] {
  const strip = STAGE.seatStrip;
  const playH = STAGE.height - strip;
  const cx = STAGE.width / 4;
  const make = (i: 0 | 1 | 2 | 3): Seat => ({
    index: i,
    playerId: null,
    name: "",
    online: false,
    x: cx * (i + 0.5),
    y: playH + strip * 0.55,
    angle: -Math.PI / 2,
    multiplier: 100,
    score: 0,
    combo: 0,
    fireCooldown: 0,
    lastInputAt: 0,
  });
  return [make(0), make(1), make(2), make(3)];
}

/** 子弹 */
export interface Bullet {
  id: number;
  ownerSeat: SeatIndex;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  ttl: number;
}

let nextBulletId = 1;

export function createBullet(
  owner: Seat,
  dirX: number,
  dirY: number,
  damage: number,
): Bullet {
  return {
    id: nextBulletId++,
    ownerSeat: owner.index,
    x: owner.x,
    y: owner.y,
    vx: dirX,
    vy: dirY,
    damage,
    ttl: 2.5,
  };
}

/** 房间世界（一个房间一个实例） */
export class World {
  width = STAGE.width;
  height = STAGE.height;
  birds: BirdState[] = [];
  bullets: Bullet[] = [];
  seats: [Seat, Seat, Seat, Seat];
  /** 帧序号 */
  tick = 0;
  /** 本帧事件队列（snapshot.events） */
  events: Array<FloatTextEvent | KillEvent | HitEvent> = [];
  /** 全局计时 */
  elapsed = 0;
  spawnTimer = 0;
  spawnInterval = SPAWN_CONFIG.baseInterval;
  bossCooldown = 12;
  luckyCooldown = 10;
  haloCooldown = 8;
  /** 倍数变化累计（用于控制子弹伤害/得分） */

  constructor() {
    this.seats = createSeats();
  }

  /** 推进游戏世界 dt 秒 */
  step(dt: number): void {
    this.elapsed += dt;
    this.tick += 1;
    this.events.length = 0;
    // 生成
    this.tickSpawn(dt);
    // 鸟移动
    this.moveBirds(dt);
    // 子弹移动 + 碰撞
    this.moveBullets(dt);
    // 座位冷却
    for (const s of this.seats) {
      if (s.fireCooldown > 0) s.fireCooldown -= dt * 1000;
    }
    // 离屏清理
    this.cleanup();
  }

  private tickSpawn(dt: number): void {
    this.spawnTimer += dt;
    this.spawnInterval = Math.max(
      SPAWN_CONFIG.minInterval,
      SPAWN_CONFIG.baseInterval - this.elapsed * SPAWN_CONFIG.ramp,
    );
    if (this.spawnTimer < this.spawnInterval) return;
    if (this.birds.length >= SPAWN_CONFIG.maxAlive) return;
    this.spawnTimer = 0;

    if (this.bossCooldown > 0) this.bossCooldown -= dt;
    if (this.luckyCooldown > 0) this.luckyCooldown -= dt;
    if (this.haloCooldown > 0) this.haloCooldown -= dt;

    const kind = this.pickKind();
    if (!kind) return;
    this.spawnBird(kind);

    if (kind === "parrot" || kind === "phoenix")
      this.bossCooldown = SPAWN_CONFIG.bossCooldown;
    else if (kind === "lucky") this.luckyCooldown = SPAWN_CONFIG.luckyCooldown;
    else if (kind === "halo") this.haloCooldown = SPAWN_CONFIG.haloCooldown;
  }

  private pickKind(): BirdKind | null {
    if (this.bossCooldown <= 0 && Math.random() < 0.05) {
      return BOSS_KINDS[Math.floor(Math.random() * BOSS_KINDS.length)];
    }
    if (this.luckyCooldown <= 0 && Math.random() < 0.03) return "lucky";
    if (this.haloCooldown <= 0 && Math.random() < 0.06) return "halo";
    const pool = NORMAL_KINDS.map((k) => BIRD_CONFIGS[k]);
    return pickWeighted(pool).kind;
  }

  private spawnBird(kind: BirdKind): void {
    const cfg = BIRD_CONFIGS[kind];
    const speed = rand(cfg.speed[0], cfg.speed[1]);
    const minY =
      kind === "parrot" || kind === "phoenix"
        ? this.height * 0.12
        : this.height * 0.18;
    const maxY =
      kind === "parrot" || kind === "phoenix"
        ? this.height * 0.45
        : this.height * 0.6;
    const b: BirdState = {
      id: newBirdId(),
      kind,
      x: this.width + cfg.r + rand(0, 80),
      y: rand(minY, maxY),
      vx: -speed,
      vy: rand(-8, 8),
      r: cfg.r,
      hp: cfg.hp,
      maxHp: cfg.hp,
      phase: rand(0, Math.PI * 2),
      wingSpeed: rand(cfg.wingSpeed[0], cfg.wingSpeed[1]),
      haloPhase: rand(0, Math.PI * 2),
      age: 0,
    };
    this.birds.push(b);
  }

  private moveBirds(dt: number): void {
    for (const b of this.birds) {
      b.x += b.vx * dt;
      b.age += dt;
      b.phase += b.wingSpeed * dt;
      b.haloPhase += 1.6 * dt;
      // 上下轻摆
      b.vy = Math.sin((b.age + dt) * 1.4 + b.phase) * 12;
      b.y += b.vy * dt;
    }
  }

  private moveBullets(dt: number): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bl = this.bullets[i];
      bl.x += bl.vx * dt;
      bl.y += bl.vy * dt;
      bl.ttl -= dt;
      if (
        bl.ttl <= 0 ||
        bl.x < -50 ||
        bl.x > this.width + 50 ||
        bl.y < -50 ||
        bl.y > this.height + 50
      ) {
        this.bullets.splice(i, 1);
        continue;
      }
      // 碰撞
      const hitIdx = this.findHitBird(bl);
      if (hitIdx >= 0) {
        const bird = this.birds[hitIdx];
        this.applyBulletHit(bl, bird);
        this.bullets.splice(i, 1);
      }
    }
  }

  private findHitBird(bl: Bullet): number {
    for (let i = 0; i < this.birds.length; i++) {
      const b = this.birds[i];
      const dx = bl.x - b.x;
      const dy = bl.y - b.y;
      if (dx * dx + dy * dy <= b.r * b.r) return i;
    }
    return -1;
  }

  private applyBulletHit(bl: Bullet, bird: BirdState): void {
    bird.hp -= bl.damage;
    const seat = this.seats[bl.ownerSeat];
    // 受伤事件
    this.events.push({
      id: newEventId(),
      seat: bl.ownerSeat,
      birdId: bird.id,
      x: bird.x,
      y: bird.y,
      damage: bl.damage,
    } as HitEvent);
    if (bird.hp <= 0) {
      // 击倒：计入连击
      seat.combo += 1;
      const cfg = BIRD_CONFIGS[bird.kind];
      let base = cfg.baseScore;
      if (bird.kind === "parrot" || bird.kind === "phoenix") base *= 2;
      const scoreBase = base;
      const multFactor = seat.multiplier / 100;
      let gain = Math.round(scoreBase * multFactor);
      // 连击加成：每 5 连击 +10%（最多 +50%）
      const comboBonus = Math.min(Math.floor(seat.combo / 5), 5) * 0.1;
      gain = Math.round(gain * (1 + comboBonus));
      seat.score += gain;
      this.events.push({
        id: newEventId(),
        seat: bl.ownerSeat,
        birdId: bird.id,
        kind: bird.kind,
        x: bird.x,
        y: bird.y,
        score: gain,
        baseScore: scoreBase,
        combo: seat.combo,
        totalMultiplier: seat.multiplier,
      } as KillEvent);
      // 分裂
      if (cfg.splitCount && cfg.splitCount > 0) {
        for (let i = 0; i < cfg.splitCount; i++) {
          const m: BirdState = {
            id: newBirdId(),
            kind: "split",
            x: bird.x + rand(-10, 10),
            y: bird.y + rand(-10, 10),
            vx: -Math.abs(bird.vx) * (0.8 + Math.random() * 0.4),
            vy: rand(-30, 30),
            r: BIRD_CONFIGS.split.r,
            hp: 1,
            maxHp: 1,
            phase: rand(0, Math.PI * 2),
            wingSpeed: rand(
              BIRD_CONFIGS.split.wingSpeed[0],
              BIRD_CONFIGS.split.wingSpeed[1],
            ),
            haloPhase: 0,
            age: 0,
          };
          this.birds.push(m);
        }
      }
      // 移除鸟
      const idx = this.birds.indexOf(bird);
      if (idx >= 0) this.birds.splice(idx, 1);
    }
  }

  private cleanup(): void {
    // 鸟离屏 -> 全场玩家连击重置
    for (let i = this.birds.length - 1; i >= 0; i--) {
      const b = this.birds[i];
      if (b.x < -b.r * 2) {
        this.birds.splice(i, 1);
        for (const s of this.seats) s.combo = 0;
      }
    }
  }

  /** 玩家发射子弹 */
  fire(seat: Seat, damage: number, speed: number): Bullet | null {
    if (seat.fireCooldown > 0) return null;
    if (!seat.online) return null;
    seat.fireCooldown = 120; // ms
    const dirX = Math.cos(seat.angle) * speed;
    const dirY = Math.sin(seat.angle) * speed;
    const bl = createBullet(seat, dirX, dirY, damage);
    this.bullets.push(bl);
    return bl;
  }
}
