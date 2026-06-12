// 共享游戏配置 - 客户端与服务端一致
import type { BirdKind } from "./protocol.js";

/** 鸟的视觉/属性 */
export interface BirdConfig {
  kind: BirdKind;
  label: string;
  baseScore: number;
  hp: number;
  r: number;
  speed: [number, number];
  wingSpeed: [number, number];
  body: string;
  belly: string;
  beak: string;
  splitCount?: number;
  splitHalfScore?: boolean;
  weight: number;
  minInterval?: number;
}

export const BIRD_CONFIGS: Record<BirdKind, BirdConfig> = {
  sparrow: {
    kind: "sparrow",
    label: "麻雀",
    baseScore: 10,
    hp: 1,
    r: 22,
    speed: [120, 180],
    wingSpeed: [8, 12],
    body: "#8b6a4a",
    belly: "#d9c2a3",
    beak: "#e8b04a",
    weight: 50,
  },
  goldfinch: {
    kind: "goldfinch",
    label: "金翅雀",
    baseScore: 15,
    hp: 1,
    r: 24,
    speed: [130, 200],
    wingSpeed: [9, 13],
    body: "#d99b1c",
    belly: "#f5d76e",
    beak: "#a36413",
    weight: 30,
  },
  hummingbird: {
    kind: "hummingbird",
    label: "蜂鸟",
    baseScore: 20,
    hp: 1,
    r: 26,
    speed: [150, 230],
    wingSpeed: [18, 24],
    body: "#3aa6c4",
    belly: "#9be0f0",
    beak: "#1b3a4a",
    splitCount: 3,
    splitHalfScore: true,
    weight: 14,
  },
  owl: {
    kind: "owl",
    label: "猫头鹰",
    baseScore: 45,
    hp: 1,
    r: 34,
    speed: [90, 140],
    wingSpeed: [5, 7],
    body: "#5a4326",
    belly: "#b59872",
    beak: "#e8b04a",
    splitCount: 3,
    splitHalfScore: true,
    weight: 8,
  },
  halo: {
    kind: "halo",
    label: "光圈鸟",
    baseScore: 30,
    hp: 1,
    r: 30,
    speed: [110, 170],
    wingSpeed: [7, 10],
    body: "#9a7be0",
    belly: "#e3d6ff",
    beak: "#ffd24a",
    weight: 8,
  },
  parrot: {
    kind: "parrot",
    label: "巨型金刚鹦鹉",
    baseScore: 180,
    hp: 2,
    r: 56,
    speed: [70, 110],
    wingSpeed: [4, 6],
    body: "#1ea64a",
    belly: "#ffd24a",
    beak: "#e85c2a",
    weight: 1,
    minInterval: 25,
  },
  phoenix: {
    kind: "phoenix",
    label: "黄金凤凰",
    baseScore: 250,
    hp: 3,
    r: 60,
    speed: [80, 130],
    wingSpeed: [5, 7],
    body: "#ff7a1a",
    belly: "#ffd86b",
    beak: "#c43a00",
    weight: 1,
    minInterval: 40,
  },
  lucky: {
    kind: "lucky",
    label: "幸运鸟",
    baseScore: 50,
    hp: 1,
    r: 30,
    speed: [120, 180],
    wingSpeed: [9, 12],
    body: "#ff5fa2",
    belly: "#ffe1f0",
    beak: "#ffd24a",
    weight: 3,
  },
  split: {
    kind: "split",
    label: "小鸟",
    baseScore: 5,
    hp: 1,
    r: 14,
    speed: [150, 220],
    wingSpeed: [12, 16],
    body: "#a48fd9",
    belly: "#e3d6ff",
    beak: "#5a3aa6",
    weight: 0,
  },
};

export const NORMAL_KINDS: BirdKind[] = [
  "sparrow",
  "goldfinch",
  "hummingbird",
  "owl",
];
export const BOSS_KINDS: BirdKind[] = ["parrot", "phoenix"];

/** 玩家炮台配置 */
export const SEAT_CONFIG = {
  maxPlayers: 4,
  /** 倍数范围 */
  multiplierMin: 100,
  multiplierMax: 2000,
  multiplierStep: 100,
  /** 射击冷却（毫秒） */
  fireInterval: 120,
  /** 子弹初速（像素/秒） */
  bulletSpeed: 900,
  /** 子弹基础伤害 */
  bulletBaseDamage: 1,
  /** 子弹 ttl（秒） */
  bulletTtl: 2.5,
};

/** 生成配置 */
export const SPAWN_CONFIG = {
  baseInterval: 0.9,
  minInterval: 0.45,
  ramp: 0.005,
  /** 4 玩家版本同屏数量提高 */
  maxAlive: 28,
  bossCooldown: 22,
  luckyCooldown: 18,
  haloCooldown: 14,
};

/** 屏幕逻辑尺寸（与客户端约定一致） */
export const STAGE = {
  width: 1280,
  height: 720,
  /** 底部玩家条带高度 */
  seatStrip: 110,
};

/** 4 个玩家座位主题色（仅客户端渲染使用） */
export const SEAT_COLORS: [string, string, string, string] = [
  "#ff5b6e",
  "#36c1ff",
  "#ffd24a",
  "#5be87a",
];

/* ===================================================================== *
 *  币 / 上币系统
 * ===================================================================== */

/** 玩家账户（服务端权威） */
export interface PlayerAccount {
  /** 当前可用余额 */
  balance: number;
  /** 累计充入（含赠送） */
  deposited: number;
  /** 累计消耗 */
  spent: number;
}

/** 充值档位（UI 与服务端共用同一份配置） */
export interface TopUpOption {
  /** 充值金额 */
  amount: number;
  /** 赠送金额 */
  bonus: number;
  /** UI 标签 */
  label: string;
  /** 角标颜色 */
  color: string;
}

/** 充值档位定义 */
export const TOP_UP_OPTIONS: readonly TopUpOption[] = [
  { amount: 100, bonus: 0, label: "小充", color: "#5be87a" },
  { amount: 500, bonus: 50, label: "中充", color: "#36c1ff" },
  { amount: 1000, bonus: 200, label: "大充", color: "#ffd24a" },
  { amount: 5000, bonus: 1500, label: "豪充", color: "#ff5fa2" },
] as const;

/** 币种相关配置 */
export const COIN = {
  /** 入场赠送 */
  initialBalance: 100,
  /** 每次发射的基础消耗（与 multiplier / 100 相乘） */
  costPer100Multiplier: 1,
  /** 倍数为 0 时的兜底消耗（防止除零） */
  minCost: 1,
  /** 余额不足提醒阈值（达到该值时弹一个顶部 toast） */
  lowBalanceWarn: 10,
} as const;

/** 根据倍数计算单发成本 */
export function costOfShot(multiplier: number): number {
  return Math.max(
    COIN.minCost,
    Math.floor((multiplier / 100) * COIN.costPer100Multiplier),
  );
}

/** 工具 */
export const TAU = Math.PI * 2;
export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
export function pickWeighted<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}
