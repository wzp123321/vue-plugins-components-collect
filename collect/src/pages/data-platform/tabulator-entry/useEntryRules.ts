// 单元格校验引擎：必填 / 数值区间 / 长度 / 正则 / 列内唯一 / 跨列比较，并把错误画到表格上
// ============================================================================
// 本文件职责：
//   1. 按列定义（required / rules / cross）逐格校验整表，产出错误清单；
//   2. 把错误格标红（DOM class：cell-error），修复后清除标记；
//   3. 错误跳转（滚动到目标行 + 高亮）。
//
// 与 Univer 版的关系：校验逻辑（必填 / 数值 / 长度 / 正则 / 唯一 / 跨列）完全共用同一套口径，
// 仅"画到网格"这一步从「命令式 setBackground」改成「DOM class + reformat」，其余不变。
// ⚠️ 校验口径集中在 utils/bi-entry.ts 与 ./schema.ts，改这里等于改三套，务必与另两套保持一致。
// ============================================================================
import { computed, ref } from 'vue';
import type { ColDef, CrossRule, EntryRecord } from './schema';
import type { EntrySheet } from './useEntrySheet';

/** 空值判定：数值列空值取 null，其余取空串；三套录入台统一口径 */
const isBlank = (v: unknown): boolean => v === null || v === undefined || v === '';

/** 一条校验错误 */
export interface CellError {
  /** 数据行下标（0-based，与记录数组下标一致） */
  dataIndex: number;
  /** 展示用行号（1-based） */
  sheetRow: number;
  field: string;
  /** 网格列号 */
  colIndex: number;
  /** 列名 */
  label: string;
  /** 行的首列值，供错误清单定位 */
  rowLabel: string;
  msg: string;
}

/** 错误格底色（浅红）与字色——走 CSS class，见本页样式 */
const reCache = new Map<string, RegExp | null>();
/** 正则编译带缓存：同一列每次校验都 new RegExp 在大表逐格校验时开销可观 */
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

/** 跨列规则判定：返回错误消息（空串表示通过） */
const checkCross = (rec: EntryRecord, def: ColDef, value: unknown, labelOf: (f: string) => string): string => {
  const rules = def.cross;
  if (!rules?.length) return '';
  for (let i = 0; i < rules.length; i++) {
    const c: CrossRule = rules[i];
    const otherVal = rec[c.other];
    const otherLabel = labelOf(c.other);
    if (c.kind === 'requiredIf') {
      if (!isBlank(otherVal) && isBlank(value)) return c.msg || `${def.label}为必填（${otherLabel}已填）`;
    } else if (!isBlank(value) && !isBlank(otherVal)) {
      if (c.kind === 'eq') {
        if (String(value) !== String(otherVal)) return c.msg || `${def.label}需与${otherLabel}一致`;
      } else {
        const a = Number(value);
        const b = Number(otherVal);
        const numeric = !Number.isNaN(a) && !Number.isNaN(b) && String(value).trim() !== '' && String(otherVal).trim() !== '';
        const cmp = numeric ? a - b : String(value).localeCompare(String(otherVal));
        if (c.kind === 'gte' && cmp < 0) return c.msg || `${def.label}不能早于/小于${otherLabel}`;
        if (c.kind === 'lte' && cmp > 0) return c.msg || `${def.label}不能晚于/大于${otherLabel}`;
      }
    }
  }
  return '';
};

/**
 * 校验引擎：整表扫描 + 错误标红 + 跳转。
 * @param sheetApi useEntrySheet 的返回值（读写网格的唯一通道）
 */
