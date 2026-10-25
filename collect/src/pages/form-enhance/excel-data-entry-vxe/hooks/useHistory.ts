// 撤销 / 重做：混合栈（字段级增量命令 + 结构性全量快照），上限 40 步
// 设计要点：
// - 高频操作（编辑单元格 / 各类填充 / 批量填充 / 替换 / 清空内容）只记"哪个行哪个字段 before→after"，
//   不再为每一步拷贝整表；10 万行下每步只有几条到几千条记录。
// - 结构性操作（增删行、加删列、套模板、导入、生成数据、清空）变更面太大，仍用全量快照，代价可接受。
// - 两类条目在同一栈里按顺序撤销/重做：增量命令对称（undo 应用 before、redo 应用 after），
//   全量快照在 undo 时把"当前态"压入 redo 栈，与旧实现一致。
// 经注入 snapshotNow / applySnapshot / getRows / revalidateAll 与 core 解环：本层只管栈与记录，
// 状态的实际读写由 core 执行。
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { rowIdOf } from './useGridCore';
import type { Row, Snap } from '../types';

/** 字段级变更：撤销写 before，重做写 after */
export interface CellChange {
  rowId: string;
  field: string;
  before: any;
  after: any;
}

/** 增量命令 */
export interface CellPatch {
  kind: 'cells';
  label: string;
  changes: CellChange[];
}

/** 栈内条目：结构性快照 或 字段级增量 */
type HistoryEntry = { kind: 'snap'; label: string; snap: Snap } | CellPatch;

const MAX_STEPS = 40;

/**
 * 撤销 / 重做：字段级增量 + 结构性快照的混合栈（上限 40 步）。
 *
 * 在整体架构中的角色：本层只管"栈"本身，经注入的读写函数与 core 解环。
 * 调用约定：
 *   - 只改已有行若干字段 → `pushCells(label, changes)`（由 core.commitCells 生成 diff）；
 *   - 增删行/列、整表替换 → `pushSnapshot(snapshotNow())`。
 *
 * @param deps snapshotNow 取全量快照 / applySnapshot 把全量快照落回 core /
 *             getRows 取当前行数组（增量命令按 rowId 定位行）/ revalidateAll 应用后重校
 */
export const useHistory = (deps: {
  snapshotNow: () => Snap;
  applySnapshot: (snap: Snap) => void;
  getRows: () => Row[];
  revalidateAll: () => void;
  /** 增量应用后推进数据版本（统计缓存失效 / 色阶重算） */
  bumpData: () => void;
}) => {
  const { snapshotNow, applySnapshot, getRows, revalidateAll, bumpData } = deps;
  const stack = { undo: [] as HistoryEntry[], redo: [] as HistoryEntry[] };
  const canUndo = ref(false);
  const canRedo = ref(false);
  const syncHistoryFlags = () => {
    canUndo.value = stack.undo.length > 0;
    canRedo.value = stack.redo.length > 0;
  };
  const push = (entry: HistoryEntry) => {
    stack.undo.push(entry);
    if (stack.undo.length > MAX_STEPS) stack.undo.shift();
    stack.redo.length = 0;
    syncHistoryFlags();
  };

  /** 把全量快照压入撤销栈（结构性操作前调用），并清空重做栈（新的操作分支） */
  const pushSnapshot = (snap: Snap) => push({ kind: 'snap', label: '结构变更', snap });

  /**
   * 把字段级增量命令压入撤销栈（由 core.commitCells 在写入后调用）。
   * @param label   操作名，用于撤销提示
   * @param changes 逐格 before/after
   */
  const pushCells = (label: string, changes: CellChange[]) => {
    if (!changes.length) return;
    push({ kind: 'cells', label, changes });
  };

  /**
   * 应用增量命令：按 rowId 建一次索引后 O(1) 定位（changes 可能几千条，不能逐条 find）。
   * 行已被删除时跳过（防御：增量命令与结构变更交错撤销时的残留）。
   */
  const applyPatch = (patch: CellPatch, dir: 'before' | 'after') => {
    const rowMap = new Map(getRows().map((r) => [rowIdOf(r), r]));
    patch.changes.forEach((c) => {
      const row = rowMap.get(c.rowId);
      // 行已被删除时跳过（防御：增量命令与结构变更交错撤销时的残留）
      if (row) row[c.field] = dir === 'before' ? c.before : c.after;
    });
    revalidateAll();
    bumpData();
  };

  /**
   * 撤销：弹出栈顶。
   * - 增量命令：反向应用 before，并把同一条目压入 redo（命令对称）；
   * - 全量快照：把"当前态"压入 redo，再应用快照。
   */
  const undo = () => {
    const entry = stack.undo.pop();
    if (!entry) return;
    if (entry.kind === 'cells') {
      applyPatch(entry, 'before');
      stack.redo.push(entry);
      ElMessage.success(`已撤销：${entry.label}`);
    } else {
      stack.redo.push({ kind: 'snap', label: entry.label, snap: snapshotNow() });
      applySnapshot(entry.snap);
      ElMessage.success('已撤销');
    }
    syncHistoryFlags();
  };

  /**
   * 重做：弹出 redo 栈顶。
   * - 增量命令：正向应用 after，并把同一条目压回 undo；
   * - 全量快照：把"当前态"压入 undo，再应用快照。
   */
  const redo = () => {
    const entry = stack.redo.pop();
    if (!entry) return;
    if (entry.kind === 'cells') {
      applyPatch(entry, 'after');
      stack.undo.push(entry);
      ElMessage.success(`已重做：${entry.label}`);
    } else {
      stack.undo.push({ kind: 'snap', label: entry.label, snap: snapshotNow() });
      applySnapshot(entry.snap);
      ElMessage.success('已重做');
    }
    syncHistoryFlags();
  };

  return { canUndo, canRedo, pushSnapshot, pushCells, undo, redo };
}

/**
 * useHistory 的返回类型别名：导出 { canUndo, canRedo, pushSnapshot, pushCells, undo, redo }，
 * 供 core.commitCells、工具栏撤销/重做按钮与各结构性操作入栈调用。
 */
export type GridHistory = ReturnType<typeof useHistory>;
