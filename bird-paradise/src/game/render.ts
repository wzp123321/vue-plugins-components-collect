import type {
  WorldSnapshot,
  BirdState,
  BulletState,
  FloatTextEvent,
  KillEvent,
  HitEvent,
  SeatIndex,
} from "../protocol";
import { BIRD_CONFIGS, SEAT_COLORS, STAGE } from "./config";

const TAU = Math.PI * 2;
const seatX = (i: number) => (STAGE.width / 4) * (i + 0.5);
const seatY = STAGE.height - STAGE.seatStrip * 0.45;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatText {
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  text: string;
  color: string;
  size: number;
}

interface TrailDot {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  color: string;
  r: number;
}

interface EffectsState {
  particles: Particle[];
  floats: FloatText[];
  trails: TrailDot[];
}

const fx: EffectsState = { particles: [], floats: [], trails: [] };
const seenEventIds = new Set<number>();
let frameTime = 0;

function spawnExplosion(
  x: number,
  y: number,
  color: string,
  count = 18,
  power = 1,
): void {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * TAU;
    const sp = 80 + Math.random() * 240 * power;
    fx.particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 0.55 + Math.random() * 0.35,
      maxLife: 0.9,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function spawnHit(x: number, y: number, color: string): void {
  for (let i = 0; i < 6; i++) {
    const a = Math.random() * TAU;
    const sp = 40 + Math.random() * 90;
    fx.particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 0.25 + Math.random() * 0.2,
      maxLife: 0.45,
      color,
      size: 1.5 + Math.random() * 2,
    });
  }
}

function spawnRing(x: number, y: number, color: string, r = 30): void {
  // 简化：写一个独立粒子类型？还是复用？直接 push 大尺寸短寿命粒子
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU;
    fx.particles.push({
      x,
      y,
      vx: Math.cos(a) * 240,
      vy: Math.sin(a) * 240,
      life: 0.35,
      maxLife: 0.35,
      color,
      size: 4,
    });
  }
  void r;
}

function spawnFloat(ev: FloatTextEvent): void {
  fx.floats.push({
    x: ev.x,
    y: ev.y,
    vy: -60,
    life: 1.2,
    maxLife: 1.2,
    text: ev.text,
    color: ev.color,
    size: ev.size,
  });
}

function processEvents(snap: WorldSnapshot): void {
  for (const e of snap.events) {
    if (seenEventIds.has(e.id)) continue;
    seenEventIds.add(e.id);
    if ("kind" in e) {
      // KillEvent
      const ke = e as KillEvent;
      const big = ke.kind === "parrot" || ke.kind === "phoenix";
      const color = big ? "#ffd86b" : BIRD_CONFIGS[ke.kind].belly;
      spawnExplosion(ke.x, ke.y, color, big ? 36 : 22, big ? 1.4 : 1);
      spawnRing(ke.x, ke.y, color);
      // 飘字
      const isPlayer = ke.seat >= 0 && ke.seat < 4;
      const color2 = isPlayer ? SEAT_COLORS[ke.seat as SeatIndex] : "#fff";
      fx.floats.push({
        x: ke.x,
        y: ke.y - 8,
        vy: -80,
        life: 1.4,
        maxLife: 1.4,
        text: `${ke.score}`,
        color: color2,
        size: big ? 56 : 36,
      });
      if (big) {
        fx.floats.push({
          x: ke.x,
          y: ke.y + 18,
          vy: -40,
          life: 1.2,
          maxLife: 1.2,
          text: "超级大鸟",
          color: "#ffd24a",
          size: 28,
        });
      }
      if (ke.combo >= 5) {
        fx.floats.push({
          x: ke.x + 30,
          y: ke.y + 40,
          vy: -50,
          life: 0.9,
          maxLife: 0.9,
          text: `连击 x${ke.combo}`,
          color: "#ff8a3d",
          size: 22,
        });
      }
    } else if ("damage" in e) {
      // HitEvent
      const he = e as HitEvent;
      spawnHit(he.x, he.y, "#ffe6a3");
    } else {
      // FloatTextEvent
      spawnFloat(e as FloatTextEvent);
    }
  }
  if (seenEventIds.size > 4000) {
    // 简单防膨胀：超过 4000 清理前 2000
    const arr = Array.from(seenEventIds).slice(0, 2000);
    for (const id of arr) seenEventIds.delete(id);
  }
}

