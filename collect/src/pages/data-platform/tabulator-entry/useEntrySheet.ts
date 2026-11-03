// Tabulator 网格底座：实例生命周期 / 列定义 ⇄ Tabulator 列 / 数据读写 / 选区与撤销重做
// ============================================================================
// 本文件职责：
//   1. 创建与销毁 Tabulator 实例（DOM 表格，行即对象，无画布 / 无网格坐标那一套）；
//   2. 把"列定义 + 记录数组"同步成 Tabulator 的列与数据，以及把整表读回成记录数组；
//   3. 列同步统一收口到 syncColumns：表头（必填红星）/ 列宽 / 可见性 / 编辑器 / 冻结 一次到位；
//   4. 错误与查找高亮走 DOM class（cell-error / cell-find），靠 reformat 重画；
//   5. 暴露选区信息（A1 / 尺寸 / 值矩阵）、撤销重做（自带快照栈，Tabulator 无命令栈）、明暗主题切换。
//
// 与另两套的关系：接口名刻意对齐 Univer 版（readRecords / writeRecords / applyDataBars /
//   selectionOrigin / revision …），所以校验/操作/导入导出 composables 可与 Univer 版共用同一套调用面。
//
// 关键约定：
//   - DOM 模型下"行即对象"，记录数组就是数据真相源；Tabulator 只做渲染；
//   - **记录对象按引用交给 Tabulator**（不拷贝）：粘贴 / 拖拽填充 / Delete 清空都是 Tabulator
//     内部 `row.updateData()` 原地改 `this.data`，共享同一批对象真相源才不会静默失联；
//   - **单元格选区走 selectableRange**（不是 selectableRows，两者互斥，源码里直接拒绝同时启用）；
//     剪贴板 / 填充柄 / Delete 清空 / 方向键导航都挂在这个模块上；
//   - 高亮与行定位一律以 `rowId` 为键（不是行号）：开了列头排序 / 筛选后行号会变，
//     按行号做键会让错误标红和查找命中错到别的行上；
//   - 撤销重做走自带快照栈（每次编辑前 / 结构性变更前 push 一份数据副本）。
// ============================================================================
import { ref, shallowRef } from 'vue';
// 注意：Tabulator 6 的 ESM 构建没有默认导出（只有命名导出 Tabulator / TabulatorFull）。
// Vite 走 exports.import → ESM，用默认导入会拿到 undefined；这里取完整构建 TabulatorFull。
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import type { CellComponent, ColumnComponent, ColumnDefinition, RowComponent } from 'tabulator-tables';
import { ensureRowIds, type ColDef, type EntryRecord } from './schema';

/** 选区快照：状态栏与批量操作的作用域来源 */
export interface SelectionInfo {
  a1: string;
  rows: number;
  cols: number;
  values: unknown[][];
}

/** 选区矩形：indices 是命中的数据下标（已排序），排序/筛选后仍指向真相源数组 */
export interface SelectionRect {
  row: number;
  col: number;
  rows: number;
  cols: number;
  indices: number[];
}

/** 右键菜单项（Tabulator Menu 模块的列级 contextMenu 项） */
export interface MenuItem {
  label: string;
  action?: (e: Event, cell: CellComponent) => void;
  separator?: boolean;
  disabled?: boolean;
}

/** 只用到范围组件的这两个查询方法 */
interface RangeLike {
  getRows(): RowComponent[];
  getColumns(): ColumnComponent[];
}

/** 列字母 → Excel 列名（0 → A，25 → Z，26 → AA） */
const colLetter = (index: number): string => {
  let n = index;
  let s = '';
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
};

/** 编辑器按列类型自选 */
const editorOf = (d: ColDef): { editor: unknown; editorParams?: Record<string, unknown> } => {
  switch (d.type) {
    case 'number':
      return { editor: 'number' };
    case 'select':
      return { editor: 'list', editorParams: { values: d.options ?? [] } };
    // 日期列存 YYYY-MM-DD 字符串，用文本编辑器录入，格式校验交给本地规则引擎（与另两套一致）
    case 'date':
    case 'text':
    default:
      return { editor: 'input' };
  }
};