export const useEntryRules = (sheetApi: EntrySheet) => {
  const errors = ref<CellError[]>([]);
  const errorCount = computed(() => errors.value.length);

  const labelOf = (defs: ColDef[], field: string): string => defs.find((d) => d.field === field)?.label ?? field;

  /** 整表校验：返回错误清单并写入响应式状态 */
  const validateAll = (defs: ColDef[]): CellError[] => {
    const records = sheetApi.readRecords();
    // 唯一性校验按列预建索引（值 → 出现次数），避免逐格去重退化成 O(n²)
    const dupMaps = new Map<string, Map<string, number>>();
    defs.forEach((d) => {
      if (!d.rules?.unique) return;
      const m = new Map<string, number>();
      records.forEach((rec) => {
        const v = rec[d.field];
        if (!isBlank(v)) {
          const k = String(v);
          m.set(k, (m.get(k) ?? 0) + 1);
        }
      });
      dupMaps.set(d.field, m);
    });

    const list: CellError[] = [];
    const firstField = defs[0]?.field;
    const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
    records.forEach((rec, dataIndex) => {
      const rowLabel = firstField ? String(rec[firstField] ?? '') : '';
      defs.forEach((d, colIndex) => {
        const value = rec[d.field];
        let msg = '';
        if (d.required && isBlank(value)) msg = `${d.label}必填`;
        else if (!isBlank(value)) {
          if (d.type === 'number') {
            const n = Number(value);
            if (Number.isNaN(n)) msg = `${d.label}需为数值`;
            else if (d.rules?.integer && !Number.isInteger(n)) msg = `${d.label}需为整数`;
            else if (d.rules?.min !== undefined && n < d.rules.min) msg = `${d.label}不能小于 ${d.rules.min}`;
            else if (d.rules?.max !== undefined && n > d.rules.max) msg = `${d.label}不能大于 ${d.rules.max}`;
          }
          if (!msg && d.type === 'date' && !DATE_PATTERN.test(String(value))) msg = `${d.label}格式应为 YYYY-MM-DD`;
          if (!msg && d.type === 'select' && d.options?.length && !d.options.includes(String(value))) {
            msg = `${d.label}「${String(value)}」不在可选项中`;
          }
          const s = String(value);
          if (!msg && d.rules?.minLen !== undefined && s.length < d.rules.minLen) msg = `${d.label}至少 ${d.rules.minLen} 个字符`;
          if (!msg && d.rules?.maxLen !== undefined && s.length > d.rules.maxLen) msg = `${d.label}最多 ${d.rules.maxLen} 个字符`;
          if (!msg && d.rules?.pattern) {
            const re = reOf(d.rules.pattern);
            if (re && !re.test(s)) msg = d.rules.patternMsg || `${d.label}格式不正确`;
          }
          if (!msg && d.rules?.unique) {
            const hit = dupMaps.get(d.field)?.get(s) ?? 0;
            if (hit > 1) msg = `${d.label}「${s}」重复`;
          }
          if (!msg) msg = checkCross(rec, d, value, (f) => labelOf(defs, f));
        }
        if (msg) {
          list.push({ dataIndex, sheetRow: dataIndex + 1, field: d.field, colIndex, label: d.label, rowLabel, msg });
        }
      });
    });
    errors.value = list;
    return list;
  };

  /** 把错误清单画到网格：先清旧标记，再按 "行下标:字段" 标红 */
  const markErrors = (list: CellError[]) => {
    sheetApi.markErrors(list.map((e) => ({ dataIndex: e.dataIndex, field: e.field })));
  };

  /** 清除所有错误标红（不改变错误清单） */
  const clearMarks = () => {
    sheetApi.markErrors([]);
  };

  /** 校验 + 标红一步到位（提交前 / 结构变更后调用） */
  const validateAndMark = (defs: ColDef[]): CellError[] => {
    const list = validateAll(defs);
    markErrors(list);
    return list;
  };

  /** 跳转到某条错误：滚动到目标行，让高亮进入视野 */
  const jumpTo = (err: CellError) => {
    sheetApi.scrollToRow(err.dataIndex);
  };

  return { errors, errorCount, validateAll, validateAndMark, markErrors, clearMarks, jumpTo };
};

export type EntryRules = ReturnType<typeof useEntryRules>;
