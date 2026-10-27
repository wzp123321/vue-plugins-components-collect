// 列定义构建：把 ColDef 元信息编译为 vxe 列配置（显示渲染器 + element-plus 编辑渲染器 + 筛选器）
import { computed, nextTick, reactive, watch, ref, onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';
import type { GridCore } from './useGridCore';

/**
 * 把列类型编译为 vxe 编辑渲染器名称：number→dt-el-number、select→dt-el-select（带 options）、
 * date→dt-el-date、其余→dt-el-text。统一由 element-plus 组件实现（输入框无边框、编辑不高亮整列）。
 * @param d 列类型与下拉选项
 */
const makeEditRender = (d: { type: string; options?: string[] }) => {
  if (d.type === 'number') return { name: 'dt-el-number' };
  if (d.type === 'select') return { name: 'dt-el-select', options: d.options ?? [] };
  if (d.type === 'date') return { name: 'dt-el-date' };
  return { name: 'dt-el-text' };
};

// 序号列固定宽；数据列基准宽来自 ColDef.width，缺省 120
const SEQ_WIDTH = 52;
const DEFAULT_COL_WIDTH = 120;

/**
 * 列定义构建：把 ColDef 元信息编译为 vxe 列配置（显示渲染器 + element-plus 编辑渲染器 + 筛选器），
 * 并负责列宽自适应与拖拽列宽写回。
 *
 * 在整体架构中的角色：useGridCore 只持有 ColDef 元信息，本层是"元信息 → vxe 列配置"的唯一编译点；
 * 编辑渲染器统一走自研 dt-el-* 渲染器（element-plus 组件、输入框无边框、编辑不高亮整列）；
 * keyboardConfig 在此显式关闭 vxe 自带的键盘导航（isArrow/isTab/isEnter/isEdit/isChecked），
 * 改为由 useGridKeys 完全自管（避免与自研选区双轨冲突）。
 *
 * @param core 核心状态实例（读取 columnDefs / visibleDefs）
 * @param tableRef vxe 实例（loadColumn / getCellElement 等）
 */
export const useGridColumns = (core: GridCore, tableRef: Ref<any>) => {
  // ===================== 宽度自适应（表格盛满容器） =====================
  // ⚠️ 坑：vxe 列宽只认 px——% 宽会被 XEUtils.toInteger（parseInt）截断成整数百分比，8 列累计最多差 7px 缝隙；
  // 官方 fit 参数已标注"可能废弃，不要使用"。故在此把基准宽度按 body 可视宽等比换算成 px：
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

  /**
   * 编译列配置：首列固定 seq 序号列（宽 SEQ_WIDTH），随后按 visibleDefs 生成数据列——
   * 列宽取 allocWidths 的等比 px、resizable/sortable 开启、必填列加 dt-col-req 类名、
   * 显示渲染器 dt-cell-display、select 列挂 filters（供表头筛选）。列重建后 wrapper 可能被替换，异步补量宽度。
   */
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
        // ⚠️ 必填星号挂在表头上：vxe 的 className 只作用于 body 单元格，表头专属 headerClassName
        // （见 vxe-pc-ui/types/components/column.d.ts: className=给单元格、headerClassName=给表头）
        headerClassName: d.required ? 'dt-col-req' : '',
        cellRender: { name: 'dt-cell-display', ctype: d.type, options: d.options ?? [], field: d.field },
        // 自定义筛选面板：vxe 默认只支持"候选值复选"，文本/数字/日期列没有筛选入口。
        // 统一挂 dt-filter 渲染器（见 components/cells/FilterPanel.vue），普通列给空 filters 让表头出现筛选按钮
        filterRender: { name: 'dt-filter' },
      };
      if (d.type === 'select' && d.options?.length) {
        col.filters = d.options.map((o) => ({ label: o, value: o, checked: false }));
      } else {
        col.filters = [];
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
  // ⚠️ 坑：键盘导航（方向键/Tab/Enter/空格/F2/编辑/勾选）全部由 useGridKeys 自管，故在此显式关闭 vxe 的
  // isArrow/isTab/isEnter/isDel/isBack/isEdit/isChecked——因为 vxe 全部键盘处理依赖 editStore.selected，
  // 仅 mouse-config.selected:true 时才有值；本项目关闭了 selected，必须自管，否则键盘与选区双轨冲突。
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

  // ===================== 拖拽列宽写回 =====================
  // ⚠️ 坑：vxe 的 resizable 只改 DOM 列宽，defs.width 不变 → 一旦列配置重建（加列/撤销/套模板）宽度就回弹。
  // 这里把"实际像素宽"按当前等比换算比例反算回基准宽，落盘后再由 columns 重建列。
  // 这里把"实际像素宽"按当前等比换算比例反算回基准宽，落盘后再由 columns 重建列。
  // 拖拽过程会连续触发，故防抖到停手后再写（重建列会打断拖拽手感）
  let widthTimer: number | null = null;
  const onResizableChange = (p: any) => {
    const field = p?.column?.field;
    const px = Number(p?.resizeWidth);
    if (!field || !px || px <= 0) return;
    const vis = core.columnDefs.value.filter((d) => d.visible);
    const sumBase = vis.reduce((a, d) => a + (d.width ?? DEFAULT_COL_WIDTH), 0);
    const avail = bodyWidth.value - SEQ_WIDTH - 1;
    if (avail <= 0 || sumBase <= 0) return;
    // 实际宽 = 基准宽 × (avail / sumBase) → 基准宽 = 实际宽 ÷ 该比例
    const ratio = avail / sumBase;
    const base = Math.max(60, Math.round(px / (ratio || 1)));
    if (widthTimer) window.clearTimeout(widthTimer);
    widthTimer = window.setTimeout(() => {
      widthTimer = null;
      const def = core.columnDefs.value.find((d) => d.field === field);
      if (!def || def.width === base) return;
      def.width = base;
      // columns 是 computed（依赖 columnDefs），赋值后 watch 会自动 applyColumns
    }, 260);
  };

  onBeforeUnmount(() => {
    bodyRO?.disconnect();
    bodyRO = null;
    observedEl = null;
    if (widthTimer) window.clearTimeout(widthTimer);
  });

  return {
    columns,
    editConfig,
    keyboardConfig,
    applyColumns,
    syncBodyWidth,
    onResizableChange,
  };
}
