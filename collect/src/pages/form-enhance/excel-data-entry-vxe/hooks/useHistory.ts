// 撤销 / 重做：行数据 + 列结构快照栈（上限 40 步）
// 经注入 snapshotNow / applySnapshot 与 core 解环：history 只管栈，状态应用由 core 执行
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { Snap } from '../types';

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
  const undo = () => {
    if (!stack.undo.length) return;
    const cur = snapshotNow();
    const prev = stack.undo.pop()!;
    stack.redo.push(cur);
    applySnapshot(prev);
    syncHistoryFlags();
    ElMessage.success('已撤销');
  };
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

export type GridHistory = ReturnType<typeof useHistory>;
