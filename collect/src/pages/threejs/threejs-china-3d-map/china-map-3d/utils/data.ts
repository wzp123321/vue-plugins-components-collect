/**
 * data.ts —— 数据分档 / 配色 / 伪随机兜底
 *
 * 本文件职责：
 *   - readCount：兼容 number 与 { count } 两种数据形态
 *   - syntheticCount：无外部数据时按 adcode 生成确定性伪随机值（下钻仍有内容）
 *   - buildTiers / tierOf：按分位点把数值分 4 档并上色，供数据柱分色
 *   - LEVEL_TEXT：层级中文名
 *
 * 在整体架构中的角色：数据 → 视觉映射层。柱体颜色（spotLayer）与图例都依赖
 *   本文件产出的分档结果。与 amap-loader（取数）协作。
 *
 * 协作模块：
 *   - spotLayer.ts（用 Tier 给数据柱上色、按 value 算柱高）
 *   - amap-loader.ts（提供原始数值）
 *
 * ⚠️ 约定：数值用「分位点分档」而非线性映射，是为了让配色在一眼扫过时就能
 *   读出量级差异；分档颜色从深蓝插值到高值锚点色。
 */

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

/**
 * 外部没给数据时，按 adcode 生成确定性伪随机值，保证下钻后仍有内容可看。
 * 用 adcode 做种子（而非 Math.random），同一行政区每次下钻结果一致，便于核对。
 * @param adcode 行政区编码
 * @param level  层级（不同层级给不同的基准量级）
 */
export const syntheticCount = (adcode: number, level: GeoLevel | string): number => {
  // 经典整数哈希（murmur 风格），把 adcode 打散到均匀分布
  let hash = (adcode >>> 0) || 1
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507) >>> 0
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909) >>> 0
  hash ^= hash >>> 16
  // 层级越细，基准量级越小（区/县 < 市 < 省）
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
 *
 * @param values    当前层级全部数值
 * @param highColor 高值档锚点色（缺省 #5FC9EE）
 * @returns 4 档 Tier（max 升序，最后一档 max=Infinity 兜住所有更大值）
 */
export const buildTiers = (values: number[], highColor: string): Tier[] => {
  const anchor = new THREE.Color(highColor || '#5FC9EE')
  // 4 档插值比例：0.3 / 0.55 / 0.78 / 1.0（越高档越接近高值锚点色）
  const colors = [0.3, 0.55, 0.78, 1].map(
    (k) => `#${DEEP_COLOR.clone().lerp(anchor, k).getHexString()}`,
  )
  const sorted = [...values].sort((a, b) => a - b)
  // 分位 quantiles：25% / 50% / 78% 处取值作为档位上界
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

/**
 * 查数值所属档位下标（首个 max ≥ value 的档）。
 */
export const tierOf = (value: number, tiers: Tier[]): number => {
  for (let i = 0; i < tiers.length; i++) if (value <= tiers[i].max) return i
  return tiers.length - 1
};
