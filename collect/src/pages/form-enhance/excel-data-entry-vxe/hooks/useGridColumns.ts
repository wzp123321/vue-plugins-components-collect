// 列定义构建：把 ColDef 元信息编译为 vxe 列配置（显示渲染器 + element-plus 编辑渲染器 + 筛选器）
import { computed, nextTick, reactive, watch, ref, onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';
import type { GridCore } from './useGridCore';

const makeEditRender = (d: { type: string; options?: string[] }) =>
  d.type === 'number'
    ? { name: 'dt-el-number' }
    : d.type === 'select'
      ? { name: 'dt-el-select', options: d.options ?? [] }
      : d.type === 'date'
        ? { name: 'dt-el-date' }
        : { name: 'dt-el-text' };

// 序号列固定宽；数据列基准宽来自 ColDef.width，缺省 120
const SEQ_WIDTH = 52;
const DEFAULT_COL_WIDTH = 120;

export function useGridColumns(core: GridCore, tableRef: Ref<any>) {
  // ===================== 宽度自适应（表格盛满容器） =====================
  // vxe 列宽只认 px：% 宽会被 XEUtils.toInteger（parseInt）截断成整数百分比，8 列累计最多差 7px 缝隙；
  // 官方 fit 参数已标注"可能废弃"。故在此把基准宽度按 body 可视宽等比换算成 px：
  // 末列吸收取整余量、整体再留 1px 冗余，保证列宽总和精确等于可视宽（不触发横向滚动条）。
  // bodyWidth 量的是 .vxe-table--body-wrapper.body--wrapper（overflow:hidden 的外层，
  // 与 vxe 内部 autoCellWidth 取 clientWidth 的是同一个元素），并用 ResizeObserver 跟随变化。
  const bodyWidth = ref(0);
  const allocWidths = (): number[] => {
    const vis = core.columnDefs.value.filter((d) => d.visible);
    const base = vis.map((d) => d.width ?? DEFAULT_COL_WIDTH);
    const sum = base.reduce((a, b) => a + b, 0);
    const avail = bodyWidth.value > 0 ? bodyWidth.value - SEQ_WIDTH - 1 : 0;
    if (avail <= 0 || sum <= 0) return base;
    const ws = base.map((b) => Math.floor((b / sum) * avail));
    ws[ws.length - 1] = avail - ws.slice(0, -1).reduce((a, b) => a + b, 0);
    return ws;
  };

  let bodyRO: ResizeObserver | null = null;
  let observedEl: HTMLElement | null = null;
  const syncBodyWidth = () => {
    const el = (tableRef.value?.$el?.querySelector?.('.vxe-table--body-wrapper.body--wrapper') as HTMLElement) ?? null;
    if (el && el.clientWidth > 0) bodyWidth.value = el.clientWidth;
    // wrapper 元素若被 vxe 重建（loadColumn 全量刷新等），重新挂监听
    if (el !== observedEl) {
      bodyRO?.disconnect();
      observedEl = el;
      if (el && typeof ResizeObserver !== 'undefined') {
        bodyRO = new ResizeObserver(() => {
          if (el.clientWidth > 0) bodyWidth.value = el.clientWidth;
        });
        bodyRO.observe(el);
      }
    }
  };

  const buildColumns = (): any[] => {
    // 行选中（复选框列）已移除：批量操作统一以框选区域为作用域（Excel 语义）
    const cols: any[] = [{ type: 'seq', width: SEQ_WIDTH, fixed: 'left', title: '#', align: 'center' }];
    const vis = core.columnDefs.value.filter((d) => d.visible);
    const widths = allocWidths();
    vis.forEach((d, i) => {
      const col: any = {
        field: d.field,
        title: d.label,
        minWidth: 110,
        width: widths[i],
        resizable: true,
        sortable: true,
        fixed: d.frozen ? 'left' : undefined,
        className: d.required ? 'dt-col-req' : '',
        cellRender: { name: 'dt-cell-display', ctype: d.type, options: d.options ?? [], field: d.field },
      };
      if (d.type === 'select' && d.options?.length) {
        col.filters = d.options.map((o) => ({ label: o, value: o, checked: false }));
      }
      col.editRender = makeEditRender(d);
      cols.push(col);
    });
    return cols;
  };
  const columns = computed(() => buildColumns());

  const editConfig = reactive({ trigger: 'dblclick' as const, mode: 'cell' as const });
  // 键盘导航（方向键/Tab/Enter/空格/F2）全部由 useGridMouse 自管：
  // vxe OSS 方向键不感知 Shift，且其内部 selected 态与自研选区双轨运行会冲突，故显式关闭
  const keyboardConfig = reactive({
    isArrow: false,
    isTab: false,
    isEnter: false,
    isDel: false,
    isBack: false,
    isEdit: false,
    isChecked: false,
    isEsc: true,
  });

  /** 把编译后的列配置灌入 vxe（loadColumn 全量刷新）；列重建后 wrapper 可能被替换，异步补量宽度 */
  const applyColumns = () => {
    tableRef.value?.loadColumn?.(columns.value);
    // 列重建后 wrapper 可能被替换，且首帧前还没有 wrapper：异步补量宽度并（重）挂监听
    nextTick(syncBodyWidth);
  };
  watch(columns, () => nextTick(applyColumns));

  onBeforeUnmount(() => {
    bodyRO?.disconnect();
    bodyRO = null;
    observedEl = null;
  });

  return {
    columns,
    editConfig,
    keyboardConfig,
    applyColumns,
    syncBodyWidth,
  };
}