/** 表头格式化：把「列名 + 红色 *」交给 Tabulator 渲染。
 *  Tabulator 5/6 的 titleFormatter 签名是 (mockCell, params, onRendered)——
 *  第一个参数是 mock cell（getValue() 是标题、getElement() 是表头元素），
 *  不是老版本的 (title, titleEl)。**必须返回字符串/Node**：返回 undefined 时
 *  Column._formatColumnHeaderTitle 会走 case "undefined" 把表头 innerHTML 清空。 */
const makeTitleFormatter =
  (label: string, required: boolean) =>
  (): string =>
    required
      ? `<span class="tb-th-label">${label}</span><span class="tb-req-star">*</span>`
      : `<span class="tb-th-label">${label}</span>`;

/** 转义 HTML：formatter 的返回值会被直接写进 innerHTML，
 *  不转义的话单元格里的 `<` / `&` 会被当成标签渲染（录入台必须原样显示用户输入）。 */
const escapeHtml = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 高亮键 = 行身份 + 字段。
 *  ⚠️ 不能用行号做键：开了列头排序或列筛选后行号会变，错误标红/查找命中会串到别的行上。 */
const rowKey = (cell: CellComponent, field: string): string =>
  `${String(cell.getRow().getData().rowId ?? '')}:${field}`;

/** 单元格格式化：错误 / 查找高亮 + 数值列数据条（三者互斥优先级：错误 > 查找 > 数据条） */
const makeFormatter =
  (field: string, isNumber: boolean, errorSet: Set<string>, findSet: Set<string>, bars: Map<string, { min: number; max: number }>) =>
  (cell: CellComponent): string => {
    const el = cell.getElement();
    const key = rowKey(cell, field);
    el.classList.remove('cell-error', 'cell-find', 'cell-num');
    el.style.background = '';
    const raw = cell.getValue();
    if (errorSet.has(key)) {
      el.classList.add('cell-error');
    } else if (findSet.has(key)) {
      el.classList.add('cell-find');
    } else if (isNumber && bars.has(field)) {
      const v = Number(raw);
      if (Number.isFinite(v)) {
        const { min, max } = bars.get(field)!;
        const ratio = max > min ? (v - min) / (max - min) : 0;
        const pct = Math.max(0, Math.min(1, ratio)) * 100;
        el.style.background = `linear-gradient(to right, var(--bi-primary) ${pct}%, transparent ${pct}%)`;
      }
    }
    if (isNumber && raw !== null && raw !== '') {
      el.classList.add('cell-num');
    }
    return escapeHtml(raw === null || raw === undefined ? '' : String(raw));
  };

/**
 * 创建并托管 Tabulator 实例。
 * 返回的读写方法全部命令式，调用方不必关心实例细节。
 */
