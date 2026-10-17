// 键盘交互：网格激活判定 + Excel 式单元格导航（方向键/Tab/Enter/F2/Delete）+ 快捷键（Ctrl+Z/Y/F/D/A/Enter）
// 设计要点：
// - vxe OSS 方向键不感知 Shift，且其内部 selected 态与自研选区双轨运行会冲突，
//   故键盘导航完全自管（keyboard-config 已在 useGridColumns 显式关闭对应项）
// - vxe 不做 DOM 聚焦（其 focus() 仅置内部 isActivated），点击单元格后 activeElement 仍是 body，
//   故自维护"网格激活"标志——点在网格内视为激活，点在网格外或窗口失焦时取消
// - Esc/F1 为全局键（不要求网格激活）：右键落点被菜单遮住时 gridActive 已置 false，
//   若放在下面的 inGrid 守卫之后就会失效
import { ref } from 'vue';
import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { GridCore } from './useGridCore';
import type { CellSelection } from './useCellSelection';
import type { GridFindReplace } from './useGridFindReplace';

export function useGridKeys(
  core: GridCore,
  tableRef: Ref<any>,
  sel: CellSelection,
  find: GridFindReplace,
  deps: {
    gridBox: Ref<HTMLElement | undefined>;
    gridWrapper: Ref<HTMLElement | undefined>;
    /** Esc 是跨状态机的全局键：由协调层（useGridMouse）关菜单 + 取消复制蚂蚁线 */
    onEscape: () => void;
  },
) {
  const { gridBox, gridWrapper, onEscape } = deps;

  // ===================== 网格激活判定 =====================
  const gridActive = ref(false);
  const onWinMouseDown = (e: MouseEvent) => {
    gridActive.value = !!gridBox.value?.contains(e.target as Node);
  };
  const onWinBlur = () => {
    gridActive.value = false;
  };

  // ===================== 快捷键帮助（F1） =====================
  const helpVisible = ref(false);

  // 把指定单元格滚入可视区（不激活编辑，区别于 useGridScroll.scrollToCell）
  const scrollCellIntoView = (row: any, field: string) => {
    tableRef.value?.scrollToRow?.(row);
    tableRef.value?.scrollToColumn?.(field);
  };

  // 方向键/Tab/Enter 的移动基准格（Excel：白底活动格即 anchor，方向键从其移动并塌缩选区）：
  // - 键盘扩展流：currentCell 就是 focus 端（Shift+方向键刚移过），继续从其移动
  // - 鼠标拖选后：click 落在首/尾格的公共祖先上，vxe 收不到 cell-click，currentCell 为 null
  //   或停留在选区外的陈旧格——此时以 anchor 为基准，与 cell-active 的可视位置一致
  //   （曾直接取 currentCell：无单击历史时方向键整体失灵，有陈旧值时从错误格起移）
  const moveBase = (): { row: any; field: string } | null => {
    const cur = core.currentCell.value;
    const f = sel.focus.value;
    if (cur && f && cur.row.__id === f.rowId && cur.field === f.field) return cur;
    const a = sel.anchor.value;
    if (a) {
      const row = core.processedRows.value.find((r) => r.__id === a.rowId);
      if (row) return { row, field: a.field };
    }
    return cur;
  };

  const onKeydown = (e: KeyboardEvent) => {
    const ae = document.activeElement;
    const tag = (ae?.tagName || '').toLowerCase();
    const inField = tag === 'input' || tag === 'textarea' || tag === 'select';
    // 输入框内一律放行原生行为（含 Ctrl+Z 文本撤销 / Ctrl+A 全选文本），网格快捷键不拦截
    if (inField) return;
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();
    const shift = e.shiftKey;

    // 全局键（不要求网格激活）：编辑态的 Esc 由输入框提前放行、交回 vxe 处理
    if (key === 'escape') {
      onEscape();
      return;
    }
    if (key === 'f1') {
      // F1：快捷键帮助（同时阻止浏览器默认的帮助行为）
      e.preventDefault();
      helpVisible.value = !helpVisible.value;
      return;
    }

    const inGrid = gridActive.value || (gridWrapper.value?.contains(ae as Node) ?? false);
    if (!inGrid) return;

    if (mod && key === 'z') {
      e.preventDefault();
      shift ? core.redo() : core.undo();
    } else if (mod && key === 'y') {
      e.preventDefault();
      core.redo();
    } else if (mod && key === 'f') {
      e.preventDefault();
      find.findVisible.value = true;
    } else if (mod && key === 'd') {
      // Ctrl+D：向下填充——选区首行逐列复制到选区其余行（Excel 语义）。
      // 注意：早期此键绑的是 duplicateSelected（复制整行），与 Excel 同名不同义；复制整行请用工具栏按钮
      e.preventDefault();
      const rect = sel.selRect.value;
      if (!rect || rect.rowIds.size < 2) {
        ElMessage.info('请先框选至少两行（首行作为数据源）再向下填充');
        return;
      }
      const rows = core.processedRows.value.filter((r) => rect.rowIds.has(r.__id));
      const top = rows[0];
      if (!top) return;
      core.pushSnapshot(core.snapshotNow());
      let n = 0;
      for (let i = 1; i < rows.length; i++) {
        for (const f of rect.fields) {
          rows[i][f] = top[f];
          rows[i].__dirty = true;
          core.validateCell(rows[i], f);
          n++;
        }
      }
      ElMessage.success(n ? `已向下填充 ${n} 个单元格` : '选区内没有可填充的单元格');
    } else if (mod && key === 'a') {
      // Ctrl+A：框选整个数据区（Excel 全选语义，替代已移除的复选框全选）。
      // 注意不要顺手改 currentCell——选区 watch 会把选区塌缩成单格，全选即被冲掉
      e.preventDefault();
      const fields = core.visibleDefs.value.map((d) => d.field);
      const rows = core.processedRows.value;
      if (fields.length && rows.length) {
        sel.selectAll(
          { rowId: rows[0].__id, field: fields[0] },
          { rowId: rows[rows.length - 1].__id, field: fields[fields.length - 1] },
        );
      }
    } else if (mod && key === 'enter') {
      // Ctrl+Enter：用当前格的值填充整个框选区域（Excel 经典快捷键）
      const rect = sel.selRect.value;
      const cur = moveBase();
      if (rect && cur) {
        e.preventDefault();
        core.pushSnapshot(core.snapshotNow());
        const val = cur.row[cur.field];
        let n = 0;
        for (const r of core.processedRows.value) {
          if (!rect.rowIds.has(r.__id)) continue;
          for (const f of rect.fields) {
            if (r.__id === cur.row.__id && f === cur.field) continue;
            r[f] = val;
            r.__dirty = true;
            core.validateCell(r, f);
            n++;
          }
        }
        ElMessage.success(n ? `已填充 ${n} 个单元格` : '选区内没有其他单元格');
      }
    } else if (key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') {
      // 方向键导航：普通方向键塌缩为单格，Shift+方向键保持 anchor 扩展（extendTo 只动 focus）
      const cur = moveBase();
      if (!cur) return;
      e.preventDefault();
      const rows = core.processedRows.value;
      const fields = core.visibleDefs.value.map((d) => d.field);
      const ri = rows.findIndex((r) => r.__id === cur.row.__id);
      const ci = fields.indexOf(cur.field);
      if (ri < 0 || ci < 0) return;
      const dr = key === 'arrowup' ? -1 : key === 'arrowdown' ? 1 : 0;
      const dc = key === 'arrowleft' ? -1 : key === 'arrowright' ? 1 : 0;
      const nrow = rows[Math.min(Math.max(ri + dr, 0), rows.length - 1)];
      const nfield = fields[Math.min(Math.max(ci + dc, 0), fields.length - 1)];
      core.currentCell.value = { row: nrow, field: nfield };
      if (shift && sel.anchor.value) sel.extendTo(nrow.__id, nfield);
      scrollCellIntoView(nrow, nfield);
    } else if (key === 'tab') {
      // Excel 语义：Tab 右移 / Shift+Tab 左移，行尾回绕下一行首格、行首回绕上一行末格
      const cur = moveBase();
      if (!cur) return;
      e.preventDefault();
      const rows = core.processedRows.value;
      const fields = core.visibleDefs.value.map((d) => d.field);
      const ri = rows.findIndex((r) => r.__id === cur.row.__id);
      const ci = fields.indexOf(cur.field);
      if (ri < 0 || ci < 0) return;
      let nr = ri;
      let nc = ci + (shift ? -1 : 1);
      if (nc >= fields.length) {
        nc = 0;
        nr = Math.min(ri + 1, rows.length - 1);
      } else if (nc < 0) {
        nc = fields.length - 1;
        nr = Math.max(ri - 1, 0);
      }
      const nrow = rows[nr];
      const nfield = fields[nc];
      core.currentCell.value = { row: nrow, field: nfield };
      if (shift && sel.anchor.value) sel.extendTo(nrow.__id, nfield);
      scrollCellIntoView(nrow, nfield);
    } else if (key === 'enter') {
      // Enter 下移 / Shift+Enter 上移（编辑中的输入框会自行拦截，不会到达此处）
      const cur = moveBase();
      if (!cur) return;
      e.preventDefault();
      const rows = core.processedRows.value;
      const ri = rows.findIndex((r) => r.__id === cur.row.__id);
      if (ri < 0) return;
      const nrow = rows[Math.min(Math.max(ri + (shift ? -1 : 1), 0), rows.length - 1)];
      core.currentCell.value = { row: nrow, field: cur.field };
      if (shift && sel.anchor.value) sel.extendTo(nrow.__id, cur.field);
      scrollCellIntoView(nrow, cur.field);
    } else if (key === 'f2') {
      const cur = moveBase();
      if (cur) {
        e.preventDefault();
        tableRef.value?.setEditCell?.(cur.row, cur.field);
      }
    } else if (key === 'delete' || key === 'backspace') {
      // Delete：有框选区域时清空整个选区，否则只清当前格（Excel 语义）
      const rect = sel.selRect.value;
      const targets: { row: any; field: string }[] = [];
      if (rect) {
        for (const r of core.processedRows.value) {
          if (!rect.rowIds.has(r.__id)) continue;
          for (const f of rect.fields) targets.push({ row: r, field: f });
        }
      } else if (core.currentCell.value) {
        targets.push(core.currentCell.value);
      }
      const dirtyTargets = targets.filter((t) => t.row[t.field] !== '' && t.row[t.field] != null);
      if (dirtyTargets.length) {
        e.preventDefault();
        core.pushSnapshot(core.snapshotNow());
        for (const t of dirtyTargets) {
          const def = core.columnDefs.value.find((d) => d.field === t.field);
          t.row[t.field] = def?.type === 'number' ? null : '';
          t.row.__dirty = true;
          core.validateCell(t.row, t.field);
        }
        ElMessage.success(dirtyTargets.length > 1 ? `已清空 ${dirtyTargets.length} 个单元格` : '已清空');
      }
    }
  };

  return { gridActive, onKeydown, onWinMouseDown, onWinBlur, scrollCellIntoView, helpVisible };
}

export type GridKeys = ReturnType<typeof useGridKeys>;
