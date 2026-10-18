// 撤销 / 重做：行数据 + 列结构快照栈（上限 40 步）
// 经注入 snapshotNow / applySnapshot 与 core 解环：history 只管栈，状态应用由 core 执行
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { Snap } from '../types';

/**
 * 撤销 / 重做：行数据 + 列结构快照栈（上限 40 步）。
 *
 * 在整体架构中的角色：本层只管"栈"本身，经注入 snapshotNow / applySnapshot 与 core 解环——
 * history 把整体状态（行 + 列结构）当成一个不可变快照压栈/出栈，状态的实际应用由 core 执行。
 * 任何会改数据的 mutating 操作前都应先 `core.pushSnapshot(core.snapshotNow())`（即调用本层的 pushSnapshot）。
 *
 * @param deps snapshotNow 取全量快照、applySnapshot 把快照落回 core（含重校）
 */
export function useHistory(deps: { snapshotNow: () => Snap; applySnapshot: (snap: Snap) => void }) {
  const { snapshotNow, applySnapshot } = deps;
  const stack = { undo: [] as Snap[], redo: [] as Snap[] };
  const canUndo = ref(false);
  const canRedo = ref(false);
  const syncHistoryFlags = () => {
    canUndo.value = stack.undo.length > 0;
    canRedo.value = stack.redo.length > 0;
  };

  /** 把快照压入撤销栈（上限 40 步），并清空重做栈（新的操作分支） */
  const pushSnapshot = (snap: Snap) => {
    stack.undo.push(snap);
    if (stack.undo.length > 40) stack.undo.shift();
    stack.redo.length = 0;
    syncHistoryFlags();
  };
  /** 单元格编辑专用：快照整体为「新值」，仅把编辑格回填为旧值，撤销即回到编辑前 */
  const pushHistoryWithRevert = (rowId: string, field: string, oldVal: any) => {
    const snap = snapshotNow();
    const snapRow = snap.rows.find((r) => r.__id === rowId);
    if (snapRow) snapRow[field] = oldVal;
    pushSnapshot(snap);
  };
  /**
   * 撤销：弹出 undo 栈顶快照，把"当前态"压入 redo 栈，再把取出的快照 apply 回去。
   * 新操作分支会清空 redo 栈（见 pushSnapshot），保证 redo 只跟在当前 undo 之后。
   */
  const undo = () => {
    if (!stack.undo.length) return;
    const cur = snapshotNow();
    const prev = stack.undo.pop()!;
    stack.redo.push(cur);
    applySnapshot(prev);
    syncHistoryFlags();
    ElMessage.success('已撤销');
  };
  /**
   * 重做：弹出 redo 栈顶快照，把"当前态"压回 undo 栈，再把取出的快照 apply 回去。
   * 仅当 redo 栈非空时有效（undo 后的新操作会清空 redo 栈）。
   */
  const redo = () => {
    if (!stack.redo.length) return;
    const cur = snapshotNow();
    const next = stack.redo.pop()!;
    stack.undo.push(cur);
    applySnapshot(next);
    syncHistoryFlags();
    ElMessage.success('已重做');
  };

  return { canUndo, canRedo, pushSnapshot, pushHistoryWithRevert, undo, redo };
}

/**
 * useHistory 的返回类型别名：导出 { canUndo, canRedo, pushSnapshot, pushHistoryWithRevert,
 * undo, redo }，供工具栏的撤销/重做按钮与各处写数据前入栈调用。
 */
export type GridHistory = ReturnType<typeof useHistory>;
