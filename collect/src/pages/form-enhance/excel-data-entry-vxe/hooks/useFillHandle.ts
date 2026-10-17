// 拖拽填充手柄：锚点定位 / 手柄显隐 / 拖拽纵向填充（方向感知）
// 与快捷键填充互补：Ctrl+D = 选区内向下填充，Ctrl+Enter = 整区填当前格值，
// 本手柄 = 把选区首/末行的值拖写到选区之外的新行（Excel 填充柄语义）
import { reactive, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { GridCore } from './useGridCore';
import type { CellSelection } from './useCellSelection';

export function useFillHandle(
  core: GridCore,
  tableRef: Ref<any>,
  sel: CellSelection,
  gridBox: Ref<HTMLElement | undefined>,
) {
  const snap = () => core.pushSnapshot(core.snapshotNow());

  // ===================== 手柄定位 =====================
  // 锚点格 = 矩形选区的右下角（末行 × 末列），与 Excel 一致——早期锚在 focus 端，
  // 从左上往右下框选时手柄位置才对，反向框选（focus 落在左上）手柄会跑到左上角。
  // 注意不能用 vxe 的 getActiveCell——mouse-config.selected 关闭后它只在编辑期有值。
  const fillAnchor = (): { row: any; field: string } | null => {
    const rect = sel.selRect.value;
    if (rect) {
      const rows = core.processedRows.value.filter((r) => rect.rowIds.has(r.__id));
      const field = rect.fields[rect.fields.length - 1];
      const row = rows[rows.length - 1];
      if (row && field) return { row, field };
    }
    return core.currentCell.value;
  };
  const fillHandle = reactive({ show: false, style: { top: '0px', left: '0px' } });
  /** 拖拽填充预览的闪烁格集合（与 core.flashKeys 单格跳转闪烁相互独立，由 cellClassName 合并读取） */
  const flashKeys = ref<Set<string>>(new Set());
  const hideFillHandle = () => {
    fillHandle.show = false;
  };
  const refreshFillHandle = () => {
    const ac = fillAnchor();
    if (!ac?.row || !ac?.field) {
      fillHandle.show = false;
      return;
    }
    const column = tableRef.value?.getColumnByField?.(ac.field);
    const cellEl = column ? tableRef.value?.getCellElement?.(ac.row, column) : null;
    const box = gridBox.value;
    if (!cellEl || !box) {
      fillHandle.show = false;
      return;
    }
    const cr = cellEl.getBoundingClientRect();
    const br = box.getBoundingClientRect();
    fillHandle.style.top = `${cr.bottom - br.top - 5}px`;
    fillHandle.style.left = `${cr.right - br.left - 5}px`;
    fillHandle.show = true;
  };
  // 当前格移动 / 选区变化时手柄跟随（selRect 覆盖 anchor/focus 的任何变化，含 Ctrl+A 与序号选行）
  watch(
    () => [core.currentCell.value, sel.selRect.value],
    () => refreshFillHandle(),
  );

  // ===================== 拖拽填充 =====================
  /** 按下填充柄开始拖拽：纵向（上/下）把源行值复制到目标行，拖拽过程闪烁预览目标区 */
  const startFill = () => {
    const anchor = fillAnchor();
    if (!anchor?.row || !anchor?.field) return;
    const srcField = anchor.field;
    const rows = core.processedRows.value;
    const srcIdx = rows.findIndex((r) => r.__id === anchor.row.__id);
    if (srcIdx < 0) return;
    // 选区的首/末行（rowIds 插入序即行序）：决定方向感知的填充源与填充范围。
    // 无选区（塌缩为单格）时首末同为锚点行，逻辑退化为单格向上/下填充
    const rect = sel.selRect.value;
    const rectIds = rect ? Array.from(rect.rowIds) : [anchor.row.__id];
    const topIdx = rows.findIndex((r) => r.__id === rectIds[0]);
    const bottomIdx = rows.findIndex((r) => r.__id === rectIds[rectIds.length - 1]);
    if (topIdx < 0 || bottomIdx < 0) return;
    // 目标行 → 实际填充范围（仅覆盖原选区之外的新行，与 Excel 一致）：
    // 向下拖 = 手柄行之下至目标行；向上拖 = 目标行至首行之上；落在原选区内则不填充
    const fillRange = (tIdx: number): [number, number] | null => {
      if (tIdx > bottomIdx) return [bottomIdx + 1, tIdx];
      if (tIdx < topIdx) return [tIdx, topIdx - 1];
      return null;
    };
    const rowIdxFromPoint = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      const rowid = el?.closest('.vxe-body--row')?.getAttribute('rowid');
      if (!rowid) return -1;
      return rows.findIndex((r) => r.__id === rowid);
    };
    let filling = false;
    const move = (ev: PointerEvent) => {
      const tIdx = rowIdxFromPoint(ev.clientX, ev.clientY);
      const range = tIdx >= 0 ? fillRange(tIdx) : null;
      if (!range) {
        flashKeys.value = new Set();
        return;
      }
      const keys = new Set<string>();
      for (let i = range[0]; i <= range[1]; i++) {
        const r = rows[i];
        if (r) keys.add(core.errKey(r.__id, srcField));
      }
      flashKeys.value = keys;
    };
    const up = (ev: PointerEvent) => {
      if (!filling) return;
      filling = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const tIdx = rowIdxFromPoint(ev.clientX, ev.clientY);
      const range = tIdx >= 0 ? fillRange(tIdx) : null;
      if (!range) {
        flashKeys.value = new Set();
        return;
      }
      // 方向感知的填充源（Excel 语义）：向下拖取选区末行（手柄行）的值，向上拖取首行的值
      const down = tIdx > bottomIdx;
      const srcRow = rows[down ? bottomIdx : topIdx];
      const srcVal = srcRow[srcField];
      snap();
      let n = 0;
      for (let i = range[0]; i <= range[1]; i++) {
        const r = rows[i];
        if (!r) continue;
        r[srcField] = srcVal;
        r.__dirty = true;
        core.validateCell(r, srcField);
        n++;
      }
      ElMessage.success(n ? `已向${down ? '下' : '上'}填充 ${n} 行` : '没有可填充的行');
      setTimeout(() => (flashKeys.value = new Set()), 600);
      refreshFillHandle();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return { fillHandle, flashKeys, hideFillHandle, refreshFillHandle, startFill };
}

export type GridFillHandle = ReturnType<typeof useFillHandle>;
