/**
 * BI 数据录入 —— 撤销 / 重做
 *
 * 混合栈，两类条目：
 *   - snap：结构性操作（增删行/导入/生成/列结构变更/模板应用）存全量快照（行 + 列）；
 *   - cells：单元格编辑 / 批量填充存字段级 before-after 增量，避免每次编辑都克隆十万行。
 *
 * ⚠️ 为什么单元格不存快照：10 万行 × 每次编辑克隆，会让编辑卡顿；增量只存被改的格子。
 * ⚠️ 行用 rowId 定位而不是下标：撤销期间可能已换序（排序是视图层，不落数据，但删除会移位）。
 */
import { computed, ref } from 'vue';
import { cloneRows, type BiCol, type BiRow } from './schema';

export interface CellPatch {
  rowId: string;
  field: string;
  before: unknown;
  after: unknown;
}

export type HistEntry =
  | { kind: 'snap'; label: string; rows: BiRow[]; cols: BiCol[] }
  | { kind: 'cells'; label: string; patches: CellPatch[] };

export interface HistoryDeps {
  getRows: () => BiRow[];
  setRows: (rows: BiRow[]) => void;
  getCols: () => BiCol[];
  setCols: (cols: BiCol[]) => void;
  /** 恢复完成后：刷新表格 + 重算校验与统计 */
  afterRestore: (label: string) => void;
}

export const useBiHistory = (deps: HistoryDeps, limit = 40) => {
  const undoStack = ref<HistEntry[]>([]);
  const redoStack = ref<HistEntry[]>([]);

  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);
  const undoLabel = computed(() => undoStack.value[undoStack.value.length - 1]?.label ?? '');
  const redoLabel = computed(() => redoStack.value[redoStack.value.length - 1]?.label ?? '');

  const push = (entry: HistEntry) => {
    undoStack.value = [...undoStack.value, entry].slice(-limit);
    redoStack.value = [];
  };

  /**
   * 结构性操作的用法：**改动前** `const before = snapshot('新增行')`，改动后 `pushSnapshot(before)`。
   * 之所以不在改动后自己拍快照：撤销要回到「改动前」，拍晚一步就撤不回去了。
   */
  const snapshot = (label: string): HistEntry => ({
    kind: 'snap',
    label,
    rows: cloneRows(deps.getRows()),
    cols: deps.getCols().map((c) => ({ ...c })),
  });

  const pushSnapshot = (entry: HistEntry) => {
    push(entry);
  };

  /** 单元格增量压栈 */
  const pushCells = (label: string, patches: CellPatch[]) => {
    if (!patches.length) {
      return;
    }
    push({ kind: 'cells', label, patches });
  };

  const applySnap = (entry: Extract<HistEntry, { kind: 'snap' }>) => {
    deps.setRows(cloneRows(entry.rows));
    deps.setCols(entry.cols.map((c) => ({ ...c })));
  };

  const applyCells = (entry: Extract<HistEntry, { kind: 'cells' }>, dir: 'undo' | 'redo') => {
    const rows = deps.getRows();
    const byId = new Map(rows.map((r) => [r.rowId, r]));
    entry.patches.forEach((p) => {
      const row = byId.get(p.rowId);
      if (row) {
        row[p.field] = dir === 'undo' ? p.before : p.after;
        row.changed = true;
      }
    });
    // 行对象是就地改的，数组引用没变 → 手动替换一次触发下游
    deps.setRows(rows.slice());
  };

  const undo = () => {
    const entry = undoStack.value[undoStack.value.length - 1];
    if (!entry) {
      return null;
    }
    undoStack.value = undoStack.value.slice(0, -1);
    if (entry.kind === 'snap') {
      applySnap(entry);
    } else {
      applyCells(entry, 'undo');
    }
    redoStack.value = [...redoStack.value, entry];
    deps.afterRestore(`撤销：${entry.label}`);
    return entry.label;
  };

  const redo = () => {
    const entry = redoStack.value[redoStack.value.length - 1];
    if (!entry) {
      return null;
    }
    redoStack.value = redoStack.value.slice(0, -1);
    if (entry.kind === 'snap') {
      applySnap(entry);
    } else {
      applyCells(entry, 'redo');
    }
    undoStack.value = [...undoStack.value, entry];
    deps.afterRestore(`重做：${entry.label}`);
    return entry.label;
  };

  const clear = () => {
    undoStack.value = [];
    redoStack.value = [];
  };

  return {
    undoStack,
    redoStack,
    canUndo,
    canRedo,
    undoLabel,
    redoLabel,
    snapshot,
    pushSnapshot,
    pushCells,
    undo,
    redo,
    clear,
  };
};

export type BiHistoryApi = ReturnType<typeof useBiHistory>;
