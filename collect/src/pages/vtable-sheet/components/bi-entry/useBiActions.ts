/**
 * BI 数据录入 —— 行/列操作与填充（业务动作层）
 *
 * 覆盖：新增 / 插入 / 删除选中 / 复制选中 / 删除空行 / 去重 / 清空、
 *      批量填充与清空列、**Excel 式序列填充**（数字等差、日期按天递推、其余循环复制）、
 *      预制演示数据、压测数据、提交（mock 服务端校验）。
 *
 * 设计要点：
 *   1) 所有结构性动作都「先拍快照 → 再改 → afterStructure」，保证可撤销；
 *   2) 批量单元格写回走增量栈（pushCells），撤销只回滚被改的格子；
 *   3) 改数据一律替换 records 数组（shallowRef），由上层 watch 同步给 VTable。
 */
import type { ComputedRef, Ref, ShallowRef } from 'vue';
import {
  cloneRows,
  emptyValueFor,
  formatDate,
  makeEmptyRow,
  numOf,
  rowIsEmpty,
  rowSignature,
  type BiCol,
  type BiRow,
  type ColType,
} from './schema';
import type { CellPatch, BiHistoryApi } from './useBiHistory';
import type { BiQueryApi } from './useBiQuery';
import type { BiValidationApi } from './useBiValidation';

export interface ActionDeps {
  rows: ShallowRef<BiRow[]>;
  cols: Ref<BiCol[]>;
  /** 参与业务操作的列（可见的业务列） */
  activeCols: ComputedRef<BiCol[]>;
  validation: BiValidationApi;
  history: BiHistoryApi;
  query: BiQueryApi;
  /** 结构变更后：刷新表格 + 重算统计（由页面实现） */
  afterStructure: (label: string) => void;
  /** 单元格批量改完后：刷新表格（不重算全量校验，调用方自己决定） */
  afterCells: () => void;
}

/** 序列填充：数字等差 / 日期按天 / 其余循环复制 */
export const buildSeries = (source: unknown[], count: number, type: ColType): unknown[] => {
  if (count <= 0) {
    return [];
  }
  const out: unknown[] = [];
  if (type === 'number') {
    const nums = source.map((v) => numOf(v));
    if (nums.every((n) => n !== null) && nums.length > 0) {
      const first = nums[0] as number;
      const last = nums[nums.length - 1] as number;
      const step = nums.length > 1 ? (last - first) / (nums.length - 1) : 1;
      for (let i = 1; i <= count; i += 1) {
        out.push(Number((last + step * i).toFixed(6)));
      }
      return out;
    }
    for (let i = 0; i < count; i += 1) {
      out.push(source[i % source.length] ?? null);
    }
    return out;
  }
  if (type === 'date') {
    const dates = source.map((v) => String(v ?? ''));
    const stamps = dates.map((d) => {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
      return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime() : NaN;
    });
    if (stamps.every((t) => !Number.isNaN(t)) && stamps.length > 0) {
      const first = stamps[0];
      const last = stamps[stamps.length - 1];
      const step = stamps.length > 1 ? (last - first) / (stamps.length - 1) : 86400000;
      for (let i = 1; i <= count; i += 1) {
        out.push(formatDate(new Date(last + step * i)));
      }
      return out;
    }
    for (let i = 0; i < count; i += 1) {
      out.push(dates[i % dates.length]);
    }
    return out;
  }
  for (let i = 0; i < count; i += 1) {
    out.push(source[i % source.length]);
  }
  return out;
};

/** 演示数据字典 */
const PRODUCTS: Record<string, string[]> = {
  食品: ['有机大米 5kg', '坚果礼盒', '食用油 5L', '面粉 10kg'],
  饮料: ['气泡水 24 瓶', '冷萃咖啡 12 罐', '鲜榨橙汁 6 瓶', '苏打水 24 罐'],
  日用: ['抽纸 30 包', '洗衣凝珠 60 颗', '垃圾袋 100 只', '牙膏套装'],
  数码: ['蓝牙耳机', '机械键盘', '移动电源 20000mAh', '显示器支架'],
  服饰: ['保暖内衣', '冲锋衣', '运动长裤', '羊毛围巾'],
};
const REGIONS_DICT = ['华东', '华南', '华北', '西南', '东北'];
const CATEGORY_DICT = ['食品', '饮料', '日用', '数码', '服饰'];
const OWNER_DICT = ['张伟', '李芳', '王敏', '刘洋', '陈磊'];

