// 单元格框选状态机：vxe OSS 版不含 cell-area（官方 pro 功能，npm 包仅有防御性空钩），
// 故在本层自研 Excel 式选区：鼠标拖选 / Shift+点击扩展 / Shift+方向键扩展 / Ctrl+A 全选。
// 设计要点：
// - vxe v4 的 DOM 约定：td 带 colid（需经 getColumnById 换 field）、tr 带 rowid（= row[keyField] 编码值，
//   本项目 __id 均为 URI 安全字符，可直接等同）；早期误用 data-field/data-rowid 导致选区完全无法启动。
// - vxe 的方向键移动不感知 Shift，这里接管方向键：普通方向键塌缩为单格，Shift+方向键保持 anchor 扩展。
// - 鼠标拖选过程中 vxe 不会改 currentCell（click 事件目标是首尾公共祖先，不触发 cell-click），无需特殊处理。
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';
import type { GridCore } from './useGridCore';

/** 选区中的一个单元格坐标：rowId 对应 DOM tr 的 rowid（= keyField 编码值），field 对应列的 field（经 colid 换算） */
export interface SelCell {
  rowId: string;
  field: string;
}

/**
 * 自研单元格框选状态机：vxe OSS 版不含 cell-area（官方 pro 功能，npm 包仅有防御性空钩），
 * 故在本层自研 Excel 式选区，是整个录入台"选区"能力的唯一真相来源。
 *
 * 在整体架构中的角色：被 useGridKeys（Shift+方向键扩展 / Ctrl+A）、useGridMouse（鼠标拖选 /
 * 右键菜单）、useGridOps（批量操作作用域）、useGridIO（复制粘贴取源）、useGridFindReplace（查找范围）、
 * useFillHandle（填充源）共同依赖。它只管"哪个矩形被选中"，不涉及任何数据写入。
 *
 * 关键约定：
 *   - 只暴露 anchor / focus / selRect 三个语义；UI 通过 selEdge 画外框、isCellSelected 判选中。
 *   - 序号列（column.type 非空）不参与拖选（点序号走 cell-click 选整行通道）。
 *   - currentCell 与选区的同步在 watch 里做，需处理 keepSelection / suppressCollapseOnce 两类一次性标志。
 *
 * @param core  核心状态实例（读取 visibleDefs / processedRows / currentCell）
 * @param tableRef vxe 实例（getColumnById 把 colid 换 field）
 * @param gridWrapper 网格容器（mousedown 绑在此，避免空白区误触）
 */
