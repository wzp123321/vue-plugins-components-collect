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

/**
 * 行主键 / 脏标记访问助手。
 * ⚠️ __id / __dirty 是 vxe-table 消费的行字段（__id 即页面 :row-config 的 keyField），
 * 属性名属外部约定、不可重命名；经解构读取、Object.assign 写入，键名与语义不变，
 * 同时避免 no-underscore-dangle 报错。
 */
const rowIdOf = (r?: { __id: string } | null): string => {
  if (!r) return '';
  const { __id } = r;
  return __id ?? '';
};
const markDirty = (r: { __dirty: boolean }): void => {
  Object.assign(r, { __dirty: true });
};

/**
 * 键盘交互层：网格激活判定 + Excel 式单元格导航 + 选中即键入覆盖编辑 + 各种快捷键。
 *
 * 在整体架构中的角色：本层是纯"键盘"状态机，挂在 window 的 keydown 上由 useGridMouse 装配；
 * 它不拥有选区/数据，而是调用 `sel`（useCellSelection）与 `core`（useGridCore）的能力。
 * 关键设计：
 *   - 自维护 `gridActive` 激活标志（点在网格内 = 激活），因为 vxe 的 focus() 只置内部 isActivated、
 *     不做 DOM 聚焦，点击单元格后 document.activeElement 仍是 body，不能靠 contains(activeElement) 判定。
 *   - 键盘导航完全自管（keyboard-config 已在 useGridColumns 显式关闭 isArrow/isTab/isEdit/isChecked 等），
 *     因为 vxe OSS 方向键不感知 Shift，且其内部 selected 态会与自研选区双轨冲突。
 *   - Esc / F1 为全局键，必须放在 `inGrid` 守卫之前（右键落点被菜单遮住时 gridActive=false，放守卫后会整段失效）。
 *
 * @param core  核心状态实例
 * @param tableRef vxe 表格实例 ref
 * @param sel   自研选区状态机
 * @param find  查找替换实例（Ctrl+F 打开面板）
 * @param deps  协调依赖：gridBox/gridWrapper 用于激活判定；onEscape 由协调层关菜单+消蚂蚁线；
 *              appendRow 在 Tab 到末行末尾时追加新行（避免键盘层直接依赖数据操作层）
 */
