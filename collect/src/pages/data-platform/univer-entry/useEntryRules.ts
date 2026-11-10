// 单元格校验引擎：必填 / 数值区间 / 长度 / 正则 / 列内唯一 / 跨列比较，并把错误画到网格上
// ============================================================================
// 本文件职责：
//   1. 按列定义（ColDef.required / rules / cross）逐格校验，产出错误清单；
//   2. 给错误格标「红框 + 淡红底 + 红字」，修复后清除标记 —— Univer 的数据验证只在"录入瞬间"拦非法值，
//      管不到"导入/粘贴/批量填充/撤销"，故这层自研引擎不可省；
//   3. 错误跳转（滚动 + 激活目标格）。
//
// 在整体架构中的角色：对应 vxe 版的 useCellValidation。
//   与 vxe 版的差别：vxe 把错误存在 cellErrors（rowId + field 键）里供 cellClassName 读；
//   Univer 没有行列 DOM 可挂 class，只能把错误"画"进单元格样式。
//
// 关键约定：
//   - **行级口径**：一行只要有一个单元格有值，就校验整行；整行为空（还没开始填）一律不算错。
//     录入时按"变动的行"增量校验（revalidateRows），保存时按整表复核（validateAndMark），两者同一套规则；
//   - 空值一律跳过非必填规则（没填不该报"格式错"，只该由 required 报"必填"）；
//   - 唯一性校验需要全列计数：一次校验只建一次索引并复用，避免 O(n²)；
//   - 错误标记用「红框 + 淡红底 + 红字」：只描边在 Univer 里会被当前选区框盖掉（见 ERR_FILL 注释），
//     底色 + 字色在选区覆盖层之下仍可辨认，是常见录入表格的通行做法；
//   - 标记按行记账（markedByRow）：行级校验只复原自己那一行，别行的红框不动，避免整表重画闪烁。
// ============================================================================
import { computed, ref } from 'vue';
import {
  HEADER_ROW,
  DATE_PATTERN,
  displayTextOf,
  isBlank,
  rowIsEmpty,
  sigValueOf,
  type ColDef,
  type CrossRule,
  type EntryRecord,
} from './schema';
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
  /** 行的首列值，供定位 */
  rowLabel: string;
  msg: string;
}

/**
 * 错误格视觉：红框 + 淡红底（文字保持默认色）。
 *
 * 为什么不能只靠红框：Univer 的**当前选中格**会画一层 2px 蓝框 + 半透明蓝底，
 * 层级恒定高于单元格边框，错误格一旦被选中，红框就被整条盖掉（实测把线宽加到 2px 也压不过）。
 * 常见录入表格（vxe / AG Grid / 飞书多维表格）对校验失败格的处理都是「淡红底 + 红边」：
 * 底色在选区覆盖层之下依然可辨，边框负责非选中态的强调。
 * 文字**不染色**：Univer 暗色是整层反色实现的，浅红底会被翻成深红、红字会翻成青绿，
 * 两者叠在一起对比度反而更差；保持默认字色在明暗两套主题下都清晰。
 * 取值与全局 --bi-danger / --bi-danger-bg 同源。
 */
const ERR_BORDER_COLOR = '#f56c6c';
const ERR_FILL = '#fff1f0';
/**
 * BorderStyleTypes.MEDIUM = 2。
 * 用 2px 而不是 1px：非选中态下与表格网格线（1px 浅灰）区分更明显。
 */
const BORDER_MEDIUM = 2;

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

/** 唯一性索引：列 field → (值签名 → 出现次数) */
type DupMaps = Map<string, Map<string, number>>;

/**
 * 校验引擎：整表/单行校验 + 错误标红 + 跳转。
 * @param sheetApi useEntrySheet 的返回值（读写网格的唯一通道）
 */
