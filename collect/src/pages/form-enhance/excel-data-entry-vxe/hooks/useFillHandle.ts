// 拖拽填充手柄：锚点定位 / 手柄显隐 / 拖拽纵向填充（方向感知 + 序列填充）
// 与快捷键填充互补：Ctrl+D = 选区内向下填充，Ctrl+Enter = 整区填当前格值，
// 本手柄 = 把选区首/末行的值拖写到选区之外的新行（Excel 填充柄语义）。
// 序列填充：数字按首两行差推算、日期按天差推算（+1 天起步），文本/下拉复制。
import { reactive, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { GridCore } from './useGridCore';
import type { CellSelection } from './useCellSelection';

// 日期解析 / 加天数（setDate 自动处理跨月与闰年，输出 YYYY-MM-DD）
const parseDate = (v: any): Date | null => {
  if (!v) return null;
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
};
const addDays = (v: any, days: number): string => {
  const d = parseDate(v) ?? new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
};

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
      // 序列填充：从选区首两行推算步长——数字按差值；日期按天差；单行数字复制、单行日期 +1 天（Excel 语义）；
      // 文本/下拉恒为复制（步长 0）。公式统一为 first + step*(i - topIdx)，覆盖向下与向上两种方向
      const def = core.columnDefs.value.find((d) => d.field === srcField);
      const type = def?.type;
      const seed: any[] = [];
      for (let i = topIdx; i <= bottomIdx; i++) seed.push(rows[i][srcField]);
      const first = seed[0];
      let step = 0;
      if (type === 'number') {
        const f = Number(first);
        step = seed.length >= 2 && isFinite(f) ? Number(seed[1]) - f : 0;
        if (!isFinite(step)) step = 0;
      } else if (type === 'date') {
        const d0 = parseDate(first);
        const d1 = seed.length >= 2 ? parseDate(seed[1]) : null;
        step = d0 && d1 ? Math.round((d1.getTime() - d0.getTime()) / 86400000) : 1;
        if (!isFinite(step)) step = 1;
      }
      const seriesVal = (t: number): any => {
        if (first === '' || first == null) return first; // 源为空：复制
        const k = t - topIdx;
        if (type === 'number') return Number((Number(first) + step * k).toFixed(6));
        if (type === 'date') return addDays(first, step * k);
        return first; // 文本/下拉：常量复制
      };
      snap();
      let n = 0;
      for (let i = range[0]; i <= range[1]; i++) {
        const r = rows[i];
        if (!r) continue;
        r[srcField] = seriesVal(i);
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