export const useGridKeys = (
  core: GridCore,
  tableRef: Ref<any>,
  sel: CellSelection,
  find: GridFindReplace,
  deps: {
    gridBox: Ref<HTMLElement | undefined>;
    gridWrapper: Ref<HTMLElement | undefined>;
    /** Esc 是跨状态机的全局键：由协调层（useGridMouse）关菜单 + 取消复制蚂蚁线 */
    onEscape: () => void;
    /** Tab 到末行末尾时追加一行并返回它（由协调层注入 ops.addRow，避免键盘层直接依赖数据操作层） */
    appendRow?: () => any;
  },
) => {
  const { gridBox, gridWrapper, onEscape, appendRow } = deps;

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

  /** 把指定单元格滚入可视区（仅滚动、不激活编辑，区别于 useGridScroll.scrollToCell 会设活动格） */
  const scrollCellIntoView = (row: any, field: string) => {
    tableRef.value?.scrollToRow?.(row);
    tableRef.value?.scrollToColumn?.(field);
  };

  /**
   * 编辑态 Enter/Tab 收尾：提交当前编辑并移动到下一格（Excel 语义：下移/右移，不自动续编）。
   * vxe 的 keyboardConfig.isEnter 已关闭，编辑内的 Enter/Tab 不会自动流转，故在此接管；
   * 到末行末尾且为虚拟滚动模式时追加新行并落到新行首格（连续录入不中断）。
   * @param direction 'down'（Enter）或 'right'（Tab）
   * @param shift 是否反向（Shift+Enter/Shift+Tab）
   */
  const commitAndMove = (direction: 'down' | 'right', shift: boolean) => {
    const cur = core.currentCell.value;
    if (!cur) return;
    const rows = core.processedRows.value;
    const fields = core.visibleDefs.value.map((d) => d.field);
    const ri = rows.findIndex((r) => rowIdOf(r) === rowIdOf(cur.row));
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
        // 编辑态 Tab 到末行末尾同样追加新行（连续录入不中断）
        if (!shift && ri === rows.length - 1 && core.viewMode.value === 'virtual' && appendRow) {
          const nr2 = appendRow();
          if (nr2) {
            tableRef.value?.clearActived?.();
            core.currentCell.value = { row: nr2, field: fields[0] };
            sel.collapseTo(rowIdOf(nr2), fields[0]);
            scrollCellIntoView(nr2, fields[0]);
            return;
          }
        }
        nr = Math.min(ri + 1, rows.length - 1);
      }
    }
    const nrow = rows[nr];
    const nfield = fields[nc];
    tableRef.value?.clearActived?.();
    core.currentCell.value = { row: nrow, field: nfield };
    sel.collapseTo(rowIdOf(nrow), nfield);
    scrollCellIntoView(nrow, nfield);
  };

  /**
   * 选中格键入字符即覆盖进入编辑（Excel 覆盖模式）：text 直接用字符；number 仅数字/小数点/负号可覆盖
   * （负号作起始只打开编辑器不覆盖）；date/select 保留原值仅打开编辑器供选取/输入。
   * @param row   目标行
   * @param field 目标字段
   * @param ch    keydown 的单个字符
   */
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
      // 覆盖首字符也是一次数据变更：走字段级增量，别为一次键入拷整表
      core.commitCells('编辑单元格', [row], () => {
        row[field] = startVal;
        markDirty(row);
      });
    }
    core.currentCell.value = { row, field };
    sel.collapseTo(rowIdOf(row), field);
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
    if (cur && f && rowIdOf(cur.row) === f.rowId && cur.field === f.field) return cur;
    const a = sel.anchor.value;
    if (a) {
      const row = core.processedRows.value.find((r) => rowIdOf(r) === a.rowId);
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
    // ⚠️ 坑：vxe 的 focus() 只置内部 isActivated、不做 DOM 聚焦——点击单元格后 document.activeElement 仍是 body，
    // 故"是否处于网格内"不能靠 contains(activeElement) 判定，只能自维护 gridActive 标志（见 onWinMouseDown）。
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

    // ⚠️ 坑：Esc/F1 等全局键必须放在下面的 inGrid 守卫之前——右键落点被菜单遮住时 mousedown target 是菜单，
    // gridActive=false，若把 Esc/F1 也放进守卫之后，全局键会整段失效
    const inGrid = gridActive.value || (gridWrapper.value?.contains(ae as Node) ?? false);
    if (!inGrid) return;

    // 选中格直接键入即进入编辑（覆盖模式，Excel 语义）：字母/数字/符号落到当前格并打开编辑器
    // ⚠️ 坑：必须排除 Shift——否则 Shift+Space 会在这里被当成"键入空格"吞掉（写入空格、标脏、入撤销栈），
    // 下面的 Shift+Space 选整行分支永远不可达
    if (!mod && !e.altKey && !shift && key.length === 1) {
      const cur = moveBase();
      if (cur) {
        e.preventDefault();
        startOverwriteEdit(cur.row, cur.field, key);
        return;
      }
    }

    if (mod && key === 'z') {
      e.preventDefault();
      if (shift) core.redo();
      else core.undo();
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
      if (!rect || rect.bottomIdx - rect.topIdx + 1 < 2) {
        ElMessage.info('请先框选至少两行（首行作为数据源）再向下填充');
        return;
      }
      const rows = sel.rectRows(rect);
      const fields = sel.rectFields(rect);
      const top = rows[0];
      if (!top) return;
      let n = 0;
      core.commitCells('向下填充', rows, () => {
        // 首行是数据源，从第二行起逐列复制（原 for i=1.. 语义）
        rows.slice(1).forEach((r) => {
          fields.forEach((f) => {
            r[f] = top[f];
            markDirty(r);
            core.validateCell(r, f);
            n++;
          });
        });
      });
      ElMessage.success(n ? `已向下填充 ${n} 个单元格` : '选区内没有可填充的单元格');
    } else if (mod && key === 'r') {
      // Ctrl+R：向右填充——选区最左列逐行复制到右侧各列（与 Ctrl+D 对称，Excel 语义）
      e.preventDefault();
      const rect = sel.selRect.value;
      if (!rect || rect.rightIdx - rect.leftIdx + 1 < 2) {
        ElMessage.info('请先框选至少两列（最左列作为数据源）再向右填充');
        return;
      }
      const rows = sel.rectRows(rect);
      const fields = sel.rectFields(rect);
      if (!rows.length) return;
      const srcField = fields[0];
      let n = 0;
      core.commitCells('向右填充', rows, () => {
        // 最左列是数据源，从第二列起逐格复制（原 for i=1.. 语义）
        rows.forEach((r) => {
          fields.slice(1).forEach((f) => {
            r[f] = r[srcField];
            markDirty(r);
            core.validateCell(r, f);
            n++;
          });
        });
      });
      ElMessage.success(n ? `已向右填充 ${n} 个单元格` : '选区内没有可填充的单元格');
    } else if (key === ' ' && (mod || shift)) {
      // Ctrl+Space 选整列 / Shift+Space 选整行（Excel 标准快捷键，与"点列头选列"互为补充）
      e.preventDefault();
      const cur = moveBase();
      if (!cur) return;
      if (mod) sel.selectColumn(cur.field);
      else sel.selectRow(rowIdOf(cur.row));
    } else if (mod && key === 'a') {
      // Ctrl+A：框选整个数据区（Excel 全选语义，替代已移除的复选框全选）。
      // 注意不要顺手改 currentCell——选区 watch 会把选区塌缩成单格，全选即被冲掉
      e.preventDefault();
      const fields = core.visibleDefs.value.map((d) => d.field);
      const rows = core.processedRows.value;
      if (fields.length && rows.length) {
        sel.selectAll(
          { rowId: rowIdOf(rows[0]), field: fields[0] },
          { rowId: rowIdOf(rows[rows.length - 1]), field: fields[fields.length - 1] },
        );
      }
    } else if (mod && key === 'enter') {
      // Ctrl+Enter：用当前格的值填充整个框选区域（Excel 经典快捷键）
      const rect = sel.selRect.value;
      const cur = moveBase();
      if (rect && cur) {
        e.preventDefault();
        const val = cur.row[cur.field];
        const fields = sel.rectFields(rect);
        const rows = sel.rectRows(rect);
        let n = 0;
        core.commitCells('填充选区', rows, () => {
          rows.forEach((r) => {
            fields.forEach((f) => {
              // 跳过当前格自身（原 continue 的反条件写法：两者不全等才写）
              if (rowIdOf(r) !== rowIdOf(cur.row) || f !== cur.field) {
                r[f] = val;
                markDirty(r);
                core.validateCell(r, f);
                n++;
              }
            });
          });
        });
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
      const ri = rows.findIndex((r) => rowIdOf(r) === rowIdOf(cur.row));
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
      sel.collapseTo(rowIdOf(nrow), nfield);
      scrollCellIntoView(nrow, nfield);
    } else if ((key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') && !mod) {
      // 方向键导航：普通方向键塌缩为单格，Shift+方向键保持 anchor 扩展（extendTo 只动 focus）
      const cur = moveBase();
      if (!cur) return;
      e.preventDefault();
      const rows = core.processedRows.value;
      const fields = core.visibleDefs.value.map((d) => d.field);
      const ri = rows.findIndex((r) => rowIdOf(r) === rowIdOf(cur.row));
      const ci = fields.indexOf(cur.field);
      if (ri < 0 || ci < 0) return;
      let dr = 0;
      if (key === 'arrowup') dr = -1;
      else if (key === 'arrowdown') dr = 1;
      let dc = 0;
      if (key === 'arrowleft') dc = -1;
      else if (key === 'arrowright') dc = 1;
      const nrow = rows[Math.min(Math.max(ri + dr, 0), rows.length - 1)];
      const nfield = fields[Math.min(Math.max(ci + dc, 0), fields.length - 1)];
      core.currentCell.value = { row: nrow, field: nfield };
      if (shift && sel.anchor.value) sel.extendTo(rowIdOf(nrow), nfield);
      scrollCellIntoView(nrow, nfield);
    } else if (key === 'tab') {
      // Excel 语义：Tab 右移 / Shift+Tab 左移，行尾回绕下一行首格、行首回绕上一行末格
      const cur = moveBase();
      if (!cur) return;
      e.preventDefault();
      const rows = core.processedRows.value;
      const fields = core.visibleDefs.value.map((d) => d.field);
      const ri = rows.findIndex((r) => rowIdOf(r) === rowIdOf(cur.row));
      const ci = fields.indexOf(cur.field);
      if (ri < 0 || ci < 0) return;
      let nr = ri;
      let nc = ci + (shift ? -1 : 1);
      if (nc >= fields.length) {
        nc = 0;
        // 连续录入：末行末尾 Tab 自动追加一行并落到新行首格（仅虚拟滚动模式；
        // 分页模式下新行不在当前页，跳过去会显示为空页）
        if (!shift && ri === rows.length - 1 && core.viewMode.value === 'virtual' && appendRow) {
          const nr2 = appendRow();
          if (nr2) {
            core.currentCell.value = { row: nr2, field: fields[0] };
            sel.collapseTo(rowIdOf(nr2), fields[0]);
            scrollCellIntoView(nr2, fields[0]);
            return;
          }
        }
        nr = Math.min(ri + 1, rows.length - 1);
      } else if (nc < 0) {
        nc = fields.length - 1;
        nr = Math.max(ri - 1, 0);
      }
      const nrow = rows[nr];
      const nfield = fields[nc];
      core.currentCell.value = { row: nrow, field: nfield };
      if (shift && sel.anchor.value) sel.extendTo(rowIdOf(nrow), nfield);
      scrollCellIntoView(nrow, nfield);
    } else if (key === 'enter') {
      // Enter 下移 / Shift+Enter 上移（编辑中的输入框会自行拦截，不会到达此处）
      const cur = moveBase();
      if (!cur) return;
      e.preventDefault();
      const rows = core.processedRows.value;
      const ri = rows.findIndex((r) => rowIdOf(r) === rowIdOf(cur.row));
      if (ri < 0) return;
      const nrow = rows[Math.min(Math.max(ri + (shift ? -1 : 1), 0), rows.length - 1)];
      core.currentCell.value = { row: nrow, field: cur.field };
      if (shift && sel.anchor.value) sel.extendTo(rowIdOf(nrow), cur.field);
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
        const fields = sel.rectFields(rect);
        sel.rectRows(rect).forEach((r) => {
          fields.forEach((f) => targets.push({ row: r, field: f }));
        });
      } else if (core.currentCell.value) {
        targets.push(core.currentCell.value);
      }
      const dirtyTargets = targets.filter((t) => t.row[t.field] !== '' && t.row[t.field] != null);
      if (dirtyTargets.length) {
        e.preventDefault();
        // 同一行可能被多个格命中，按行去重后再做一次 diff 事务
        const touchedRows = [...new Set(dirtyTargets.map((t) => t.row))];
        core.commitCells('清空单元格', touchedRows, () => {
          dirtyTargets.forEach((t) => {
            const def = core.columnDefs.value.find((d) => d.field === t.field);
            t.row[t.field] = def?.type === 'number' ? null : '';
            markDirty(t.row);
            core.validateCell(t.row, t.field);
          });
        });
        ElMessage.success(dirtyTargets.length > 1 ? `已清空 ${dirtyTargets.length} 个单元格` : '已清空');
      }
    }
  };

  return { gridActive, onKeydown, onWinMouseDown, onWinBlur, scrollCellIntoView, helpVisible };
}

/**
 * useGridKeys 的返回类型别名：导出 { gridActive, onKeydown, onWinMouseDown, onWinBlur,
 * scrollCellIntoView, helpVisible }，供 useGridMouse 装配与事件生命周期管理。
 */
export type GridKeys = ReturnType<typeof useGridKeys>;