export const useEntrySheet = () => {
  const ready = ref(false);
  const table = shallowRef<Tabulator | null>(null);
  const selection = ref<SelectionInfo | null>(null);
  /** 名称框：当前活动单元格 A1（点格时更新） */
  const activeCell = ref('—');
  /** 任何数据/结构变更自增一次，供上层 watch 触发重算与复检 */
  const revision = ref(0);

  const errorSet = new Set<string>();
  const findSet = new Set<string>();
  const bars = new Map<string, { min: number; max: number }>();

  /** 数据真相源：与 Tabulator 渲染的内容保持同步 */
  let data: EntryRecord[] = [];
  /** 当前列定义（同步列时用） */
  let cols: ColDef[] = [];
  /** 是否冻结首列（syncColumns 重建列时读取） */
  let freezeFirstOn = true;

  /** 行身份 → 真相源数组下标（结构性变更时重建；排序/筛选不影响它） */
  let idIndex = new Map<string, number>();
  /** 列级右键菜单项（页面注入；列重建时挂到每列的 contextMenu 上） */
  let cellMenu: MenuItem[] = [];

  const reindex = () => {
    idIndex = new Map();
    data.forEach((r, i) => {
      if (r.rowId != null) idIndex.set(String(r.rowId), i);
    });
  };

  /** 撤销重做快照栈 */
  const undoStack: EntryRecord[][] = [];
  const redoStack: EntryRecord[][] = [];

  const bump = () => {
    revision.value++;
  };

  /** 当前活动范围（未选中任何格返回 null） */
  const activeRange = (): RangeLike | null => {
    const t = table.value;
    if (!t || !ready.value) return null;
    const ranges = t.getRanges() as RangeLike[];
    return ranges[0] ?? null;
  };

  /** 重算状态栏选区信息（按真实矩形算，不再是"点一格算整行"） */
  const refreshSelection = () => {
    const range = activeRange();
    const rrows = range?.getRows() ?? [];
    const rcols = range?.getColumns() ?? [];
    if (!rrows.length || !rcols.length) {
      selection.value = null;
      activeCell.value = '—';
      return;
    }
    const fields = rcols.map((c) => c.getField() ?? '');
    const values = rrows.map((row) => {
      const rec = row.getData();
      return fields.map((f) => rec[f]);
    });
    // A1 用"可见列序号 + 显示行号"，与 Excel 名称框一致（排序/筛选后看到的就是屏幕上的位置）
    const visCols = table.value?.getColumns().filter((c) => c.isVisible()) ?? [];
    const colPos = visCols.findIndex((c) => (c.getField() ?? '') === fields[0]);
    const a1 = `${colLetter(Math.max(0, colPos))}${rrows[0].getPosition(true)}`;
    selection.value = { a1, rows: rrows.length, cols: rcols.length, values };
    activeCell.value = a1;
  };

  /** 列头筛选器：下拉列给「全部 + 选项」列表，其余给输入框（包含匹配） */
  const headerFilterOf = (d: ColDef): Record<string, unknown> =>
    d.type === 'select'
      ? { headerFilter: 'list', headerFilterParams: { values: ['', ...(d.options ?? [])] } }
      : { headerFilter: 'input' };

  /** 把列定义编译成 Tabulator 列配置 */
  const buildColumns = (defs: ColDef[]): ColumnDefinition[] =>
    defs.map((d, i) => ({
      title: d.label,
      field: d.field,
      width: d.width,
      visible: d.visible,
      // 首列"冻结"用自定义 sticky 类，而不是 frozen 选项：
      // SelectRange 在单元格范围模式下会警告「冻结列不是 range header」（该判定只对行选择模式成立），
      // 而 Tabulator 的 frozen 本来就是 CSS sticky 实现，自己挂类效果一致、还不触发那条误报。
      cssClass: i === 0 && freezeFirstOn ? 'tb-pin-col' : undefined,
      // 允许列头排序：高亮以 rowId 为键，排序不会让标红错行
      headerSort: true,
      // 数字按数值排，日期存 YYYY-MM-DD 定长串（字典序＝时间序），其余按字符串
      sorter: d.type === 'number' ? 'number' : 'string',
      ...headerFilterOf(d),
      contextMenu: cellMenu.length ? cellMenu : undefined,
      ...editorOf(d),
      formatter: makeFormatter(d.field, d.type === 'number', errorSet, findSet, bars) as never,
      titleFormatter: makeTitleFormatter(d.label, !!d.required) as never,
    }));

  /** 页面注入右键菜单（列重建时生效） */
  const setCellMenu = (items: MenuItem[]) => {
    cellMenu = items;
  };

  /** 设定首列冻结开关 */
  const setFrozenFirst = (v: boolean) => {
    freezeFirstOn = v;
  };

  /** 当前数据行数 */
  const dataRowCount = (): number => data.length;

  /** 重画所有行：Tabulator **表级没有 reformat()**，只有 RowComponent 有。
   *  直接 `table.reformat()` 会抛 "reformat is not a function"，这里逐行转发；
   *  未渲染的行在 Row.reinitialize 内部有 element 守卫，安全。 */
  const reformatRows = () => {
    const t = table.value;
    if (!t || !ready.value) return;
    t.getRows().forEach((row) => row.reformat());
  };

  /** 读整表：按列定义把行对象还原成记录数组（已是对象，原样返回即可）；defs 仅占位以对齐接口 */
  const readRecords = (_defs?: ColDef[]): EntryRecord[] => data.slice();

  /** 写整表。
   *  ⚠️ **不拷贝记录对象**：Tabulator 的粘贴（row.updateData）、拖拽填充（cell.setValue）、
   *  Delete 清空（range.clearValues）全都是原地改 `row.data`。只有把同一批对象交给它，
   *  这些改动才会直接落到真相源上；一旦拷贝，界面变了而 `data` 里还是旧值，后续导出/校验全是脏的。
   *  数组本身用 slice 复制，避免调用方持有的数组被我们替换时出现别名。 */
  const writeRecords = (records: EntryRecord[]) => {
    data = ensureRowIds(records.slice());
    reindex();
    const t = table.value;
    // 未建表时只更新真相源，等 tableBuilt 后的装配一次性同步，避免触发未初始化错误
    if (t && ready.value) {
      t.blockRedraw();
      t.setData(data as Record<string, unknown>[]);
      t.restoreRedraw();
    }
    refreshSelection();
    // 数据已变更：自增 revision，触发页面 watch 重算行数/脏行/复检（与另两套的命令式变更对齐）
    bump();
  };

  /** 列同步：表头 / 宽度 / 可见性 / 编辑器 / 冻结 一次到位（对应 Univer 的 writeHeader + 列宽 + 可见 + 验证 + 冻结） */
  const syncColumns = (defs: ColDef[]) => {
    cols = defs;
    const t = table.value;
    if (!t || !ready.value) return;
    t.blockRedraw();
    // 用 setColumns 重建列（数据保留），编辑器 / 标题 / 冻结随之生效
    t.setColumns(buildColumns(defs) as never);
    // 逐列按定义纠正可见性（setColumns 的 visible 在某些版本不生效，这里兜底）
    defs.forEach((d) => {
      const col = t.getColumn(d.field);
      if (!col) return;
      if (d.visible) col.show();
      else col.hide();
    });
    t.restoreRedraw();
    refreshSelection();
  };

  /** 数值列数据条：按当前数据算 min/max 后存入 bars，并重画 */
  const applyDataBars = (defs: ColDef[], on: boolean) => {
    bars.clear();
    if (on) {
      defs.forEach((d) => {
        if (d.type !== 'number') return;
        const nums = data
          .map((r) => Number(r[d.field]))
          .filter((n) => Number.isFinite(n));
        if (nums.length) bars.set(d.field, { min: Math.min(...nums), max: Math.max(...nums) });
      });
    }
    reformatRows();
  };

  /** 对外接口仍用「数据下标」，内部立刻折算成 rowId 键——渲染侧只认 rowId */
  const idKeyOf = (dataIndex: number, field: string): string | null => {
    const rid = data[dataIndex]?.rowId;
    return rid == null ? null : `${String(rid)}:${field}`;
  };

  /** 错误标红：把错误清单转成 rowId 键集合后重画 */
  const markErrors = (list: { dataIndex: number; field: string }[]) => {
    errorSet.clear();
    list.forEach((e) => {
      const k = idKeyOf(e.dataIndex, e.field);
      if (k) errorSet.add(k);
    });
    reformatRows();
  };

  /** 查找高亮：把命中清单转成 rowId 键集合后重画 */
  const markFind = (hits: { dataIndex: number; field: string }[]) => {
    findSet.clear();
    hits.forEach((h) => {
      const k = idKeyOf(h.dataIndex, h.field);
      if (k) findSet.add(k);
    });
    reformatRows();
  };

  /** 活动单元格 A1（名称框语义，随选区刷新） */
  const activeCellA1 = (): string => activeCell.value;

  /** 当前选区覆盖的数据行（矩形 → 真相源下标，已排序）。
   *  用 rowId 反查下标，而不是行号：开排序/筛选后行号是"屏幕位置"，直接当下标会改错行。 */
  const selectionOrigin = (): SelectionRect | null => {
    const range = activeRange();
    const rrows = range?.getRows() ?? [];
    const rcols = range?.getColumns() ?? [];
    if (!rrows.length || !rcols.length) return null;
    const indices = rrows
      .map((row) => idIndex.get(String(row.getData().rowId ?? '')) ?? -1)
      .filter((i) => i >= 0)
      .sort((a, b) => a - b);
    if (!indices.length) return null;
    const firstField = rcols[0].getField() ?? '';
    return {
      row: indices[0],
      col: Math.max(0, cols.findIndex((d) => d.field === firstField)),
      rows: indices.length,
      cols: rcols.length,
      indices,
    };
  };

  /** 滚动到指定数据行（按 rowId 定位；被筛选掉时先清筛选再滚，否则跳转会静默失效） */
  const scrollToRow = (index: number) => {
    const t = table.value;
    if (!t || !ready.value) return;
    const rid = data[index]?.rowId;
    if (rid == null) return;
    const id = String(rid);
    const shown = t.getRows().some((r) => String(r.getData().rowId ?? '') === id);
    if (!shown) {
      t.clearFilter(true);
      window.setTimeout(() => t.getRow(id)?.scrollTo?.(), 0);
      return;
    }
    t.getRow(id)?.scrollTo?.();
  };

  /** 选中某一个单元格（右键菜单先用它把选区挪到被点的格子，再复用同一套行操作） */
  const selectCell = (cell: CellComponent) => {
    const t = table.value;
    if (!t || !ready.value) return;
    t.addRange(cell, cell);
    refreshSelection();
  };

  /** 展示中的记录（导出「当前结果」用：列筛选后就是筛过的行） */
  const visibleRecords = (): EntryRecord[] => {
    const t = table.value;
    if (!t || !ready.value) return data.slice();
    return t.getRows().map((r) => r.getData() as EntryRecord);
  };

  /** 让表格容器可获得焦点：Keybindings 监听在 table.element 上，
   *  而 SelectRange 聚焦的是 .tabulator-tableholder（无 tabindex 时 focus() 无效），
   *  不补这一步方向键/Tab 会完全没反应。 */
  const focusGrid = () => {
    const t = table.value;
    const holder = t?.element?.querySelector('.tabulator-tableholder') as HTMLElement | null;
    if (!holder) return;
    if (!holder.contains(document.activeElement)) {
      if (!holder.hasAttribute('tabindex')) holder.setAttribute('tabindex', '0');
      holder.focus({ preventScroll: true });
    }
  };

  // ===================== 撤销重做（自带快照栈） =====================
  const cloneData = (): EntryRecord[] => data.map((r) => ({ ...r }));

  /** 编辑前 / 结构性变更前调用：压一份数据副本，清空重做栈 */
  const snapshot = () => {
    undoStack.push(cloneData());
    if (undoStack.length > 100) undoStack.shift();
    redoStack.length = 0;
  };

  const undo = () => {
    if (!undoStack.length) return;
    redoStack.push(cloneData());
    data = undoStack.pop() as EntryRecord[];
    reindex();
    const t = table.value;
    if (t && ready.value) {
      t.blockRedraw();
      t.setData(data as Record<string, unknown>[]);
      t.restoreRedraw();
    }
    refreshSelection();
    bump();
  };

  const redo = () => {
    if (!redoStack.length) return;
    undoStack.push(cloneData());
    data = redoStack.pop() as EntryRecord[];
    reindex();
    const t = table.value;
    if (t && ready.value) {
      t.blockRedraw();
      t.setData(data as Record<string, unknown>[]);
      t.restoreRedraw();
    }
    refreshSelection();
    bump();
  };

  /** 删除列（rebuild 时 syncColumns 会按新 defs 重建，这里仅作兜底） */
  const deleteColumn = (field: string) => {
    if (!ready.value) return;
    table.value?.deleteColumn(field);
  };

  /** 明暗主题：Tabulator 用 CSS 类驱动，这里只记录并触发一次重画（配色在 bi-entry.less / 本页样式里按 html.dark 处理） */
  const setDark = (_dark: boolean) => {
    if (!ready.value) return;
    table.value?.redraw(true);
  };

  /** 解绑 init 时挂在容器上的原生监听 */
  let detachNative: (() => void) | null = null;
  /** 批量写入的合并刷新定时器（填充柄 / 粘贴一次会连改多行） */
  let bulkTimer = 0;

  /** 初始化。
   *  注意：Tabulator 构造函数是**延迟建表**的（内部 `setTimeout(() => this._create())`），
   *  构造返回时 `initialized` 仍是 false、各管理器尚未 `initialize()`。
   *  此刻调用 setData / setColumns / redraw 会先刷 "Table Not Initialized" 警告，
   *  随后在数据加载器里抛错。故首屏的数据与列装配必须挂在 `tableBuilt` 上，
   *  由调用方通过 onBuilt 回调执行（事件绑定可以在构造后立即进行，官方推荐）。 */
  const init = (el: HTMLElement, onBuilt?: () => void) => {
    if (table.value) return;
    data = ensureRowIds(data);
    reindex();
    const t = new Tabulator(el, {
      // 固定高度：让表格在面板内虚拟滚动（列宽已定义，fitData 保留规定宽度并横向滚动）
      height: '100%',
      layout: 'fitData',
      // 行身份：getRow/getRowIndex 与行定位都靠它，而不是会随排序/筛选变动的行号
      index: 'rowId',
      // 单元格矩形选区（Excel 语义）。
      // ⚠️ 不能同时开 selectableRows：SelectRange.initialize() 里明确「cannot be used in
      // conjunction with row selection」，遇到行选择会打印警告并**直接不初始化**。
      selectableRange: 1,
      selectableRangeFill: true, // 选区右下角拖拽填充柄
      selectableRangeClearCells: true, // Delete / Backspace 清空选区
      selectableRangeInitializeDefault: false, // 不预置 [0,0] 选区，避免"没选也能删一行"
      // 与 Excel 互通：走原生 copy / paste 事件，纯 TSV 不夹带样式
      clipboard: true,
      clipboardCopyStyled: false,
      // 只复制选区：默认值是 'active'（整张表，还会带表头），必须改成 'range'，
      // SelectRange 为导出提供了 range 的行/列查找，行列都会收敛到选区矩形。
      clipboardCopyRowRange: 'range',
      // 导出配置：默认会带一行列标题（Excel 选区复制不带表头，保持一致）
      clipboardCopyConfig: { columnHeaders: false },
      clipboardPasteParser: 'range',
      clipboardPasteAction: 'range',
      // 单击=选中、双击/Enter=编辑（与 vxe、VTable 两套一致，也才不干扰拖拽框选）
      editTriggerEvent: 'dblclick',
      data: data as Record<string, unknown>[],
      columns: buildColumns(cols) as never,
    });
    table.value = t;

    // cellClick 的签名是 (event, cell)，第二个参数才是 CellComponent（坑）
    t.on('cellClick', () => {
      // 补一步聚焦：Keybindings 监听在 table.element 上，而 SelectRange 聚焦的是
      // .tabulator-tableholder（没有 tabindex 时 focus() 是空操作），不补则方向键完全没反应
      focusGrid();
      refreshSelection();
    });
    t.on('cellEditing', () => {
      // 编辑前快照，保证 Ctrl+Z 能回退单格编辑
      snapshot();
    });
    t.on('cellEdited', (cell: unknown) => {
      const c = cell as CellComponent;
      // 行对象与真相源是同一引用，Tabulator 已把新值原地写回；
      // 这里**不再按行号回写**——排序/筛选后行号是屏幕位置，那样会写错行。
      const rec = c.getRow().getData();
      const f = c.getField();
      if (f) rec[f] = c.getValue();
      bump();
      refreshSelection();
    });
    // 真正的建表完成点：此后 setData / setColumns / redraw 才安全
    t.on('tableBuilt', () => {
      ready.value = true;
      onBuilt?.();
    });

    // 批量写入（拖拽填充 / Ctrl+V 粘贴）走的是 row.updateData：一次改多行、且**不触发 cellEdited**，
    // 只发 rowUpdated。这里合并到下一个宏任务里统一刷新一次，否则状态栏的「改动 / 选中」不动。
    t.on('rowUpdated', () => {
      if (bulkTimer) return;
      bulkTimer = window.setTimeout(() => {
        bulkTimer = 0;
        if (!ready.value) return;
        refreshSelection();
        bump();
      }, 0);
    });

    // ---- 原生监听（SelectRange 只发内部事件，外部拿不到选区变化通知）----
    // 破坏性操作要在 Tabulator 处理之前在 capture 阶段入栈快照：
    // Delete/Backspace 清空选区、Ctrl+V 粘贴、Ctrl+X 剪切、Ctrl+D/R 填充都会绕过 cellEditing。
    const onCaptureKey = (ev: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null;
      // 正在单元格编辑器里打字时不入栈（否则每个退格都压一份快照）
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.isContentEditable)) {
        return;
      }
      const k = ev.key.toLowerCase();
      const mod = ev.ctrlKey || ev.metaKey;
      if (ev.key === 'Delete' || ev.key === 'Backspace') snapshot();
      else if (mod && (k === 'v' || k === 'x' || k === 'd' || k === 'r')) snapshot();
    };
    // 填充柄拖拽是一次不可分的批量变更，按下即快照
    const onCaptureDown = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (target?.closest('.tabulator-range-fill-handle')) snapshot();
    };
    el.addEventListener('keydown', onCaptureKey, true);
    el.addEventListener('mousedown', onCaptureDown, true);
    // 选区变化：鼠标抬起 / 键盘抬起兜住（拖拽框选、Shift+方向键、Ctrl+A 都在其中）
    const onSelectChange = () => refreshSelection();
    t.element.addEventListener('mouseup', onSelectChange);
    t.element.addEventListener('keyup', onSelectChange);

    detachNative = () => {
      el.removeEventListener('keydown', onCaptureKey, true);
      el.removeEventListener('mousedown', onCaptureDown, true);
      t.element?.removeEventListener('mouseup', onSelectChange);
      t.element?.removeEventListener('keyup', onSelectChange);
    };
  };

  /** 销毁 */
  const destroy = () => {
    if (bulkTimer) {
      window.clearTimeout(bulkTimer);
      bulkTimer = 0;
    }
    detachNative?.();
    detachNative = null;
    table.value?.destroy();
    table.value = null;
    selection.value = null;
    ready.value = false;
    undoStack.length = 0;
    redoStack.length = 0;
  };

  return {
    ready,
    table,
    selection,
    activeCell,
    revision,
    init,
    destroy,
    setDark,
    dataRowCount,
    readRecords,
    visibleRecords,
    writeRecords,
    syncColumns,
    applyDataBars,
    setFrozenFirst,
    setCellMenu,
    markErrors,
    markFind,
    activeCellA1,
    selectionOrigin,
    selectCell,
    scrollToRow,
    deleteColumn,
    snapshot,
    undo,
    redo,
  };
};

export type EntrySheet = ReturnType<typeof useEntrySheet>;