export const useBiActions = (deps: ActionDeps) => {
  const { rows, cols, activeCols, validation, history, query } = deps;

  /** 重排行号（1 起） */
  const renumber = (list: BiRow[]) => {
    list.forEach((r, i) => {
      r.rowNo = i + 1;
    });
  };

  const commitStructure = (before: ReturnType<BiHistoryApi['snapshot']>) => {
    // 结构变更后：行号重排 + 全量重算校验 + 通知页面刷新
    renumber(rows.value);
    history.pushSnapshot(before);
    deps.afterStructure(before.label);
  };

  const refreshCounts = () => {
    // 选中数 / 改动数由页面从 rows 直接算（这里不重复维护）
    deps.afterStructure('统计刷新');
  };

  // ============================ 行操作 ============================
  const addRow = () => {
    const before = history.snapshot('新增行');
    const row = makeEmptyRow(activeCols.value, rows.value.length + 1);
    rows.value = [...rows.value, row];
    commitStructure(before);
    return row;
  };

  /** 在指定行下方插入（index 为数据下标；缺省追加到末尾） */
  const insertRow = (index?: number) => {
    const before = history.snapshot('插入行');
    const at = index === undefined ? rows.value.length : Math.min(index + 1, rows.value.length);
    const row = makeEmptyRow(activeCols.value, at + 1);
    const next = rows.value.slice();
    next.splice(at, 0, row);
    rows.value = next;
    commitStructure(before);
    return row;
  };

  const deleteSelected = () => {
    const victims = rows.value.filter((r) => r.selected);
    if (!victims.length) {
      return 0;
    }
    const before = history.snapshot('删除选中行');
    rows.value = rows.value.filter((r) => !r.selected);
    commitStructure(before);
    return victims.length;
  };

  const duplicateSelected = () => {
    const victims = rows.value.filter((r) => r.selected);
    if (!victims.length) {
      return 0;
    }
    const before = history.snapshot('复制选中行');
    const copies = victims.map((r) => {
      const copy = makeEmptyRow(activeCols.value);
      activeCols.value.forEach((c) => {
        copy[c.field] = r[c.field];
      });
      copy.changed = true;
      return copy;
    });
    rows.value = [...rows.value, ...copies];
    commitStructure(before);
    return copies.length;
  };

  const removeEmptyRows = () => {
    const keep = rows.value.filter((r) => !rowIsEmpty(activeCols.value, r));
    const removed = rows.value.length - keep.length;
    if (!removed) {
      return 0;
    }
    const before = history.snapshot('删除空行');
    rows.value = keep;
    commitStructure(before);
    return removed;
  };

  const removeDuplicateRows = () => {
    const seen = new Set<string>();
    const keep: BiRow[] = [];
    rows.value.forEach((r) => {
      const sig = rowSignature(activeCols.value, r);
      if (!seen.has(sig)) {
        seen.add(sig);
        keep.push(r);
      }
    });
    const removed = rows.value.length - keep.length;
    if (!removed) {
      return 0;
    }
    const before = history.snapshot('去重');
    rows.value = keep;
    commitStructure(before);
    return removed;
  };

  const clearAll = () => {
    if (!rows.value.length) {
      return;
    }
    const before = history.snapshot('清空数据');
    rows.value = [];
    query.clearAllQuery();
    commitStructure(before);
  };

  // ============================ 批量填充 ============================
  /** 作用域：选区（框选）/ 当前结果（筛选后）/ 全部 */
  const scopeRows = (scope: 'selected' | 'result' | 'all', selectedIds?: Set<string>): BiRow[] => {
    if (scope === 'all') {
      return rows.value;
    }
    if (scope === 'result') {
      return query.processedRows.value;
    }
    const ids = selectedIds ?? new Set<string>();
    return rows.value.filter((r) => ids.has(r.rowId));
  };

  const batchFill = (field: string, value: unknown, scope: 'selected' | 'result' | 'all', selectedIds?: Set<string>) => {
    const targets = scopeRows(scope, selectedIds);
    if (!targets.length) {
      return 0;
    }
    const col = cols.value.find((c) => c.field === field);
    const patches: CellPatch[] = [];
    targets.forEach((r) => {
      const before = r[field];
      if (before === value) {
        return;
      }
      patches.push({ rowId: r.rowId, field, before, after: value });
      r[field] = value;
      r.changed = true;
    });
    if (!patches.length) {
      return 0;
    }
    history.pushCells(`批量填充「${col?.label ?? field}」`, patches);
    rows.value = rows.value.slice();
    validation.scanAll(rows.value);
    deps.afterCells();
    return patches.length;
  };

  const batchClearCol = (field: string, scope: 'selected' | 'result' | 'all', selectedIds?: Set<string>) => {
    const col = cols.value.find((c) => c.field === field);
    const empty = col ? emptyValueFor(col) : '';
    return batchFill(field, empty, scope, selectedIds);
  };

  // ============================ 序列填充（填充手柄 / Ctrl+D / Ctrl+R） ============================
  /**
   * 矩形区域填充：把 from 区域的值按序列补到 to 区域（to 与 from 在同一列/行方向相邻）。
   * sourceValues 由调用方按列/行抽好，这里只负责算序列并写回。
   */
  const fillLinear = (opts: {
    sourceRowIds: string[];
    targetRowIds: string[];
    fields: string[];
    direction: 'down' | 'up' | 'right' | 'left';
    label: string;
  }): number => {
    const { sourceRowIds, targetRowIds, fields, direction, label } = opts;
    if (!sourceRowIds.length || !targetRowIds.length) {
      return 0;
    }
    const byId = new Map(rows.value.map((r) => [r.rowId, r]));
    const sources = sourceRowIds.map((id) => byId.get(id)).filter((r): r is BiRow => Boolean(r));
    const targets = targetRowIds.map((id) => byId.get(id)).filter((r): r is BiRow => Boolean(r));
    if (!sources.length || !targets.length) {
      return 0;
    }
    const patches: CellPatch[] = [];
    fields.forEach((field) => {
      const col = cols.value.find((c) => c.field === field);
      if (!col) {
        return;
      }
      const srcValues = sources.map((r) => r[field]);
      const count = targets.length;
      let values: unknown[];
      if (direction === 'down' || direction === 'right') {
        values = buildSeries(srcValues, count, col.type);
      } else {
        // 向上/向左：把序列反过来算（以首值为基准倒推）
        values = buildSeries(srcValues.slice().reverse(), count, col.type).reverse();
      }
      targets.forEach((r, i) => {
        const before = r[field];
        const after = values[i];
        if (before === after) {
          return;
        }
        patches.push({ rowId: r.rowId, field, before, after });
        r[field] = after;
        r.changed = true;
      });
    });
    if (!patches.length) {
      return 0;
    }
    history.pushCells(label, patches);
    rows.value = rows.value.slice();
    validation.scanAll(rows.value);
    deps.afterCells();
    return patches.length;
  };

  // ============================ 演示 / 压测数据 ============================
  const randomRow = (i: number): BiRow => {
    const region = REGIONS_DICT[i % REGIONS_DICT.length];
    const category = CATEGORY_DICT[(i * 3) % CATEGORY_DICT.length];
    const products = PRODUCTS[category] ?? ['商品'];
    const sales = Math.round(2000 + ((i * 137) % 48000));
    const target = Math.round(sales * 0.85);
    const d = new Date(2026, 8, 1 + (i % 30));
    const row = makeEmptyRow(activeCols.value);
    row.region = region;
    row.category = category;
    row.product = products[i % products.length];
    row.owner = OWNER_DICT[i % OWNER_DICT.length];
    row.sales = sales;
    row.target = target;
    row.quantity = Math.round(20 + ((i * 17) % 480));
    row.rate = Math.round(60 + ((i * 7) % 50));
    row.date = formatDate(d);
    return row;
  };

  /** 预制演示数据：500 行，覆盖各种类型（vxe 页面的 presetData 等价物） */
  const presetData = (n = 500) => {
    const before = history.snapshot('预制数据');
    const list: BiRow[] = [];
    for (let i = 0; i < n; i += 1) {
      list.push(randomRow(i));
    }
    rows.value = list;
    commitStructure(before);
    return n;
  };

  /** 压测数据：纯数字生成，十万行一次 setRecords */
  const genData = (n: number) => {
    const before = history.snapshot(`生成 ${n} 行`);
    const list: BiRow[] = new Array(n);
    for (let i = 0; i < n; i += 1) {
      list[i] = randomRow(i);
    }
    rows.value = list;
    commitStructure(before);
    return n;
  };

  // ============================ 提交（mock 服务端校验） ============================
  const submit = (): { ok: boolean; errors: number } => {
    validation.serverMode.value = true;
    validation.scanAll(rows.value);
    const count = validation.errorCount.value;
    if (count > 0) {
      return { ok: false, errors: count };
    }
    // 提交成功后清改动标记（服务端已接收）
    rows.value.forEach((r) => {
      r.changed = false;
    });
    rows.value = rows.value.slice();
    refreshCounts();
    return { ok: true, errors: 0 };
  };

  return {
    renumber,
    addRow,
    insertRow,
    deleteSelected,
    duplicateSelected,
    removeEmptyRows,
    removeDuplicateRows,
    clearAll,
    batchFill,
    batchClearCol,
    fillLinear,
    presetData,
    genData,
    submit,
    randomRow,
    scopeRows,
    cloneRows,
  };
};

export type BiActionsApi = ReturnType<typeof useBiActions>;
