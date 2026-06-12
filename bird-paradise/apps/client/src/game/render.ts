import {
  BIRD_CONFIGS,
  SEAT_COLORS,
  STAGE,
  TAU,
  type BirdState,
  type BulletState,
  type FloatTextEvent,
  type HitEvent,
  type KillEvent,
  type SeatIndex,
  type WorldSnapshot,
} from "@bird-paradise/shared";
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
  /**
   * 动画类型：
   * - "world" (默认)  老式渐显 + 上升
   * - "bounce"        弹跳入场（炮台前分数 / 大数字）
   * - "rise"          快速弹出后长距离上飘
   */
  kind?: "world" | "bounce" | "rise";
  /** 自发光颜色（用于弹跳文字的光晕） */
  glow?: string;
}

interface TrailSeg {
  /** 上一帧位置（用于渐变 / 拖尾线段） */
  x0: number;
  y0: number;
  /** 当前帧位置（与 bullet.x/y 一致） */
  x1: number;
  y1: number;
  life: number;
  maxLife: number;
  color: string;
  /** 线宽（像素） */
  width: number;
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface EffectsState {
  particles: Particle[];
  /** 拖尾线段（每帧从 bullet 推入） */
  trails: TrailSeg[];
  /** 子弹尾部的火花（区别于命中爆炸的 particles） */
  sparks: SparkParticle[];
  floats: FloatText[];
}

const fx: EffectsState = {
  particles: [],
  floats: [],
  trails: [],
  sparks: [],
};
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
        text: `+${ke.score}`,
        color: color2,
        size: big ? 60 : 38,
        kind: "rise",
        glow: big ? "#ffd86b" : color2,
      });
      // 炮台前加分（每个玩家都能看到自己的）
      if (isPlayer) {
        const sx = seatX(ke.seat as SeatIndex);
        const sy = seatY - 70;
        fx.floats.push({
          x: sx,
          y: sy,
          vy: -55,
          life: 1.6,
          maxLife: 1.6,
          text: `+${ke.score}`,
          color: color2,
          size: big ? 38 : 26,
          kind: "bounce",
          glow: color2,
        });
        // 炮台前小一圈粒子（庆祝感）
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * TAU + Math.random() * 0.3;
          const sp = 80 + Math.random() * 60;
          fx.particles.push({
            x: sx,
            y: sy + 8,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp - 30,
            life: 0.55 + Math.random() * 0.3,
            maxLife: 0.85,
            color: color2,
            size: 2 + Math.random() * 1.6,
          });
        }
      }
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
          kind: "bounce",
          glow: "#ffd24a",
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
          kind: "bounce",
          glow: "#ff8a3d",
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
    if (f.kind === "bounce") {
      // 弹跳类型：缓慢上升 + 减速，不下坠
      f.vy += 18 * dt;
      if (f.vy > -8) f.vy = -8;
    } else {
      f.vy += 40 * dt;
    }
    f.life -= dt;
    if (f.life <= 0) fx.floats.splice(i, 1);
  }
  for (let i = fx.trails.length - 1; i >= 0; i--) {
    const t = fx.trails[i]!;
    t.life -= dt;
    if (t.life <= 0) fx.trails.splice(i, 1);
  }
  for (let i = fx.sparks.length - 1; i >= 0; i--) {
    const s = fx.sparks[i]!;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vx *= 0.94;
    s.vy *= 0.94;
    s.life -= dt;
    if (s.life <= 0) fx.sparks.splice(i, 1);
  }
  // 限制
  if (fx.particles.length > 500)
    fx.particles.splice(0, fx.particles.length - 500);
  if (fx.floats.length > 80) fx.floats.splice(0, fx.floats.length - 80);
  if (fx.trails.length > 400) fx.trails.splice(0, fx.trails.length - 400);
  if (fx.sparks.length > 300) fx.sparks.splice(0, fx.sparks.length - 300);
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

/**
 * 子弹渲染（精致化）：
 * 1. 拖尾线段：每帧从 bullet.prevX/prevY 到 x/y 推入一条 渐变 + 自发光 的线段
 * 2. 火花：尾部随机发散小亮点，模拟能量流
 * 3. 弹体：外圈径向辉光 + 中心白热核心 + 头部方向指示
 */
