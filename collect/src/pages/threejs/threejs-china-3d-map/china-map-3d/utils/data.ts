import * as THREE from 'three'
import type { GeoLevel } from '../types'

export interface Tier {
  /** 区间上界（含） */
  max: number
  color: string
  label: string
}

export type ProjectData = Record<number, number | { count: number }>

/** 兼容 number 与 { count } 两种数据形态 */
export const readCount = (value: number | { count: number } | undefined): number => {
  if (value == null) return 0
  return typeof value === 'number' ? value : value.count
};

/** 外部没给数据时，按 adcode 生成确定性伪随机值，保证下钻后仍有内容可看 */
export const syntheticCount = (adcode: number, level: GeoLevel | string): number => {
  let hash = (adcode >>> 0) || 1
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507) >>> 0
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909) >>> 0
  hash ^= hash >>> 16
  const base = level === 'district' ? 6 : level === 'city' ? 20 : 50
  return base + (hash % (base * 2))
};

export const LEVEL_TEXT: Record<string, string> = {
  country: '国家',
  province: '省',
  city: '市',
  district: '区/县',
}

const DEEP_COLOR = new THREE.Color('#0F3A57')

/**
 * 按分位点把数值分 4 档，档位色从深蓝插值到「高值色」锚点。
 * 分档而非线性映射，是为了让配色在一眼扫过时就能读出量级差异。
 */
export const buildTiers = (values: number[], highColor: string): Tier[] => {
  const anchor = new THREE.Color(highColor || '#5FC9EE')
  const colors = [0.3, 0.55, 0.78, 1].map(
    (k) => `#${DEEP_COLOR.clone().lerp(anchor, k).getHexString()}`,
  )
  const sorted = [...values].sort((a, b) => a - b)
  const quantile = (p: number) =>
    sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))))] ?? 0
  const t1 = quantile(0.25)
  const t2 = quantile(0.5)
  const t3 = quantile(0.78)
  return [
    { max: t1, color: colors[0], label: `≤ ${t1}` },
    { max: t2, color: colors[1], label: `${t1} - ${t2}` },
    { max: t3, color: colors[2], label: `${t2} - ${t3}` },
    { max: Infinity, color: colors[3], label: `> ${t3}` },
  ]
};

export const tierOf = (value: number, tiers: Tier[]): number => {
  for (let i = 0; i < tiers.length; i++) if (value <= tiers[i].max) return i
  return tiers.length - 1
};
