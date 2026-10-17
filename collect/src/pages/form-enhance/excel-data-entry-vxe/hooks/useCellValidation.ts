// 单元格校验：规则全部来自列定义（ColDef.required / rules / cross），本层只负责执行与汇总。
// 支持：必填 / 数值区间 / 长度 / 正则 / 列内唯一 / 跨列（≥、≤、=、条件必填）。
// 设计要点：
// - 空值一律跳过非必填规则（没填不该报"格式错"，只该由 required 报"必填"）
// - errKey 形如 `${rowId}__${field}`，rowId 由 uid() 生成、只含 URI 安全字符，故可用 __ 拼接
// - 唯一性校验需要全列计数：单格校验时按需建一次该列索引；revalidateAll 时按列预建并复用，
//   避免 1 万行 × 1 万格退化成 O(n²)
import { reactive, computed } from 'vue';
import type { ColDef, Row, CrossRule } from '../types';

/** 列内值计数索引（值 → 出现次数），仅供 unique 规则使用 */
type DupMap = Map<string, number>;

const isEmpty = (v: any) => v === null || v === undefined || v === '';

// 正则编译带缓存：同一列每次校验都 new RegExp 在大表逐格校验时开销可观
const reCache = new Map<string, RegExp | null>();
const reOf = (src: string): RegExp | null => {
  if (reCache.has(src)) return reCache.get(src) ?? null;
  let re: RegExp | null = null;
  try {
    re = new RegExp(src);
  } catch {
    re = null;
  }
  reCache.set(src, re);
  return re;
};

const NO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function useCellValidation(deps: {
  getColumnDefs: () => ColDef[];
  getRows: () => Row[];
  labelOf: (field: string) => string;
  firstVisibleField: () => string | undefined;
}) {
  const { getColumnDefs, getRows, labelOf, firstVisibleField } = deps;
  const cellErrors = reactive<Record<string, string>>({});
  const errKey = (rowId: string, field: string) => `${rowId}__${field}`;

  /** 建立某列的值计数索引（只统计非空值） */
  const buildDupMap = (field: string): DupMap => {
    const m: DupMap = new Map();
    for (const r of getRows()) {
      const v = r[field];
      if (isEmpty(v)) continue;
      const k = String(v);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  };

  /** 跨列规则判定：返回错误消息（空串表示通过） */
  const checkCross = (row: Row, def: ColDef, value: any): string => {
    const rules = def.cross;
    if (!rules?.length) return '';
    for (const c of rules as CrossRule[]) {
      const otherVal = row[c.other];
      const otherLabel = labelOf(c.other);
      if (c.kind === 'requiredIf') {
        if (!isEmpty(otherVal) && isEmpty(value)) return c.msg || `${def.label}为必填（${otherLabel}已填）`;
        continue;
      }
      // 其余三种都是二元比较：任一为空则跳过（空值的合法性由 required 负责）
      if (isEmpty(value) || isEmpty(otherVal)) continue;
      if (c.kind === 'eq') {
        if (String(value) !== String(otherVal)) return c.msg || `${def.label}需与${otherLabel}一致`;
        continue;
      }
      // 数字优先按数值比，其余按字符串比（YYYY-MM-DD 可直接比较）
      const a = Number(value);
      const b = Number(otherVal);
      const numeric = !isNaN(a) && !isNaN(b) && String(value).trim() !== '' && String(otherVal).trim() !== '';
      const cmp = numeric ? a - b : String(value).localeCompare(String(otherVal));
      if (c.kind === 'gte' && cmp < 0) return c.msg || `${def.label}不能早于/小于${otherLabel}`;
      if (c.kind === 'lte' && cmp > 0) return c.msg || `${def.label}不能晚于/大于${otherLabel}`;
    }
    return '';
  };

  /**
   * 校验单格：执行完整规则链并写/清错误表。
   * ctx.dup 供 revalidateAll 复用同一次建好的列索引；不传则按需建（单格编辑路径）。
   */
  const validateCell = (row: Row, field: string, ctx?: { dup?: Map<string, DupMap> }) => {
    const key = errKey(row.__id, field);
    const def = getColumnDefs().find((d) => d.field === field);
    if (!def) {
      delete cellErrors[key];
      return;
    }
    const value = row[field];
    const msg = ((): string => {
      if (def.required && isEmpty(value)) return `${def.label}必填`;
      if (isEmpty(value)) return '';
      const rules = def.rules;
      if (def.type === 'number') {
        const n = Number(value);
        if (isNaN(n)) return `${def.label}需为数值`;
        if (rules?.min !== undefined && n < rules.min) return `${def.label}不能小于 ${rules.min}`;
        if (rules?.max !== undefined && n > rules.max) return `${def.label}不能大于 ${rules.max}`;
      }
      if (def.type === 'date' && !NO_DATE.test(String(value))) return `${def.label}格式应为 YYYY-MM-DD`;
      const s = String(value);
      if (rules?.minLen !== undefined && s.length < rules.minLen) return `${def.label}至少 ${rules.minLen} 个字符`;
      if (rules?.maxLen !== undefined && s.length > rules.maxLen) return `${def.label}最多 ${rules.maxLen} 个字符`;
      if (rules?.pattern) {
        const re = reOf(rules.pattern);
        if (re && !re.test(s)) return rules.patternMsg || `${def.label}格式不正确`;
      }
      if (rules?.unique) {
        const map = ctx?.dup?.get(field) ?? buildDupMap(field);
        if ((map.get(String(value)) ?? 0) > 1) return `${def.label}「${s}」重复`;
      }
      return checkCross(row, def, value);
    })();
    if (msg) cellErrors[key] = msg;
    else delete cellErrors[key];
  };

  /** 全量重校：清空错误表后按当前列结构逐行逐格校验（列结构变更/撤销恢复后调用） */
  const revalidateAll = () => {
    for (const k of Object.keys(cellErrors)) delete cellErrors[k];
    const defs = getColumnDefs();
    // 只为配了 unique 的列建索引：revalidateAll 是提交前/结构变更时调用，必须避免 O(n²)
    const dup = new Map<string, DupMap>();
    for (const d of defs) if (d.rules?.unique) dup.set(d.field, buildDupMap(d.field));
    const ctx = { dup };
    for (const r of getRows()) for (const d of defs) validateCell(r, d.field, ctx);
  };

  // 单行全字段校验：新增/插入/复制行后立即标红必填缺失（与编辑态校验同一套规则）
  const validateRow = (row: Row) => {
    const defs = getColumnDefs();
    const dup = new Map<string, DupMap>();
    for (const d of defs) if (d.rules?.unique) dup.set(d.field, buildDupMap(d.field));
    for (const d of defs) validateCell(row, d.field, { dup });
  };

  /** 直接写入一条错误（服务端校验回填用）：不参与规则计算，只污染错误表 */
  const setCellError = (rowId: string, field: string, msg: string) => {
    cellErrors[errKey(rowId, field)] = msg;
  };

  const errorCount = computed(() => Object.keys(cellErrors).length);
  const errorList = computed(() =>
    Object.entries(cellErrors).map(([k, msg]) => {
      const [rowId, field] = k.split('__');
      const row = getRows().find((r) => r.__id === rowId);
      return {
        rowId,
        field,
        msg,
        rowLabel: row ? String(row[firstVisibleField() ?? 'name'] ?? '') : '?',
        colLabel: labelOf(field),
      };
    }),
  );

  return { cellErrors, errKey, validateCell, validateRow, revalidateAll, setCellError, errorCount, errorList };
}

export type CellValidation = ReturnType<typeof useCellValidation>;
