// 鼠标/剪贴板交互协调层：右键上下文菜单 / 复制粘贴 / 网格高度自适应 / window 级事件生命周期
// 三个子状态机已抽出：useFillHandle（填充手柄）、useCopyMarquee（复制蚂蚁线）、useGridKeys（键盘导航），
// 本 hook 负责装配三者、协调跨状态机动作（如 Esc 同时关菜单 + 消蚂蚁线）并统一管理监听生命周期
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { GridCore } from './useGridCore';
import type { GridIO } from './useGridIO';
import type { GridFindReplace } from './useGridFindReplace';
import type { GridOps } from './useGridOps';
import type { CellSelection } from './useCellSelection';
import { useFillHandle } from './useFillHandle';
import { useCopyMarquee } from './useCopyMarquee';
import { useGridKeys } from './useGridKeys';

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
 * 鼠标 / 剪贴板交互协调层：右键上下文菜单 + 复制粘贴 + 网格高度自适应 + window 级事件生命周期。
 *
 * 在整体架构中的角色：本层是"装配中枢"——它实例化两个子状态机（useFillHandle 填充手柄、
 * useCopyMarquee 复制蚂蚁线）与 useGridKeys 键盘层，并负责协调跨状态机动作
 * （如 Esc 同时关菜单 + 消蚂蚁线）以及统一管理所有 window 级监听的挂载/卸载。
 * 关键约定：copy/paste/contextmenu 等事件必须挂 window（派发在 activeElement / 顶层 fixed 菜单上，
 * 挂在 gridWrapper 收不到），并用 gridActive 标志判作用域、输入框 target 豁免。
 *
 * @param core 核心状态实例
 * @param tableRef vxe 实例
 * @param deps 协调依赖：gridBox/gridWrapper 容器、io 剪贴板、find 查找、ops 数据操作、sel 选区
 */