function updateFx(dt: number): void {
  for (let i = fx.particles.length - 1; i >= 0; i--) {
    const p = fx.particles[i]!;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 120 * dt;
    p.vx *= 0.98;
    p.life -= dt;
    if (p.life <= 0) fx.particles.splice(i, 1);
  }
  for (let i = fx.floats.length - 1; i >= 0; i--) {
    const f = fx.floats[i]!;
    f.y += f.vy * dt;
    f.vy += 40 * dt;
    f.life -= dt;
    if (f.life <= 0) fx.floats.splice(i, 1);
  }
  for (let i = fx.trails.length - 1; i >= 0; i--) {
    const t = fx.trails[i]!;
    t.life -= dt;
    if (t.life <= 0) fx.trails.splice(i, 1);
  }
  // 限制
  if (fx.particles.length > 500)
    fx.particles.splice(0, fx.particles.length - 500);
  if (fx.floats.length > 80) fx.floats.splice(0, fx.floats.length - 80);
  if (fx.trails.length > 400) fx.trails.splice(0, fx.trails.length - 400);
}

function drawBackground(ctx: CanvasRenderingContext2D, t: number): void {
  // 天空渐变
  const sky = ctx.createLinearGradient(0, 0, 0, STAGE.height);
  sky.addColorStop(0, "#1d4d6e");
  sky.addColorStop(0.55, "#3a8c5b");
  sky.addColorStop(1, "#1a3a26");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);

  // 远山
  ctx.fillStyle = "#2c5e3c";
  ctx.beginPath();
  ctx.moveTo(0, STAGE.height * 0.55);
  for (let x = 0; x <= STAGE.width; x += 80) {
    const y =
      STAGE.height * 0.5 +
      Math.sin(x * 0.005 + 1.2) * 30 +
      Math.sin(x * 0.012) * 14;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(STAGE.width, STAGE.height);
  ctx.lineTo(0, STAGE.height);
  ctx.closePath();
  ctx.fill();

  // 草地
  const grass = ctx.createLinearGradient(
    0,
    STAGE.height - STAGE.seatStrip - 60,
    0,
    STAGE.height,
  );
  grass.addColorStop(0, "#4d7a32");
  grass.addColorStop(1, "#284b1f");
  ctx.fillStyle = grass;
  ctx.fillRect(
    0,
    STAGE.height - STAGE.seatStrip - 60,
    STAGE.width,
    STAGE.seatStrip + 60,
  );

  // 树丛点缀
  ctx.fillStyle = "#1f4220";
  for (let i = 0; i < 12; i++) {
    const x = (i * 113 + 30) % STAGE.width;
    const y = STAGE.height - STAGE.seatStrip - 30 + (i % 2) * 16;
    ctx.beginPath();
    ctx.arc(x, y, 22 + (i % 3) * 6, 0, TAU);
    ctx.fill();
  }

  // 太阳
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "#ffe89a";
  ctx.beginPath();
  ctx.arc(STAGE.width - 130, 120, 60, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.arc(STAGE.width - 130, 120, 96, 0, TAU);
  ctx.fill();
  ctx.restore();
  void t;
}

function drawCannon(
  ctx: CanvasRenderingContext2D,
  seat: number,
  p: WorldSnapshot["players"][number],
  flash: boolean,
  self: boolean,
): void {
  const x = seatX(seat);
  const y = seatY;
  const color = SEAT_COLORS[seat];
  // 底座
  ctx.save();
  // 闪光
  if (flash) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 56, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  // 底座大圆
  const g = ctx.createRadialGradient(x, y, 5, x, y, 44);
  g.addColorStop(0, "#fff5c8");
  g.addColorStop(0.5, color);
  g.addColorStop(1, "#1d0e0a");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 38, 0, TAU);
  ctx.fill();
  // 描边
  ctx.lineWidth = 3;
  ctx.strokeStyle = self ? "#fff" : "#2a1010";
  ctx.stroke();
  // 玩家编号
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`P${seat + 1}`, x, y);
  // 倍数
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.fillText(`x${p.multiplier}`, x, y + 18);
  // 炮管
  ctx.translate(x, y);
  ctx.rotate(p.angle + Math.PI / 2); // 炮管从中心向 -y 方向，因为 angle=-PI/2 是正上方 -> rotate=0
  // 修正：原 angle=-PI/2 对应炮管指向上方；rotate(0) 是向右，rotate(-PI/2) 是向上
  // 我们希望 angle=-PI/2 时炮管朝上，所以 rotate = angle + PI/2
  ctx.fillStyle = "#3a2a1a";
  ctx.fillRect(-8, -56, 16, 44);
  ctx.fillStyle = color;
  ctx.fillRect(-6, -56, 12, 36);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(0, -52, 5, 0, TAU);
  ctx.fill();
  // 枪口火焰
  if (p.firing) {
    ctx.fillStyle = "rgba(255, 220, 120, 0.85)";
    ctx.beginPath();
    ctx.arc(0, -60, 6 + Math.random() * 4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  // 玩家名
  ctx.fillStyle = "#fff";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(p.name || `玩家${seat + 1}`, x, y + 44);
}

function drawBullet(ctx: CanvasRenderingContext2D, b: BulletState): void {
  const color = SEAT_COLORS[b.ownerSeat];
  // 拖尾
  fx.trails.push({
    x: b.x,
    y: b.y,
    life: 0.15,
    maxLife: 0.15,
    color,
    r: 4,
  });
  // 弹体
  ctx.save();
  ctx.fillStyle = "#fff7c2";
  ctx.beginPath();
  ctx.arc(b.x, b.y, 4, 0, TAU);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(b.x, b.y, 2.5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawTrails(ctx: CanvasRenderingContext2D): void {
  for (const t of fx.trails) {
    const a = t.life / t.maxLife;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = t.color;
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.r * a, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

function drawBird(ctx: CanvasRenderingContext2D, b: BirdState): void {
  const cfg = BIRD_CONFIGS[b.kind];
  const wing = Math.sin(b.phase) * 0.6;
  ctx.save();
  ctx.translate(b.x, b.y);
  // 飞向左侧
  ctx.scale(-1, 1);
  // 阴影
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(0, b.r * 0.5, b.r * 0.7, b.r * 0.2, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  // 身体
  ctx.fillStyle = cfg.body;
  ctx.beginPath();
  ctx.ellipse(0, 0, b.r, b.r * 0.75, 0, 0, TAU);
  ctx.fill();
  // 腹部
  ctx.fillStyle = cfg.belly;
  ctx.beginPath();
  ctx.ellipse(b.r * 0.1, b.r * 0.15, b.r * 0.55, b.r * 0.45, 0, 0, TAU);
  ctx.fill();
  // 翅膀
  ctx.fillStyle = cfg.body;
  ctx.beginPath();
  ctx.ellipse(
    -b.r * 0.2,
    -b.r * 0.1,
    b.r * 0.7,
    b.r * 0.32 + wing * b.r * 0.18,
    -0.4,
    0,
    TAU,
  );
  ctx.fill();
  // 嘴
  ctx.fillStyle = cfg.beak;
  ctx.beginPath();
  ctx.moveTo(b.r * 0.85, -b.r * 0.05);
  ctx.lineTo(b.r * 1.35, b.r * 0.05);
  ctx.lineTo(b.r * 0.85, b.r * 0.1);
  ctx.closePath();
  ctx.fill();
  // 眼睛
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(b.r * 0.55, -b.r * 0.18, b.r * 0.12, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(b.r * 0.58, -b.r * 0.18, b.r * 0.06, 0, TAU);
  ctx.fill();
  // 尾羽
  ctx.fillStyle = cfg.body;
  ctx.beginPath();
  ctx.moveTo(-b.r * 0.7, 0);
  ctx.lineTo(-b.r * 1.15, -b.r * 0.18);
  ctx.lineTo(-b.r * 1.05, 0);
  ctx.lineTo(-b.r * 1.15, b.r * 0.18);
  ctx.closePath();
  ctx.fill();
  // 光圈（halo）
  if (b.kind === "halo" || b.kind === "lucky") {
    ctx.save();
    const pulse = 0.5 + 0.5 * Math.sin(b.haloPhase * 2);
    ctx.globalAlpha = 0.4 + 0.4 * pulse;
    ctx.strokeStyle = b.kind === "halo" ? "#fff7c8" : "#ffe1f0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, b.r * 1.4 + pulse * 6, b.r * 1.0 + pulse * 4, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  // 血条（HP > 1 才有意义）
  if (b.maxHp > 1) {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(-b.r, -b.r - 10, b.r * 2, 4);
    ctx.fillStyle = "#ff6a3a";
    ctx.fillRect(-b.r, -b.r - 10, b.r * 2 * (b.hp / b.maxHp), 4);
  }
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D): void {
  for (const p of fx.particles) {
    const a = Math.max(0, p.life / p.maxLife);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * a, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

function drawFloats(ctx: CanvasRenderingContext2D): void {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const f of fx.floats) {
    const a = Math.max(0, f.life / f.maxLife);
    const size = f.size * (0.7 + 0.3 * a);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = `bold ${size}px system-ui, sans-serif`;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 8;
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
  }
}

function drawSeatStrip(
  ctx: CanvasRenderingContext2D,
  snap: Readonly<WorldSnapshot>,
  flash: number,
  selfSeat: number | null,
): void {
  const y0 = STAGE.height - STAGE.seatStrip;
  const g = ctx.createLinearGradient(0, y0, 0, STAGE.height);
  g.addColorStop(0, "rgba(20,12,6,0.6)");
  g.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, STAGE.width, STAGE.seatStrip);
  // 玩家分数
  for (let i = 0; i < 4; i++) {
    const p = snap.players[i]!;
    const x = seatX(i);
    const color = SEAT_COLORS[i];
    const isSelf = selfSeat === i;
    ctx.save();
    if (isSelf) {
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(0, y0, STAGE.width / 4, STAGE.seatStrip);
    }
    // 编号
    ctx.fillStyle = color;
    ctx.font = "bold 16px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`P${i + 1}`, x - 80, y0 + 10);
    // 分数
    ctx.fillStyle = p.online ? "#fff" : "rgba(255,255,255,0.35)";
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillText(p.score.toLocaleString(), x - 60, y0 + 8);
    // 倍数
    ctx.fillStyle = color;
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.fillText(`x${p.multiplier}`, x + 60, y0 + 14);
    // 连击
    if (snap.combo[i] >= 3) {
      ctx.fillStyle = "#ff8a3d";
      ctx.font = "bold 14px system-ui, sans-serif";
      ctx.fillText(`combo ${snap.combo[i]}`, x + 110, y0 + 14);
    }
    // 状态
    if (!p.online) {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillText("(空位)", x - 60, y0 + 36);
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillText(p.name || `玩家${i + 1}`, x - 60, y0 + 36);
    }
    ctx.restore();
    // 炮台
    drawCannon(ctx, i, p, flash === i, isSelf);
  }
}

function drawTopBar(
  ctx: CanvasRenderingContext2D,
  snap: Readonly<WorldSnapshot>,
): void {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, STAGE.width, 36);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const onlineCount = snap.players.filter((p) => p.online).length;
  ctx.fillText(
    `房间  ${snap.players.find((p) => p.id)?.id ? "" : ""}  在线 ${onlineCount}/4  tick ${snap.tick}`,
    12,
    18,
  );
  ctx.textAlign = "right";
  ctx.fillText("飞鸟乐园 · 4人对战", STAGE.width - 12, 18);
  ctx.restore();
}

export function render(
  ctx: CanvasRenderingContext2D,
  snap: Readonly<WorldSnapshot>,
  flashSeat: number,
  selfSeat: number | null,
): void {
  if (!ctx) return;
  const dt = 1 / 60;
  frameTime += dt;
  processEvents(snap);
  updateFx(dt);
  // 清屏
  ctx.clearRect(0, 0, STAGE.width, STAGE.height);
  drawBackground(ctx, frameTime);
  // 鸟
  for (const b of snap.birds) drawBird(ctx, b);
  // 子弹拖尾
  drawTrails(ctx);
  // 子弹
  for (const b of snap.bullets) drawBullet(ctx, b);
  // 粒子
  drawParticles(ctx);
  // 飘字
  drawFloats(ctx);
  // 玩家条 + 炮台
  drawSeatStrip(ctx, snap, flashSeat, selfSeat);
  // 顶部条
  drawTopBar(ctx, snap);
}
