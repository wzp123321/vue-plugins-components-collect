// 数值聚合工具：录入台的列汇总、选区统计、当前列统计、条件格式色阶共用同一套口径
// 设计要点：
// - 空串 / null / 非数值一律跳过（不能把 '' 当 0、把 'abc' 当 NaN 算进求和）
// - 一次扫描算多列（列汇总/条件格式），避免"每列各扫一遍"
// - 结果统一保留 2 位小数，避免浮点尾数（0.1+0.2）出现在状态栏
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

const round2 = (n: number) => Number(n.toFixed(2));

/**
 * 取有效数值：空值与不可转数的值返回 null。
 * 集中在这里判断，避免各处重复写 `v !== null && v !== '' && !isNaN(Number(v))`（原来有 6 处）。
 */
export const numOf = (v: any): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

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
 * 一次扫描算出多列聚合（列汇总行、条件格式色阶用）。
 * @param rows   数据行
 * @param fields 参与聚合的字段（调用方保证都是数值列）
 * @returns field → 聚合结果；某列无有效值时该 field 不出现
 */
export const aggregateByField = (rows: readonly Row[], fields: readonly string[]): Record<string, NumAgg> => {
  const accs: Record<string, Acc> = {};
  fields.forEach((f) => { accs[f] = newAcc(); });
  rows.forEach((r) => {
    fields.forEach((f) => {
      const n = numOf(r[f]);
      if (n !== null) addToAcc(accs[f], n);
    });
  });
  const out: Record<string, NumAgg> = {};
  fields.forEach((f) => {
    const agg = finishAcc(accs[f]);
    if (agg) out[f] = agg;
  });
  return out;
};

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

/** 单列聚合（当前列状态栏统计），无有效值返回 null */
export const aggregateColumn = (rows: readonly Row[], field: string): NumAgg | null => {
  const acc = newAcc();
  rows.forEach((r) => {
    const n = numOf(r[field]);
    if (n !== null) addToAcc(acc, n);
  });
  return finishAcc(acc);
};
