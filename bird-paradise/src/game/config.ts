import type { BirdKind } from "../protocol";

// 与 bird-paradise-server/src/game/config.ts 同步
export interface BirdConfig {
  kind: BirdKind;
  label: string;
  baseScore: number;
  hp: number;
  r: number;
  body: string;
  belly: string;
  beak: string;
}

export const BIRD_CONFIGS: Record<BirdKind, BirdConfig> = {
  sparrow: {
    kind: "sparrow",
    label: "麻雀",
    baseScore: 10,
    hp: 1,
    r: 22,
    body: "#8b6a4a",
    belly: "#d9c2a3",
    beak: "#e8b04a",
  },
  goldfinch: {
    kind: "goldfinch",
    label: "金翅雀",
    baseScore: 15,
    hp: 1,
    r: 24,
    body: "#d99b1c",
    belly: "#f5d76e",
    beak: "#a36413",
  },
  hummingbird: {
    kind: "hummingbird",
    label: "蜂鸟",
    baseScore: 20,
    hp: 1,
    r: 26,
    body: "#3aa6c4",
    belly: "#9be0f0",
    beak: "#1b3a4a",
  },
  owl: {
    kind: "owl",
    label: "猫头鹰",
    baseScore: 45,
    hp: 1,
    r: 34,
    body: "#5a4326",
    belly: "#b59872",
    beak: "#e8b04a",
  },
  halo: {
    kind: "halo",
    label: "光圈鸟",
    baseScore: 30,
    hp: 1,
    r: 30,
    body: "#9a7be0",
    belly: "#e3d6ff",
    beak: "#ffd24a",
  },
  parrot: {
    kind: "parrot",
    label: "巨型鹦鹉",
    baseScore: 180,
    hp: 2,
    r: 56,
    body: "#1ea64a",
    belly: "#ffd24a",
    beak: "#e85c2a",
  },
  phoenix: {
    kind: "phoenix",
    label: "黄金凤凰",
    baseScore: 250,
    hp: 3,
    r: 60,
    body: "#ff7a1a",
    belly: "#ffd86b",
    beak: "#c43a00",
  },
  lucky: {
    kind: "lucky",
    label: "幸运鸟",
    baseScore: 50,
    hp: 1,
    r: 30,
    body: "#ff5fa2",
    belly: "#ffe1f0",
    beak: "#ffd24a",
  },
  split: {
    kind: "split",
    label: "小鸟",
    baseScore: 5,
    hp: 1,
    r: 14,
    body: "#a48fd9",
    belly: "#e3d6ff",
    beak: "#5a3aa6",
  },
};

export const SEAT_CONFIG = {
  maxPlayers: 4,
  multiplierMin: 100,
  multiplierMax: 2000,
  multiplierStep: 100,
};

export const STAGE = {
  width: 1280,
  height: 720,
  seatStrip: 110,
};

/** 4 个玩家座位主题色 */
export const SEAT_COLORS: [string, string, string, string] = [
  "#ff5b6e",
  "#36c1ff",
  "#ffd24a",
  "#5be87a",
];