export function useCellSelection(core: GridCore, tableRef: Ref<any>, gridWrapper: Ref<HTMLElement | undefined>) {
  // anchor：选区基准格（鼠标按下格 / Shift 扩展时的固定端）；focus：选区的移动端
  const anchor = ref<SelCell | null>(null);
  const focus = ref<SelCell | null>(null);

  let dragging = false;
  let shiftDown = false;
  // 拖选结束后的那次 click 会改 currentCell，此时不能塌缩选区（仅抑制一次）
  let suppressCollapseOnce = false;

  const visFields = computed(() => core.visibleDefs.value.map((d) => d.field));

  // 归一化矩形选区（按当前可见列与当前查询结果行序）
  const selRect = computed<{ rowIds: Set<string>; fields: string[] } | null>(() => {
    const a = anchor.value;
    const f = focus.value;
    if (!a || !f) return null;
    const fields = visFields.value;
    const fi = fields.indexOf(a.field);
    const ff = fields.indexOf(f.field);
    if (fi < 0 || ff < 0) return null;
    const rows = core.processedRows.value;
    const ai = rows.findIndex((r) => r.__id === a.rowId);
    const afi = rows.findIndex((r) => r.__id === f.rowId);
    if (ai < 0 || afi < 0) return null;
    const rowIds = new Set<string>();
    const lo = Math.min(ai, afi);
    const hi = Math.max(ai, afi);
    for (let i = lo; i <= hi; i++) rowIds.add(rows[i].__id);
    return { rowIds, fields: fields.slice(Math.min(fi, ff), Math.max(fi, ff) + 1) };
  });

  /** 判某格是否落在当前矩形选区内（行 id 命中 rowIds 且字段命中 fields）。供单元格高亮样式使用。 */
  const isCellSelected = (rowId: string, field: string) => {
    const rect = selRect.value;
    return !!rect && rect.rowIds.has(rowId) && rect.fields.includes(field);
  };

  // 选区边缘判定（供单元格样式绘制"区域外框"）：返回该格位于矩形选区的上/下/左/右哪几条边。
  // rowIds 为 Set 但插入序即行序（selRect 按 lo→hi 灌入），首/末元素即选区的顶/底行
  const NO_EDGE = { t: false, b: false, l: false, r: false };
  /**
   * 选区边缘判定（供单元格绘制"区域外框"）：返回该格位于矩形选区的上/下/左/右哪几条边。
   * rowIds 为 Set 但插入序即行序（selRect 按 lo→hi 灌入），首/末元素即选区的顶/底行。
   */
  const selEdge = (rowId: string, field: string) => {
    const rect = selRect.value;
    if (!rect || !rect.rowIds.has(rowId) || !rect.fields.includes(field)) return NO_EDGE;
    const rows = Array.from(rect.rowIds);
    return {
      t: rows[0] === rowId,
      b: rows[rows.length - 1] === rowId,
      l: rect.fields[0] === field,
      r: rect.fields[rect.fields.length - 1] === field,
    };
  };

  /** 清空选区（anchor/focus 同时置 null）：退出框选态时调用 */
  const clear = () => {
    anchor.value = null;
    focus.value = null;
  };

  /**
   * 按下开始选择：普通按下 = 以该格为 anchor 开始新选区；Shift+按下 = 保留 anchor，只移动 focus 端。
   * 同时置 dragging=true 进入拖拽态（之后 mousemove 才会更新 focus）。
   * @param rowId 被按下格的行 id
   * @param field 被按下格的字段
   * @param shift 是否按住 Shift（决定是否沿用既有 anchor 做扩展）
   */
  const beginSelect = (rowId: string, field: string, shift: boolean) => {
    if (shift && anchor.value) {
      focus.value = { rowId, field };
    } else {
      anchor.value = { rowId, field };
      focus.value = { rowId, field };
    }
    dragging = true;
  };
  /**
   * 拖拽过程中移动 focus 端：仅在 dragging 态生效，把 focus 更新为当前指针所在格，
   * 配合 anchor 由 selRect 实时算出矩形选区。
   * @param rowId 指针所在行 id
   * @param field 指针所在字段
   */
  const moveSelect = (rowId: string, field: string) => {
    if (!dragging || !anchor.value) return;
    focus.value = { rowId, field };
  };
  /**
   * 拖拽结束：dragging 置 false；若 anchor≠focus（确实是框选而非单击），则进入"抑制一次塌缩"态，
   * 等浏览器在焦点格触发的那次 click 过去（否则 click 改 currentCell 会把框选塌缩成单格）。
   * 用 setTimeout(0) 自动过期，防止标志残留吞掉后续正常的同步。
   */
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    const a = anchor.value;
    const f = focus.value;
    if (a && f && (a.rowId !== f.rowId || a.field !== f.field)) {
      // 拖选结束后浏览器会在原焦点格触发 click → currentCell 变为 focus 格，
      // 此时不能塌缩选区；仅抑制"恰好落在 focus 格"的那一次，并自动过期防止吞掉后续同步
      suppressCollapseOnce = true;
      setTimeout(() => {
        suppressCollapseOnce = false;
      }, 0);
    }
  };

  /**
   * 选区塌缩为单格（anchor=focus=该格）：普通点击 / 无 Shift 方向键移动后由 currentCell watch 触发。
   * @param rowId 目标行 id
   * @param field 目标字段
   */
  const collapseTo = (rowId: string, field: string) => {
    anchor.value = { rowId, field };
    focus.value = { rowId, field };
  };
  /**
   * Shift 扩展：anchor 保持不变，focus 跟到新格，矩形选区随之扩大（Excel 中 Shift+方向键 / Shift+点击）。
   * @param rowId 新 focus 行 id
   * @param field 新 focus 字段
   */
  const extendTo = (rowId: string, field: string) => {
    if (anchor.value) focus.value = { rowId, field };
  };
  /**
   * 程序化整表框选（Ctrl+A）：直接以 first/last 两端设置 anchor/focus，不进入拖拽态，
   * 避免后续 mousemove 误改 focus。注意：不要顺手改 currentCell，否则选区 watch 会把全选塌缩成单格。
   * @param first 选区起始格（左上）
   * @param last  选区结束格（右下）
   */
  const selectAll = (first: SelCell, last: SelCell) => {
    anchor.value = first;
    focus.value = last;
  };
  // 点击序号列：选中整行（以首/末可见字段为两端）。同步 currentCell 到行首格供编辑/统计，
  // 但不允许选区 watch 把它塌缩掉——用一次性标志跳过（仅当选区格确实变化时置位，避免吞掉后续同步）
  let keepSelection = false;
  /**
   * 点击序号列选中整行（以首/末可见字段为 anchor/focus）：
   * 同步 currentCell 到行首格供编辑/统计，但用 keepSelection 一次性标志跳过选区 watch 的塌缩。
   * @param rowId 要选中的行 id
   */
  const selectRow = (rowId: string) => {
    const fields = visFields.value;
    if (!fields.length) return;
    anchor.value = { rowId, field: fields[0] };
    focus.value = { rowId, field: fields[fields.length - 1] };
    const row = core.processedRows.value.find((r) => r.__id === rowId);
    const cur = core.currentCell.value;
    if (row && (!cur || cur.row.__id !== rowId || cur.field !== fields[0])) {
      keepSelection = true;
      core.currentCell.value = { row, field: fields[0] };
    }
  };

  /**
   * 点击列头选中整列（Excel 语义）：anchor=首行该列、focus=末行该列，活动格落在该列首行；
   * 与 selectRow 一样用 keepSelection 跳过选区 watch 的塌缩。
   * @param field 要选中的字段
   */
  const selectColumn = (field: string) => {
    const rows = core.processedRows.value;
    if (!rows.length) return;
    anchor.value = { rowId: rows[0].__id, field };
    focus.value = { rowId: rows[rows.length - 1].__id, field };
    const cur = core.currentCell.value;
    if (!cur || cur.row.__id !== rows[0].__id || cur.field !== field) {
      keepSelection = true;
      core.currentCell.value = { row: rows[0], field };
    }
  };

  /**
   * 同步 currentCell 但保留当前框选（右键菜单落在选区内时使用：Excel 中选区内右键不清选区）。
   * 仅在值确实变化时置位 keepSelection，否则标志会残留、吞掉后续一次正常的塌缩同步。
   * @param row 目标行
   * @param field 目标字段
   */
  const setCurrentKeepSel = (row: any, field: string) => {
    const cur = core.currentCell.value;
    if (!cur || cur.row.__id !== row.__id || cur.field !== field) {
      keepSelection = true;
      core.currentCell.value = { row, field };
    }
  };

  // ⚠️ 坑：currentCell 变化同步选区——vxe 的方向键/Tab/点击都会改 currentCell，在此统一适配。
  // 但 selectRow/selectColumn/setCurrentKeepSel 同步 currentCell 时不能塌缩选区（用 keepSelection 一次性标志），
  // 拖选结束后的那次 click 也不能塌缩（用 suppressCollapseOnce 抑制一次），否则整行/整列选区会被冲掉。
  watch(core.currentCell, (c) => {
    if (!c) return;
    // selectRow 的同步：保留整行选区，不塌缩
    if (keepSelection) {
      keepSelection = false;
      return;
    }
    if (suppressCollapseOnce) {
      suppressCollapseOnce = false;
      // 仅当点击恰好落在拖选的 focus 格上时才跳过塌缩（浏览器 click 行为）；否则视为过期，继续正常同步
      if (c.row.__id === focus.value?.rowId && c.field === focus.value?.field) return;
    }
    if (shiftDown && anchor.value) extendTo(c.row.__id, c.field);
    else collapseTo(c.row.__id, c.field);
  });

  // ===================== DOM 事件 =====================
  // ⚠️ 坑：DOM 约定——td 带 colid（列实例 id，需经 getColumnById(colid).field 换 field），tr 带 rowid
  // （= row[row-config.keyField] 的 encodeURIComponent；注意不是 data-field / data-rowid）。
  // 早期误用 data-field/data-rowid 会导致选区完全无法启动。序号列（column.type 非空）不参与拖选。
  const cellFromEvent = (e: MouseEvent): SelCell | null => {
    const el = (e.target as HTMLElement | null)?.closest('.vxe-body--column') as HTMLElement | null;
    const colid = el?.getAttribute('colid');
    const tr = el?.closest('.vxe-body--row') as HTMLElement | null;
    const rowId = tr?.getAttribute('rowid');
    if (!colid || !rowId) return null;
    const column = tableRef.value?.getColumnById?.(colid);
    const field = column?.field;
    // 序号列等类型列（column.type 非空）不参与拖选：点序号选中整行走 cell-click 通道
    if (!field || column?.type) return null;
    return { rowId, field };
  };
  const isIgnoredTarget = (e: MouseEvent) => {
    const t = e.target as HTMLElement | null;
    if (!t) return true;
    const tag = t.tagName?.toLowerCase();
    // 编辑中的输入框、填充手柄、右键菜单不参与选区
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (t.closest('.dt-fillhandle') || t.closest('.dt-menu')) return true;
    return false;
  };

  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0 || isIgnoredTarget(e)) return;
    const cell = cellFromEvent(e);
    if (!cell) return;
    // 阻止原生文本拖选，保证框选视觉干净（dblclick 编辑不受影响）
    e.preventDefault();
    beginSelect(cell.rowId, cell.field, e.shiftKey);
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    const cell = cellFromEvent(e);
    if (cell) moveSelect(cell.rowId, cell.field);
  };
  const onMouseUp = () => endDrag();

  const onWinKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Shift') shiftDown = true;
  };
  const onWinKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Shift') shiftDown = false;
  };
  const onWinBlur = () => {
    shiftDown = false;
    dragging = false;
  };

  onMounted(() => {
    gridWrapper.value?.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onWinKeyDown);
    window.addEventListener('keyup', onWinKeyUp);
    window.addEventListener('blur', onWinBlur);
  });
  onBeforeUnmount(() => {
    gridWrapper.value?.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('keydown', onWinKeyDown);
    window.removeEventListener('keyup', onWinKeyUp);
    window.removeEventListener('blur', onWinBlur);
  });

  return {
    anchor,
    focus,
    selRect,
    isCellSelected,
    selEdge,
    clear,
    beginSelect,
    moveSelect,
    endDrag,
    collapseTo,
    extendTo,
    selectAll,
    selectRow,
    selectColumn,
    setCurrentKeepSel,
  };
}

/**
 * useCellSelection 的返回类型别名：导出 anchor / focus / selRect / isCellSelected / selEdge /
 * clear / beginSelect / moveSelect / endDrag / collapseTo / extendTo / selectAll / selectRow /
 * selectColumn / setCurrentKeepSel，供键盘、鼠标、填充、复制粘贴、查找替换等模块共享选区状态。
 */
export type CellSelection = ReturnType<typeof useCellSelection>;