export const useGridMouse = (
  core: GridCore,
  tableRef: Ref<any>,
  deps: {
    gridBox: Ref<HTMLElement | undefined>;
    gridWrapper: Ref<HTMLElement | undefined>;
    io: GridIO;
    find: GridFindReplace;
    ops: GridOps;
    sel: CellSelection;
  },
) => {
  const { gridBox, gridWrapper, io, find, ops, sel } = deps;
  const snap = () => core.pushSnapshot(core.snapshotNow());

  // ===================== 子状态机装配 =====================
  const fill = useFillHandle(core, tableRef, sel, gridBox);
  const marquee = useCopyMarquee(core, tableRef, sel, gridBox);

  // ===================== 网格高度自适应 =====================
  const gridHeight = ref(560);
  let gridRO: ResizeObserver | null = null;
  const syncGridHeight = () => {
    const hgt = gridBox.value?.clientHeight ?? 0;
    if (hgt > 0) gridHeight.value = hgt;
  };

  // ===================== 右键上下文菜单 =====================
  const menu = reactive({ show: false, style: { top: '0px', left: '0px' }, rowId: '', field: '' });
  // ⚠️ 坑：右键取格不能依赖 vxe 的 getActiveCell（非 OSS 方法、会拿到过期值），一律用坐标 →
  // .vxe-body--row@rowid + .vxe-body--column@colid 降级解析。且菜单（fixed 定位）打开时会遮住其它单元格，
  // 直接 elementFromPoint 会拿到菜单自身——故先将菜单临时隐身再取点，保证"菜单开着也能右键别处"。
  const cellFromPoint = (x: number, y: number): { rowId: string; field: string } | null => {
    const menuEl = document.querySelector('.dt-menu') as HTMLElement | null;
    const prevVis = menuEl?.style.visibility;
    if (menuEl) menuEl.style.visibility = 'hidden';
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (menuEl) menuEl.style.visibility = prevVis || '';
    const tr = el?.closest('.vxe-body--row') as HTMLElement | null;
    const rowid = tr?.getAttribute('rowid');
    if (!rowid) return null;
    const td = el?.closest('.vxe-body--column') as HTMLElement | null;
    const colid = td?.getAttribute('colid');
    const field = (colid ? tableRef.value?.getColumnById?.(colid)?.field : '') || '';
    if (!field) return null;
    return { rowId: rowid, field };
  };
  // ⚠️ 坑：contextmenu 监听必须挂 window——菜单（fixed 定位）打开时会成为事件的 target，
  // 挂在 gridWrapper 上收不到"被菜单遮住的单元格"的右键；网格外右键则关菜单并放行原生菜单。
  const onContextMenu = (e: MouseEvent) => {
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (!cell) {
      menu.show = false;
      return;
    }
    e.preventDefault();
    const row = core.allRows.value.find((r) => rowIdOf(r) === cell.rowId);
    if (!row) {
      menu.show = false;
      return;
    }
    menu.rowId = rowIdOf(row);
    menu.field = cell.field;
    // 右键落在已有选区内时保留框选（Excel 中选区内右键不清选区）；落在选区外则正常塌缩为单击格
    if (sel.isCellSelected(rowIdOf(row), cell.field)) {
      sel.setCurrentKeepSel(row, cell.field);
    } else {
      core.currentCell.value = { row, field: cell.field };
    }
    menu.style.top = `${e.clientY}px`;
    menu.style.left = `${e.clientX}px`;
    menu.show = true;
  };
  /** 关闭右键菜单（点击空白 / 执行菜单项后调用） */
  const closeMenu = () => {
    menu.show = false;
  };
  /**
   * 执行右键菜单动作：copy（亮蚂蚁线）/ paste / insertUp / insertDown（插入行）/ clear（清格）/ deleteRow（删行）。
   * 写数据前统一 snap() 入撤销栈；复制/粘贴分别委托 io + marquee 完成。
   * @param act 菜单动作标识
   */
  const menuAct = (act: string) => {
    menu.show = false;
    const row = core.allRows.value.find((r) => rowIdOf(r) === menu.rowId);
    if (!row) return;
    if (act === 'copy') {
      // 复制成功才亮蚂蚁线；copySelection 内部已完成剪贴板写入与提示
      io.copySelection().then((ok) => {
        if (ok) marquee.markCopied();
      });
      return;
    }
    if (act === 'paste') {
      io.pasteFromClipboard();
      return;
    }
    if (act === 'insertUp' || act === 'insertDown') {
      snap();
      const nr = core.makeRow();
      markDirty(nr);
      core.validateRow(nr);
      const idx = core.allRows.value.findIndex((r) => rowIdOf(r) === rowIdOf(row));
      core.allRows.value.splice(act === 'insertUp' ? idx : idx + 1, 0, nr);
      core.bumpData();
      ops.locateRow(nr);
      ElMessage.success('已插入行');
    } else if (act === 'clear') {
      core.commitCells('清空单元格', [row], () => {
        row[menu.field] = core.columnDefs.value.find((d) => d.field === menu.field)?.type === 'number' ? null : '';
        markDirty(row);
        core.validateCell(row, menu.field);
      });
      ElMessage.success('已清空');
    } else if (act === 'deleteRow') {
      snap();
      core.allRows.value = core.allRows.value.filter((r) => rowIdOf(r) !== rowIdOf(row));
      Object.keys(core.cellErrors).forEach((k) => {
        if (k.startsWith(`${rowIdOf(row)}__`)) delete core.cellErrors[k];
      });
      core.bumpData();
      ElMessage.success('已删除本行');
    }
  };

  // ===================== 键盘（子 hook） =====================
  const keys = useGridKeys(core, tableRef, sel, find, {
    gridBox,
    gridWrapper,
    // Esc 同时协调两个状态机：关右键菜单 + 取消复制蚂蚁线（Excel 中 Esc 即取消复制）
    onEscape: () => {
      closeMenu();
      marquee.clearCopied();
    },
    // Tab 到末行末尾自动续行：转调数据操作层的 addRow（返回新行供键盘层定位）
    appendRow: () => ops.addRow(),
  });

  // ===================== 剪贴板 =====================
  const isFieldTarget = (t: EventTarget | null) => {
    const tag = (t as HTMLElement | null)?.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
  };
  const onCopy = (e: ClipboardEvent) => {
    // 工具栏/查找条输入框内的复制放行原生行为，避免劫持用户复制文本
    if (isFieldTarget(e.target)) return;
    // ⚠️ 坑：copy/paste 监听必须挂 window——剪贴板事件派发在 document.activeElement 上（点击单元格后
    // vxe 不做 DOM 聚焦，activeElement 仍是 body），挂在 gridWrapper 上不在事件路径上、永远收不到；
    // 用 gridActive 标志判作用域（输入框 target 已在前方豁免）。
    if (!keys.gridActive.value) return;
    const tsv = io.buildCopyTsv();
    if (tsv) {
      e.preventDefault();
      e.clipboardData?.setData('text/plain', tsv);
      // 复制成功即亮蚂蚁线（Excel 的标志性复制反馈），直到再次复制 / 粘贴 / Esc
      marquee.markCopied();
    }
  };
  const onPaste = (e: ClipboardEvent) => {
    if (isFieldTarget(e.target)) return;
    if (!keys.gridActive.value) return;
    const text = e.clipboardData?.getData('text');
    if (text) {
      e.preventDefault();
      io.applyPasteText(text);
      // Excel 语义：粘贴后源区域蚂蚁线消失（内容已落位，改为闪烁高亮目标区）
      marquee.clearCopied();
    }
  };

  // ===================== DOM 事件生命周期 =====================
  let bodyScrollEl: HTMLElement | null = null;
  // ⚠️ 坑：真正滚动的是 .vxe-table--body-inner-wrapper；外层 .vxe-table--body-wrapper 是 overflow:hidden 的定位壳
  // （绑滚动监听别绑错）。滚动时隐藏填充手柄（虚拟滚动下坐标会偏移）并重定位复制蚂蚁线（蚂蚁线随区域一起滚动）。
  const onBodyScroll = () => {
    fill.hideFillHandle();
    marquee.refreshCopyMarquee();
  };
  onMounted(() => {
    if (typeof ResizeObserver !== 'undefined' && gridBox.value) {
      gridRO = new ResizeObserver(() => syncGridHeight());
      gridRO.observe(gridBox.value);
    }
    window.addEventListener('copy', onCopy);
    window.addEventListener('paste', onPaste);
    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('keydown', keys.onKeydown);
    window.addEventListener('mousedown', keys.onWinMouseDown);
    window.addEventListener('blur', keys.onWinBlur);
    window.addEventListener('click', closeMenu);
    bodyScrollEl = gridBox.value?.querySelector('.vxe-table--body-inner-wrapper') ?? null;
    bodyScrollEl?.addEventListener('scroll', onBodyScroll);
  });
  onBeforeUnmount(() => {
    gridRO?.disconnect();
    gridRO = null;
    window.removeEventListener('copy', onCopy);
    window.removeEventListener('paste', onPaste);
    window.removeEventListener('contextmenu', onContextMenu);
    window.removeEventListener('keydown', keys.onKeydown);
    window.removeEventListener('mousedown', keys.onWinMouseDown);
    window.removeEventListener('blur', keys.onWinBlur);
    window.removeEventListener('click', closeMenu);
    bodyScrollEl?.removeEventListener('scroll', onBodyScroll);
    bodyScrollEl = null;
  });

  return {
    // 网格高度
    gridHeight,
    syncGridHeight,
    // 填充手柄（子 hook 透出）
    ...fill,
    // 复制蚂蚁线（子 hook 透出）
    ...marquee,
    // 快捷键帮助（F1，来自键盘子 hook）
    helpVisible: keys.helpVisible,
    // 右键菜单
    menu,
    closeMenu,
    onContextMenu,
    menuAct,
  };
}

/**
 * useGridMouse 的返回类型别名：透出网格高度（gridHeight/syncGridHeight）、填充手柄、复制蚂蚁线、
 * 快捷键帮助（helpVisible）、右键菜单（menu/closeMenu/onContextMenu/menuAct）等供模板与事件绑定。
 */
export type GridMouse = ReturnType<typeof useGridMouse>;