function drawBullet(ctx: CanvasRenderingContext2D, b: BulletState): void {
  const color = SEAT_COLORS[b.ownerSeat];
  const dx = b.x - b.prevX;
  const dy = b.y - b.prevY;
  const segLen = Math.hypot(dx, dy);
  // 单位向量（运动方向）
  const ux = segLen > 0.001 ? dx / segLen : 0;
  const uy = segLen > 0.001 ? dy / segLen : 0;
  // 垂直方向（用于环/横向辉光）
  const vx = -uy;
  const vy = ux;
  // 速度估算（像素/秒）
  const speed = segLen * 30; // 30fps 快照

  // —— 1) 拖尾线段 ——
  // 推送 3 条宽度递减、透明度递增的线段，实现渐变 + 拖尾
  const layers = [
    { width: 14, alpha: 0.18, life: 0.22 }, // 最外层柔光
    { width: 8, alpha: 0.45, life: 0.18 },
    { width: 4, alpha: 0.85, life: 0.14 }, // 中心高亮
  ];
  for (const L of layers) {
    fx.trails.push({
      x0: b.prevX,
      y0: b.prevY,
      x1: b.x,
      y1: b.y,
      life: L.life,
      maxLife: L.life,
      color,
      width: L.width,
    });
    void L.alpha;
  }

  // —— 2) 火花（只保留较快的子弹，避免一团乱） ——
  if (speed > 200) {
    const sparkCount = Math.min(3, 1 + Math.floor(speed / 600));
    for (let i = 0; i < sparkCount; i++) {
      const spread = (Math.random() - 0.5) * 1.6;
      const back = -segLen * (0.4 + Math.random() * 0.6);
      const sx = b.x + ux * back + vx * spread;
      const sy = b.y + uy * back + vy * spread;
      // 火花向后 + 横向扩散
      const sp = 60 + Math.random() * 80;
      const av = Math.atan2(vy, vx) + spread;
      fx.sparks.push({
        x: sx,
        y: sy,
        vx: -ux * sp * 0.4 + Math.cos(av) * sp * 0.5,
        vy: -uy * sp * 0.4 + Math.sin(av) * sp * 0.5,
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.45,
        color: Math.random() < 0.5 ? "#fff7c8" : color,
        size: 1 + Math.random() * 1.6,
      });
    }
  }

  // —— 3) 弹体 ——
  ctx.save();

  // 外圈辉光（径向渐变）
  const halo = ctx.createRadialGradient(b.x, b.y, 1, b.x, b.y, 16);
  halo.addColorStop(0, "rgba(255, 255, 220, 0.95)");
  halo.addColorStop(0.25, hexToRgba(color, 0.8));
  halo.addColorStop(0.6, hexToRgba(color, 0.35));
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(b.x, b.y, 16, 0, TAU);
  ctx.fill();

  // 外圈环（薄环 + 微微脉动）
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = hexToRgba(color, 0.85);
  ctx.beginPath();
  ctx.arc(b.x, b.y, 7, 0, TAU);
  ctx.stroke();

  // 中心高亮（白热）
  const core = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 5);
  core.addColorStop(0, "#ffffff");
  core.addColorStop(0.5, "#fff7c8");
  core.addColorStop(1, hexToRgba(color, 0.9));
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(b.x, b.y, 4.5, 0, TAU);
  ctx.fill();

  // 头部方向光斑（鼻尖更亮）
  const nx = b.x + ux * 3;
  const ny = b.y + uy * 3;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(nx, ny, 1.6, 0, TAU);
  ctx.fill();

  // 横向小光斑（环上的 4 个亮点）
  ctx.fillStyle = hexToRgba(color, 0.9);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + frameTime * 4;
    const rx = b.x + Math.cos(a) * 7;
    const ry = b.y + Math.sin(a) * 7;
    ctx.beginPath();
    ctx.arc(rx, ry, 1, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** 把 #rrggbb 字符串转成 rgba 字符串（alpha 0~1） */
function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1]!, 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawTrails(ctx: CanvasRenderingContext2D): void {
  for (const t of fx.trails) {
    const a = Math.max(0, t.life / t.maxLife);
    // 把 rgba 颜色转成带 alpha 的：取颜色，alpha 由 life 控制
    const rgba = hexToRgba(t.color, a);
    // 外发光（粗、柔）
    ctx.save();
    ctx.strokeStyle = rgba;
    ctx.lineWidth = t.width * a;
    ctx.lineCap = "round";
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 12 * a;
    ctx.beginPath();
    ctx.moveTo(t.x0, t.y0);
    ctx.lineTo(t.x1, t.y1);
    ctx.stroke();
    // 内亮（细、亮白）叠加
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.7})`;
    ctx.lineWidth = Math.max(1, t.width * 0.25 * a);
    ctx.beginPath();
    ctx.moveTo(t.x0, t.y0);
    ctx.lineTo(t.x1, t.y1);
    ctx.stroke();
    ctx.restore();
  }
}

function drawSparks(ctx: CanvasRenderingContext2D): void {
  for (const s of fx.sparks) {
    const a = Math.max(0, s.life / s.maxLife);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 6 * a;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * a, 0, TAU);
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
    const tNorm = 1 - f.life / f.maxLife; // 0 -> 1
    const lifeAlpha = Math.max(0, f.life / f.maxLife);

    // 三种动画曲线
    let scale = 1;
    let alpha = lifeAlpha;
    if (f.kind === "bounce") {
      // 弹跳入场 + 上升 + 淡出
      // tNorm ∈ [0,1]
      // 0.00 - 0.18 : 0.3 -> 1.35  (overshoot)
      // 0.18 - 0.30 : 1.35 -> 0.92 (bounce back)
      // 0.30 - 0.40 : 0.92 -> 1.08 (small overshoot)
      // 0.40 - 0.55 : 1.08 -> 1.00 (settle)
      // 0.55 - 1.00 : 1.00 -> 1.05 (微微再大) + 渐隐
      if (tNorm < 0.18) {
        const k = tNorm / 0.18;
        scale = 0.3 + (1.35 - 0.3) * easeOutCubic(k);
      } else if (tNorm < 0.3) {
        const k = (tNorm - 0.18) / 0.12;
        scale = 1.35 + (0.92 - 1.35) * k;
      } else if (tNorm < 0.4) {
        const k = (tNorm - 0.3) / 0.1;
        scale = 0.92 + (1.08 - 0.92) * k;
      } else if (tNorm < 0.55) {
        const k = (tNorm - 0.4) / 0.15;
        scale = 1.08 + (1.0 - 1.08) * k;
      } else {
        // 上升段，alpha 渐隐
        const k = (tNorm - 0.55) / 0.45;
        scale = 1.0 + 0.05 * Math.sin(k * Math.PI);
        alpha = lifeAlpha;
      }
    } else if (f.kind === "rise") {
      // 大数字：快速放大后保持，缓慢上飘淡出
      if (tNorm < 0.15) {
        const k = tNorm / 0.15;
        scale = 0.4 + 1.0 * easeOutBack(k);
      } else {
        scale = 1.0 + 0.08 * Math.sin((tNorm - 0.15) * 4);
      }
    } else {
      // 默认
      scale = 0.7 + 0.3 * lifeAlpha;
    }

    const size = f.size * scale;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `900 ${size}px system-ui, -apple-system, "PingFang SC", sans-serif`;
    ctx.lineWidth = Math.max(3, size * 0.12);
    ctx.lineJoin = "round";
    // 外黑描边
    ctx.strokeStyle = "rgba(0, 0, 0, 0.78)";
    ctx.strokeText(f.text, f.x, f.y);
    // 内白高光
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = Math.max(1.2, size * 0.05);
    ctx.strokeText(f.text, f.x, f.y);
    // 颜色填充
    if (f.glow) {
      ctx.shadowColor = f.glow;
      ctx.shadowBlur = size * 0.4;
    }
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
  }
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}
function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
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
  // 子弹尾部的火花
  drawSparks(ctx);
  // 粒子
  drawParticles(ctx);
  // 飘字
  drawFloats(ctx);
  // 玩家条 + 炮台
  drawSeatStrip(ctx, snap, flashSeat, selfSeat);
  // 顶部条
  drawTopBar(ctx, snap);
}
