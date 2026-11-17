// 数值聚合工具：选区统计共用的一套口径（对齐 Univer 的状态栏选区聚合）
// 设计要点：
// - 空串 / null / 非数值一律跳过（不能把 '' 当 0、把 'abc' 当 NaN 算进求和）
// - 结果统一保留 2 位小数，避免浮点尾数（0.1+0.2）出现在状态栏
import { numOf, round2 } from '@/utils/bi-entry';
import type { Row } from '../types';

export interface NumAgg {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}

/** 累加器（未收尾），min/max 用 ±Infinity 起步 */
export interface Acc {
  count: number;
  sum: number;
  min: number;
  max: number;
}

// round2 / numOf 来自 utils/bi-entry.ts（三套录入台共用），这里不再自造，避免口径漂移。

export const newAcc = (): Acc => ({ count: 0, sum: 0, min: Infinity, max: -Infinity });

export const addToAcc = (a: Acc, n: number) => {
  a.count++;
  a.sum += n;
  if (n < a.min) a.min = n;
  if (n > a.max) a.max = n;
};

/** 收尾：无有效值时返回 null（调用方据此显示空而不是 0） */
export const finishAcc = (a: Acc): NumAgg | null =>
  a.count ? { count: a.count, sum: round2(a.sum), avg: round2(a.sum / a.count), min: a.min, max: a.max } : null;

/**
 * 把多列合并成一个总聚合（选区统计用：栅格区域内所有数值格一起算）。
 * @param rows   选区内行
 * @param fields 选区内字段（调用方保证都是数值列）
 */
export const aggregateCells = (rows: readonly Row[], fields: readonly string[]): NumAgg | null => {
  const acc = newAcc();
  rows.forEach((r) => {
    fields.forEach((f) => {
      const n = numOf(r[f]);
      if (n !== null) addToAcc(acc, n);
    });
  });
  return finishAcc(acc);
};
