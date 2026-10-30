// 单元格校验引擎：必填 / 数值区间 / 长度 / 正则 / 列内唯一 / 跨列比较，并把错误画到网格上
// ============================================================================
// 本文件职责：
//   1. 按列定义（ColDef.required / rules / cross）逐格校验整表，产出错误清单；
//   2. 把错误格标红（背景 + 字色），修复后清除标记 —— Univer 的数据验证只在"录入瞬间"拦非法值，
//      管不到"导入/粘贴/批量填充"以及"整表提交前复检"，故这层自研引擎不可省；
//   3. 错误跳转（滚动 + 激活目标格 + 高亮）。
//
// 在整体架构中的角色：对应 vxe 版的 useCellValidation。
//   与 vxe 版的差别：vxe 把错误存在 cellErrors（rowId + field 键）里供 cellClassName 读；
//   Univer 没有行列 DOM 可挂 class，只能把错误"画"进单元格样式，并另存一份清单给校验抽屉。
//
// 关键约定：
//   - 空值一律跳过非必填规则（没填不该报"格式错"，只该由 required 报"必填"）；
//   - 唯一性校验需要全列计数：整表校验时按列预建一次索引并复用，避免 O(n²)；
//   - 标红只改背景/字色，不改值；清除时逐格 setBackground(null) 复原，不会污染用户设置的其他格式。
// ============================================================================
import { computed, ref } from 'vue';
import { HEADER_ROW, DATE_PATTERN, isBlank, type ColDef, type CrossRule, type EntryRecord } from './schema';
import type { EntrySheet } from './useEntrySheet';

/** 一条校验错误 */
export interface CellError {
  /** 数据行下标（0-based，非网格行号） */
  dataIndex: number;
  /** 网格行号（含表头偏移） */
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

/** 错误格底色（浅红）与字色 */
const ERR_BG = '#ffe6e6';
const ERR_FG = '#d93025';

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
  /** 已标红的单元格 A1 地址，清除时按此逐个复原 */
  const marked = new Set<string>();
  const errorCount = computed(() => errors.value.length);

  const labelOf = (defs: ColDef[], field: string): string => defs.find((d) => d.field === field)?.label ?? field;

  /** 整表校验：返回错误清单并写入响应式状态（不负责画到网格） */
  const validateAll = (defs: ColDef[]): CellError[] => {
    const records = sheetApi.readRecords(defs);
    // 唯一性校验按列预建索引（值 → 出现次数），避免逐格 buildDup 退化成 O(n²)
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
          list.push({
            dataIndex,
            sheetRow: HEADER_ROW + 1 + dataIndex,
            field: d.field,
            colIndex,
            label: d.label,
            rowLabel,
            msg,
          });
        }
      });
    });
    errors.value = list;
    return list;
  };

  /** 清除所有错误标红（不改变错误清单） */
  const clearMarks = () => {
    const ws = sheetApi.sheet.value;
    if (ws) {
      marked.forEach((a1) => {
        const range = ws.getRange(a1);
        range.setBackground(null);
        range.setFontColor(null);
      });
    }
    marked.clear();
  };

  /** 把错误清单画到网格：先清旧标记，再逐格标红 */
  const markErrors = (list: CellError[]) => {
    const ws = sheetApi.sheet.value;
    if (!ws) return;
    clearMarks();
    list.forEach((e) => {
      const range = ws.getRange(e.sheetRow, e.colIndex);
      range.setBackground(ERR_BG);
      range.setFontColor(ERR_FG);
      marked.add(range.getA1Notation());
    });
  };

  /** 校验 + 标红一步到位（提交前 / 结构变更后调用） */
  const validateAndMark = (defs: ColDef[]): CellError[] => {
    const list = validateAll(defs);
    markErrors(list);
    return list;
  };

  /** 跳转到某条错误：激活该格（Univer 会自动滚动到可视区），并短暂放大选区以引起注意 */
  const jumpTo = (err: CellError) => {
    const ws = sheetApi.sheet.value;
    if (!ws) return;
    ws.getRange(err.sheetRow, err.colIndex).activate();
  };

  return { errors, errorCount, validateAll, validateAndMark, markErrors, clearMarks, jumpTo };
};

export type EntryRules = ReturnType<typeof useEntryRules>;