export const useEntryRules = (sheetApi: EntrySheet) => {
  const errors = ref<CellError[]>([]);
  /** 网格行号 → 该行已描红的单元格 A1 地址（行级校验时只复原这一行） */
  const markedByRow = new Map<number, string[]>();
  const errorCount = computed(() => errors.value.length);

  const labelOf = (defs: ColDef[], field: string): string => defs.find((d) => d.field === field)?.label ?? field;

  /** 唯一性校验预建索引（值 → 出现次数），供 checkRow 复用 */
  const buildDupMaps = (defs: ColDef[], records: EntryRecord[]): DupMaps => {
    const dupMaps: DupMaps = new Map();
    defs.forEach((d) => {
      if (!d.rules?.unique) return;
      const m = new Map<string, number>();
      records.forEach((rec) => {
        const v = rec[d.field];
        // 院区值是对象，String(v) 会退化成 [object Object]，唯一性计数全串到同一格
        if (!isBlank(v)) {
          const k = sigValueOf(v);
          m.set(k, (m.get(k) ?? 0) + 1);
        }
      });
      dupMaps.set(d.field, m);
    });
    return dupMaps;
  };

  /** 单行逐列校验（纯计算，不碰网格） */
  const checkRow = (defs: ColDef[], rec: EntryRecord, dataIndex: number, dupMaps: DupMaps): CellError[] => {
    const list: CellError[] = [];
    const rowLabel = defs[0] ? displayTextOf(defs[0], rec[defs[0].field]) : '';
    defs.forEach((d, colIndex) => {
      const value = rec[d.field];
      let msg = '';
      if (d.required && isBlank(value)) msg = `${d.label}必填`;
      else if (!isBlank(value) && d.type === 'region') {
        // 院区值由选择弹框产生，只做「整列唯一」；长度/正则/跨列比较是文本规则，不适用
        if (d.rules?.unique) {
          const hit = dupMaps.get(d.field)?.get(sigValueOf(value)) ?? 0;
          if (hit > 1) msg = `${d.label}「${displayTextOf(d, value)}」重复`;
        }
      } else if (!isBlank(value)) {
        if (d.type === 'number') {
          const n = Number(value);
          if (Number.isNaN(n)) msg = `${d.label}需为数值`;
          // 整数规则：共享列配置抽屉里三种列类型都开放了这个开关，口径必须三套一致
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
    return list;
  };

  /** 清除某一行的红框/红底（只动 markedByRow 里记过的格） */
  const clearRowMarks = (sheetRow: number) => {
    const list = markedByRow.get(sheetRow);
    if (!list?.length) {
      markedByRow.delete(sheetRow);
      return;
    }
    const ws = sheetApi.sheet.value;
    if (ws) {
      list.forEach((a1) => {
        const r = ws.getRange(a1);
        r.setBorder('none', 0).setBackground(null);
      });
    }
    markedByRow.delete(sheetRow);
  };

  /** 清除所有错误边框（不改变错误清单） */
  const clearMarks = () => {
    [...markedByRow.keys()].forEach(clearRowMarks);
    markedByRow.clear();
  };

  /** 把错误逐格标成「红框 + 淡红底」并登记到 markedByRow（登记后才能被精确复原） */
  const paint = (list: CellError[]) => {
    const ws = sheetApi.sheet.value;
    if (!ws) return;
    list.forEach((e) => {
      const range = ws.getRange(e.sheetRow, e.colIndex);
      range.setBorder('all', BORDER_MEDIUM, ERR_BORDER_COLOR);
      range.setBackground(ERR_FILL);
      const arr = markedByRow.get(e.sheetRow) ?? [];
      arr.push(range.getA1Notation());
      markedByRow.set(e.sheetRow, arr);
    });
  };

  /** 整表校验：返回错误清单并写入响应式状态（不负责画到网格）；整行为空的行跳过 */
  const validateAll = (defs: ColDef[]): CellError[] => {
    const records = sheetApi.readRecords(defs);
    const dupMaps = buildDupMaps(defs, records);
    const list: CellError[] = [];
    records.forEach((rec, dataIndex) => {
      if (rowIsEmpty(defs, rec)) return;
      list.push(...checkRow(defs, rec, dataIndex, dupMaps));
    });
    errors.value = list;
    return list;
  };

  /** 清空并重画所有错误框（整表复核用） */
  const markErrors = (list: CellError[]) => {
    clearMarks();
    paint(list);
  };

  /** 校验 + 标红一步到位（保存前 / 结构变更后调用） */
  const validateAndMark = (defs: ColDef[]): CellError[] => {
    const list = validateAll(defs);
    markErrors(list);
    return list;
  };

  /**
   * 行级增量校验：只重算传入的数据行，红框也只动这些行。
   * 录入时由页面在"哪些行被改过"后调用（编辑 / 粘贴 / 填充 / 撤销都走这里）。
   * 行内没有任何值时视为还没开始填 —— 清掉该行残留红框，不产出错误。
   */
  const revalidateRows = (defs: ColDef[], dataIndexes: number[]): CellError[] => {
    if (!dataIndexes.length) return [];
    const records = sheetApi.readRecords(defs);
    const dupMaps = buildDupMaps(defs, records);
    const touched = new Set(dataIndexes);
    const next: CellError[] = [];
    dataIndexes.forEach((i) => {
      const rec = records[i];
      if (!rec || rowIsEmpty(defs, rec)) return;
      next.push(...checkRow(defs, rec, i, dupMaps));
    });
    // 这些行的旧错误作废，其它行保持不动
    errors.value = errors.value.filter((e) => !touched.has(e.dataIndex)).concat(next);
    // 重画：先复原被重算行的旧框，再画本轮错误
    dataIndexes.forEach((i) => clearRowMarks(HEADER_ROW + 1 + i));
    paint(next);
    return next;
  };

  /** 跳转到某条错误：激活该格（Univer 会自动滚动到可视区） */
  const jumpTo = (err: CellError) => {
    const ws = sheetApi.sheet.value;
    if (!ws) return;
    ws.getRange(err.sheetRow, err.colIndex).activate();
  };

  return { errors, errorCount, validateAll, validateAndMark, markErrors, clearMarks, revalidateRows, jumpTo };
};

export type EntryRules = ReturnType<typeof useEntryRules>;
