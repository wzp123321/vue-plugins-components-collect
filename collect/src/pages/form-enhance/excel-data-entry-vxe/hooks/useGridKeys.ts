// 键盘交互：网格激活判定 + Excel 式单元格导航（方向键/Tab/Enter/F2/Delete + Ctrl+方向键跳边界/Home·End/PageUp·Down）
//           + 选中即键入编辑（覆盖模式）+ 快捷键（Ctrl+Z/Y/F/D/A/Enter）
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

  // 编辑态 Enter/Tab：提交当前编辑并移动到下一格（Excel 语义：下移/右移，不自动续编）
  // vxe 的 keyboardConfig.isEnter 已关闭，编辑内的 Enter/Tab 不会自动流转，须在此接管
  const commitAndMove = (direction: 'down' | 'right', shift: boolean) => {
    const cur = core.currentCell.value;
    if (!cur) return;
    const rows = core.processedRows.value;
    const fields = core.visibleDefs.value.map((d) => d.field);
    const ri = rows.findIndex((r) => r.__id === cur.row.__id);
    const ci = fields.indexOf(cur.field);
    if (ri < 0 || ci < 0) return;
    let nr = ri;
    let nc = ci;
    if (direction === 'down') {
      nr = Math.min(ri + (shift ? -1 : 1), rows.length - 1);
    } else {
      nc = ci + (shift ? -1 : 1);
      if (nc < 0) {
        nc = fields.length - 1;
        nr = Math.max(ri - 1, 0);
      } else if (nc >= fields.length) {
        nc = 0;
        nr = Math.min(ri + 1, rows.length - 1);
      }
    }
    const nrow = rows[nr];
    const nfield = fields[nc];
    tableRef.value?.clearActived?.();
    core.currentCell.value = { row: nrow, field: nfield };
    sel.collapseTo(nrow.__id, nfield);
    scrollCellIntoView(nrow, nfield);
  };

  // 选中格键入字符即覆盖进入编辑：text 直接用字符；number 仅数字/小数点/负号可覆盖；date/select 打开编辑器保留原值
  const startOverwriteEdit = (row: any, field: string, ch: string) => {
    const def = core.columnDefs.value.find((d) => d.field === field);
    const type = def?.type;
    let startVal: any = row[field];
    if (type === 'text') {
      startVal = ch;
    } else if (type === 'number') {
      if (/[0-9]/.test(ch)) startVal = Number(ch);
      else if (ch === '.') startVal = 0;
      else if (ch === '-') startVal = null; // 负号作起始：打开编辑但不覆盖
      else return; // 非数字字符忽略
    } else {
      startVal = row[field]; // date/select：保留原值，仅打开编辑器供选取/输入
    }
    if (startVal !== row[field]) {
      core.pushSnapshot(core.snapshotNow());
      row[field] = startVal;
      row.__dirty = true;
    }
    core.currentCell.value = { row, field };
    sel.collapseTo(row.__id, field);
    tableRef.value?.setEditCell?.(row, field);
  };

  // ===================== 数据边界 / 分页跳转辅助 =====================
  const colHasValue = (row: any, field: string) =>
    row[field] !== null && row[field] !== undefined && row[field] !== '';
  // 列内向下/向上跳到数据块边界（Excel 语义：在连续数据块内跳到块首/块末；在空白区跳到最近的末非空行/列或极端）
  const boundaryRow = (field: string, from: number, dir: 1 | -1): number => {
    const rows = core.processedRows.value;
    const has = (i: number) => colHasValue(rows[i], field);
    if (dir === 1) {
      if (has(from)) { let i = from; while (i + 1 < rows.length && has(i + 1)) i++; return i; }
      for (let i = from + 1; i < rows.length; i++) if (has(i)) return i;
      return rows.length - 1;
    }
    if (has(from)) { let i = from; while (i - 1 >= 0 && has(i - 1)) i--; return i; }
    for (let i = from - 1; i >= 0; i--) if (has(i)) return i;
    return 0;
  };
  // 行内向左/向右跳到数据块边界
  const boundaryCol = (row: any, from: number, dir: 1 | -1, fields: string[]): number => {
    const has = (i: number) => colHasValue(row, fields[i]);
    if (dir === 1) {
      if (has(from)) { let i = from; while (i + 1 < fields.length && has(i + 1)) i++; return i; }
      for (let i = from + 1; i < fields.length; i++) if (has(i)) return i;
      return fields.length - 1;
    }
    if (has(from)) { let i = from; while (i - 1 >= 0 && has(i - 1)) i--; return i; }
    for (let i = from - 1; i >= 0; i--) if (has(i)) return i;
    return 0;
  };
  // 估算可视行数（PageUp/PageDown 整屏翻动）
  const visibleRowCount = (): number => {
    const box = gridBox.value;
    if (!box) return 10;
    const sample = box.querySelector('.vxe-body--row') as HTMLElement | null;
    const rh = sample ? sample.getBoundingClientRect().height : 36;
    return Math.max(1, Math.floor((box.clientHeight || 400) / (rh || 36)) - 1);
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
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();
    const shift = e.shiftKey;
    // 输入框内：编辑态接管 Enter/Tab（提交并移动）；其余放行原生（含 Ctrl+Z 文本撤销 / Esc 取消编辑）
    if (inField) {
      const inGridEdit = !!(ae && (ae as HTMLElement).closest && (ae as HTMLElement).closest('.vxe-table'));
      if (inGridEdit && (key === 'enter' || key === 'tab')) {
        e.preventDefault();
        commitAndMove(key === 'enter' ? 'down' : 'right', shift);
      }
      return;
    }

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

    // 选中格直接键入即进入编辑（覆盖模式，Excel 语义）：字母/数字/符号落到当前格并打开编辑器
    if (!mod && !e.altKey && key.length === 1) {
      const cur = moveBase();
      if (cur) {
        e.preventDefault();
        startOverwriteEdit(cur.row, cur.field, key);
        return;
      }
    }

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
    } else if (
      key === 'home' || key === 'end' || key === 'pageup' || key === 'pagedown' ||
      (mod && (key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright' || key === 'home' || key === 'end'))
    ) {
      // 边界/分页跳转：Home/End = 行内首/末列；Ctrl+方向键 = 跳数据块边界；
      // Ctrl+Home/End = 数据区左上/右下角；PageUp/Down = 整屏翻动
      const cur = moveBase();
      if (!cur) return;
      e.preventDefault();
      const rows = core.processedRows.value;
      const fields = core.visibleDefs.value.map((d) => d.field);
      const ri = rows.findIndex((r) => r.__id === cur.row.__id);
      const ci = fields.indexOf(cur.field);
      if (ri < 0 || ci < 0) return;
      let nr = ri;
      let nc = ci;
      if (mod && key.startsWith('arrow')) {
        if (key === 'arrowdown') nr = boundaryRow(cur.field, ri, 1);
        else if (key === 'arrowup') nr = boundaryRow(cur.field, ri, -1);
        else if (key === 'arrowright') nc = boundaryCol(rows[ri], ci, 1, fields);
        else nc = boundaryCol(rows[ri], ci, -1, fields);
      } else if (mod && (key === 'home' || key === 'end')) {
        nr = key === 'home' ? 0 : rows.length - 1;
        nc = key === 'home' ? 0 : fields.length - 1;
      } else if (key === 'home') {
        nc = 0;
      } else if (key === 'end') {
        nc = fields.length - 1;
      } else {
        const step = visibleRowCount() * (key === 'pageup' ? -1 : 1);
        nr = Math.min(Math.max(ri + step, 0), rows.length - 1);
      }
      const nrow = rows[nr];
      const nfield = fields[nc];
      core.currentCell.value = { row: nrow, field: nfield };
      sel.collapseTo(nrow.__id, nfield);
      scrollCellIntoView(nrow, nfield);
    } else if ((key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') && !mod) {
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
