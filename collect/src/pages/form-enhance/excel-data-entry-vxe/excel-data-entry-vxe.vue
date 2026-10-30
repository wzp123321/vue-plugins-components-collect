<!--
  录入台主组件（页面入口 · Excel 式数据录入台）
  ============================================================================
  本文件职责：
    1. 组装页面布局与顶层 UI（标题/统计、工具栏、查找条、填充条、查询 chips、
       表格本体、复制蚂蚁线、右键菜单、状态栏、分页、各弹窗/抽屉）。
    2. 装配所有业务 hooks（core / columns / scroll / ops / tpl / demo / io / find / mouse / sel）
       并把它们"接线"到 vxe-table 的事件与各类子组件上。
    3. 承担少量"页面级协调"逻辑：表头点击选列/全选、查询 chips 清除、单元格样式计算、
       单元格点击分发。

  在整体架构中的角色：作为"装配层 / 协调层"，本身不实现数据校验、框选、填充、剪贴板、
  键盘导航等复杂逻辑（这些下沉到 hooks 与各子状态机），只负责把 hooks 暴露的状态与动作
  绑定到 vxe-table 与 UI 组件。

  协作模块：
    - hooks/*：全部业务逻辑（数据/校验/历史/查询/统计/列/滚动/操作/模板/压测/导入导出/查找/鼠标键盘/框选）。
    - components/cells/*：vxe 渲染器（element-plus 编辑器 + 显示渲染器）。
    - components/*.vue：各类 UI 组件（工具栏、抽屉、弹窗、状态条等）。

  关键架构约定（详见各对应代码处 ⚠️ 注释）：
    - cell-area 是 vxe pro 功能，OSS 版无实现 → 选区（框选/整行/整列/全选）全部自研（useCellSelection）。
    - 编辑单元格必须用 element-plus 组件（见下方 .dt-el-editor 样式），输入框无边框、
      编辑不高亮整列。
    - 列宽只认 px；% 宽会被 XEUtils.toInteger 截断成整数百分比（列宽换算在 useGridColumns）。
    - vxe 表头事件名是 header-cell-click，列宽变更事件名是 column-resizable-change（不可拼错）。
    - 状态栏统计为"双轨"：当前列全量统计（activeStats）+ 选区内数字格聚合（selectionStats）。
    - 复制蚂蚁线：copiedRect 独立快照 + copyMarquee SVG overlay（stroke-dashoffset 循环动画）；
      box-shadow 不支持 dashed，故用 SVG rect 而非 box-shadow。
  ============================================================================
-->
<template>
  <div class="dt-page bi-page" ref="gridWrapper">
    <!-- 顶部标题 -->
    <div class="dt-header bi-header">
      <div class="dt-title bi-title">
        <span class="dt-logo bi-logo">表</span>
        <div>
          <h3>网页端 Excel 数据录入台</h3>
          <p class="dt-sub bi-sub">vxe-table · 数据中台录入台 · 虚拟滚动 / 框选 / 填充 / 校验</p>
        </div>
      </div>
      <div class="dt-stats bi-stats">
        <span class="stat-pill"><b>{{ processedRows.length.toLocaleString() }}</b> 行</span>
        <span class="stat-pill warn"><b>{{ dirtyCount }}</b> 改动</span>
        <span class="stat-pill danger"><b>{{ errorCount }}</b> 错误</span>
        <span class="stat-pill ok"><b>{{ selectionCount }}</b> 选中</span>
        <span v-if="lastGen" class="stat-pill info">{{ lastGen }}</span>
      </div>
    </div>

    <!-- 工具栏 / 查找替换条 / 查询条件 chips / 批量填充面板 -->
    <GridToolbar :core="core" :ops="ops" :tpl="tpl" :demo="demo" :io="io" :find="find" />
    <GridQueryChips
      :core="core"
      :on-clear-filter="clearFilterChip"
      :on-clear-sort="clearSortChip"
      :on-clear-all="clearAllQuery"
    />
    <GridFindBar :find="find" />
    <GridFillBar :core="core" :ops="ops" />

    <!-- 表格 -->
    <div class="dt-grid bi-panel" ref="gridBox">
      <VxeTable
        ref="tableRef"
        :data="pagedRows"
        :edit-config="editConfig"
        :keyboard-config="keyboardConfig"
        :mouse-config="{ selected: false }"
        :sort-config="{ trigger: 'default', remote: true, multiple: true }"
        :filter-config="{ remote: true }"
        :tooltip-config="{ mode: 'title' }"
        :row-config="{ keyField: '__id', isHover: true }"
        :cell-config="{ height: 36 }"
        :header-cell-config="{ height: 38 }"
        :column-config="{ resizable: true }"
        :show-overflow="true"
        :border="true"
        :show-footer="showFooter"
        :footer-data="footerData"
        :scroll-y="{ enabled: true, gt: 10 }"
        :scroll-x="{ enabled: true, gt: 0 }"
        :height="gridHeight"
        :auto-resize="true"
        :cell-class-name="cellClassName"
        :row-class-name="rowClassName"
        @cell-click="onCellClick"
        @header-cell-click="onHeaderClick"
        @column-resizable-change="gridColumns.onResizableChange"
        @sort-change="onSortChange"
        @filter-change="onFilterChange"
        @edit-actived="onEditActived"
        @edit-closed="onEditClosed"
      />
      <!-- 拖拽填充手柄（双击 = 填充至参照列末行） -->
      <div
        v-show="fillHandle.show"
        class="dt-fillhandle"
        :style="fillHandle.style"
        title="拖拽填充（向上下左右）· 双击填至末行"
        @pointerdown.stop.prevent="startFill"
      />
      <!-- 复制蚂蚁线（Excel：Ctrl+C 后源区域的虚线动画边框，标记剪贴板内容来源） -->
      <div v-show="copyMarquee.show" class="dt-copymarquee" :style="copyMarquee.style">
        <svg :width="copyMarquee.w" :height="copyMarquee.h">
          <rect :x="1" :y="1" :width="Math.max(copyMarquee.w - 2, 0)" :height="Math.max(copyMarquee.h - 2, 0)" rx="2" />
        </svg>
      </div>
    </div>

    <!-- 右键上下文菜单 -->
    <GridContextMenu :mouse="mouse" />

    <!-- 快捷键帮助（F1） -->
    <GridHelpDialog :visible="helpVisible" @close="helpVisible = false" />

    <!-- 状态栏 -->
    <div class="dt-statusbar bi-statusbar">
      <span class="sb-item pos">{{ posLabel }}</span>
      <span class="sb-item">行数 <b>{{ processedRows.length.toLocaleString() }}</b></span>
      <span class="sb-item">改动 <b :class="{ 'c-warn': dirtyCount > 0 }">{{ dirtyCount }}</b></span>
      <span class="sb-item">选中 <b :class="{ 'c-ok': selectionCount > 0 }">{{ selectionCount }}</b></span>
      <span class="sb-item">错误 <b :class="{ 'c-danger': errorCount > 0 }">{{ errorCount }}</b></span>
      <!-- 状态栏统计双轨之一：当前列全量统计（计数/求和/平均/最大/最小） -->
      <template v-if="activeStats">
        <span class="sb-sep" />
        <span class="sb-item">{{ activeColLabel }}：</span>
        <span class="sb-item">计数 <b>{{ activeStats.count }}</b></span>
        <span class="sb-item">求和 <b>{{ activeStats.sum }}</b></span>
        <span class="sb-item">平均 <b>{{ activeStats.avg }}</b></span>
        <span class="sb-item">最大 <b>{{ activeStats.max }}</b></span>
        <span class="sb-item">最小 <b>{{ activeStats.min }}</b></span>
      </template>
      <!-- 状态栏统计双轨之二：选区内数字格聚合（仅当选区存在且有数字格时显示） -->
      <template v-if="selectionStats">
        <span class="sb-sep" />
        <span class="sb-item">选区统计：</span>
        <span class="sb-item">计数 <b>{{ selectionStats.count }}</b></span>
        <span class="sb-item">求和 <b>{{ selectionStats.sum }}</b></span>
        <span class="sb-item">平均 <b>{{ selectionStats.avg }}</b></span>
        <span class="sb-item">最大 <b>{{ selectionStats.max }}</b></span>
        <span class="sb-item">最小 <b>{{ selectionStats.min }}</b></span>
      </template>
      <span class="sb-tip">F1 快捷键 · 拖右下角方块填充（双击填到底）· Ctrl+D 向下 / Ctrl+R 向右填充 · 右键菜单</span>
    </div>

    <!-- 分页（仅分页模式） -->
    <div v-if="viewMode === 'paged'" class="dt-pager">
      <el-pagination
        v-model:current-page="pager.currentPage"
        v-model:page-size="pager.pageSize"
        :total="processedRows.length"
        :page-sizes="[50, 100, 200, 500]"
        layout="total, sizes, prev, pager, next, jumper"
        background
      />
    </div>

    <!-- 弹窗与抽屉 -->
    <AddColumnDialog :ops="ops" />
    <ColumnManagerDrawer :core="core" :ops="ops" />
    <ColumnConfigDrawer :core="core" :ops="ops" :field="configField" v-model:visible="configDrawer" />
    <ErrorDrawer :core="core" :ops="ops" />
    <TemplateDialog :tpl="tpl" />

    <!-- 隐藏的文件选择 input：导入 Excel 时触发；始终留在 DOM 上以便随时调用 -->
    <input ref="fileInputRef" type="file" accept=".xlsx,.xls" style="display: none" @change="onFileChange" />
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, onMounted, computed, watch } from 'vue';
import { VxeTable } from 'vxe-table';
import 'vxe-table/es/style.css';
import { registerAllRenderers } from './components/cells';
import GridToolbar from './components/GridToolbar.vue';
import GridFindBar from './components/GridFindBar.vue';
import GridFillBar from './components/GridFillBar.vue';
import GridQueryChips from './components/GridQueryChips.vue';
import GridContextMenu from './components/GridContextMenu.vue';
import GridHelpDialog from './components/GridHelpDialog.vue';
import AddColumnDialog from './components/AddColumnDialog.vue';
import ColumnManagerDrawer from './components/ColumnManagerDrawer.vue';
import ColumnConfigDrawer from './components/ColumnConfigDrawer.vue';
import ErrorDrawer from './components/ErrorDrawer.vue';
import TemplateDialog from './components/TemplateDialog.vue';
import { useGridCore, rowIdOf, dirtyOf } from './hooks/useGridCore';
import { useGridColumns } from './hooks/useGridColumns';
import { useGridScroll } from './hooks/useGridScroll';
import { useGridOps } from './hooks/useGridOps';
import { useGridTemplates } from './hooks/useGridTemplates';
import { useGridDemoData } from './hooks/useGridDemoData';
import { useGridIO } from './hooks/useGridIO';
import { useGridFindReplace } from './hooks/useGridFindReplace';
import { useGridMouse } from './hooks/useGridMouse';
import { useCellSelection } from './hooks/useCellSelection';

defineOptions({ name: 'ExcelDataEntryVxe' });
// 注册 vxe 渲染器：element-plus 单元格编辑器 + 单元格显示渲染器
registerAllRenderers();

// ===================== 页面级引用 =====================
// gridWrapper：整页根容器（copy/paste/contextmenu 等全局监听挂载点参考此元素范围）
const tableRef = ref<any>(null);
const gridWrapper = ref<HTMLElement>();
const gridBox = ref<HTMLElement>();
const fileInputRef = ref<HTMLInputElement>();

// ===================== hooks 装配 =====================
// 核心（数据/校验/历史/查询/统计）→ 滚动定位 → 列定义 → 单元格框选 → 数据操作 → 模板 → 压测数据 → 导入导出 → 查找替换 → 鼠标键盘交互
// 末级的 useGridMouse 为协调层，内部再装配三个子状态机：useFillHandle（填充手柄）/ useCopyMarquee（复制蚂蚁线）/ useGridKeys（键盘导航）
const core = useGridCore();
const scroll = useGridScroll(core, tableRef);
const gridColumns = useGridColumns(core, tableRef);
const sel = useCellSelection(core, tableRef, gridWrapper);
const ops = useGridOps(core, tableRef, scroll, sel);
const tpl = useGridTemplates(core);
const demo = useGridDemoData(core);
const io = useGridIO(core, fileInputRef, sel);
const find = useGridFindReplace(core, scroll, sel);
const mouse = useGridMouse(core, tableRef, { gridBox, gridWrapper, io, find, ops, sel });

// ---- 核心：查询管道 / 统计 / 编辑事件 ----
const {
  processedRows,
  dirtyCount,
  errorCount,
  pagedRows,
  viewMode,
  showFooter,
  footerData,
  pager,
  onSortChange,
  onFilterChange,
  onEditActived,
  onEditClosed,
  activeColLabel,
  activeStats,
} = core;
// ---- 列定义 / 编辑配置 ----
const { editConfig, keyboardConfig } = gridColumns;
// ---- 压测数据（头部状态 pill） ----
const { lastGen } = demo;
// ---- 文件导入（隐藏 input 仍在页面） ----
const { onFileChange } = io;
// ---- 填充手柄 / 网格高度 / 快捷键帮助 / 复制蚂蚁线 ----
const { gridHeight, fillHandle, startFill, helpVisible, copyMarquee } = mouse;
// ---- 框选统计（头部 pill 与状态栏共用） ----
const { selectionCount, selectionStats } = ops;

// 列头点击配置抽屉（单列）：点列头打开该列的配置抽屉（列名/类型/类型专属配置）
const configDrawer = ref(false);
const configField = ref('');
const openColumnConfig = (field: string) => {
  configField.value = field;
  configDrawer.value = true;
};

// ---- 活动格坐标指示（Excel 名称框语义：第几行 / 第几列 + 列名） ----
/**
 * posLabel —— 当前活动单元格的"名称框"文字。
 * 用途：在状态栏最左展示活动格处于第几行/第几列（1-based）及列名，对齐 Excel 名称框语义。
 * 实现：用 sel.anchor（选区固定端，即 Excel 活动格）的 rowId/field 反查 processedRows 与
 *       visibleDefs 的下标；找不到（如选区已失效）时回退"未选中"。
 * 坑点：必须用 anchor 而非 currentCell——Shift 扩展选区时 currentCell 会跟到 focus 端，
 *       而名称框应始终显示起始格。
 */
const posLabel = computed(() => {
  const a = sel.anchor.value;
  if (!a) return '未选中';
  const rows = core.processedRows.value;
  const fields = core.visibleDefs.value.map((d) => d.field);
  const ri = rows.findIndex((r) => rowIdOf(r) === a.rowId);
  const ci = fields.indexOf(a.field);
  if (ri < 0 || ci < 0) return '未选中';
  return `第 ${ri + 1} 行 / ${rows.length} · 第 ${ci + 1} 列 ${core.labelOf(a.field)}`;
});

// ---- 查询条件 chips 的清除动作：改数据状态的同时清掉 vxe 列头里的排序/筛选标记 ----
/**
 * clearFilterChip —— 清除某一列的某一个（或全部）筛选值，并同步 vxe 表头的筛选标记。
 * @param field 列 field
 * @param value 要移除的具体筛选值；省略表示清空该列全部筛选
 * 坑点：tableRef.clearFilter 会触发 filter-change 把 columnFilters 整体写回空，
 *       因此这里若还有剩余筛选值，需要在 clearFilter 之后把剩余值补写回 core.columnFilters。
 */
const clearFilterChip = (field: string, value?: string) => {
  const cur = core.columnFilters[field] ?? [];
  const next = value ? cur.filter((v) => v !== value) : [];
  if (next.length) core.columnFilters[field] = next;
  else delete core.columnFilters[field];
  tableRef.value?.clearFilter?.(field);
  // clearFilter 会触发 filter-change 把 columnFilters 写回空，这里补回剩余值（多选筛选逐项清除的场景）
  if (next.length) core.columnFilters[field] = next;
};

/**
 * clearSortChip —— 清除排序标记（单列或全局），并同步 vxe 表头排序图标。
 * @param field 要清除排序的列 field；省略表示清除全部排序
 */
const clearSortChip = (field?: string) => {
  core.sortList.value = field ? core.sortList.value.filter((s) => s.field !== field) : [];
  if (field) tableRef.value?.clearSort?.(field);
  else tableRef.value?.clearSort?.();
};

/** clearAllQuery —— 一键清空所有查询态：搜索词 + 全部列筛选 + 全部排序，并同步 vxe 表头标记。 */
const clearAllQuery = () => {
  core.searchText.value = '';
  Object.keys(core.columnFilters).forEach((k) => { delete core.columnFilters[k]; });
  core.sortList.value = [];
  tableRef.value?.clearFilter?.();
  tableRef.value?.clearSort?.();
};

// 列头点击：序号列 = 全选（Excel 左上角三角）；数据列 = 选中整列。
// 排序已改为 trigger:'default'（只在点列头排序图标时排序），故点表头不会再被排序动作抢走；
// 仍用 vxe 给出的 triggerSort/triggerFilter/triggerResizable 兜底，避免点排序/筛选图标时误选整列
/**
 * onHeaderClick —— 表头单元格点击处理：序号列=全选；数据列=打开该列的配置抽屉。
 * @param column vxe 列对象（含 type/field）
 * @param triggerSort/triggerFilter/triggerResizable vxe 透出的点击落点标志，落在排序/筛选/拖拽手柄上时为 true
 * 坑点：
 *   1) vxe 表头事件名是 header-cell-click（@header-cell-click），不可拼错；
 *   2) 必须排除 triggerSort/triggerFilter/triggerResizable，否则点排序/筛选图标会误触发"打开列配置"；
 *   3) 点数据列表头改为打开列配置抽屉（需求：列设置改由点列头触发），故不再在此选整列。
 */
const onHeaderClick = ({ column, triggerSort, triggerFilter, triggerResizable }: any) => {
  if (!column || triggerSort || triggerFilter || triggerResizable) return;
  const fields = core.visibleDefs.value.map((d) => d.field);
  const rows = core.processedRows.value;
  if (column.type === 'seq') {
    if (fields.length && rows.length) {
      sel.selectAll(
        { rowId: rowIdOf(rows[0]), field: fields[0] },
        { rowId: rowIdOf(rows[rows.length - 1]), field: fields[fields.length - 1] },
      );
    }
    return;
  }
  // 数据列：打开该列的配置抽屉（列名/类型/类型专属配置）
  if (column.field) openColumnConfig(column.field);
};

onMounted(() => {
  core.revalidateAll();
  nextTick(gridColumns.applyColumns);
  nextTick(gridColumns.syncBodyWidth);
  nextTick(mouse.syncGridHeight);
  tpl.loadTemplates();
  nextTick(mouse.refreshFillHandle);
});

// 条件格式（数值列数据条）由渲染器读 RT 桥的统计快照渲染，vxe 不会因 RT 变化自动重绘，
// 故开关切换后主动刷新一次，否则要等滚动/编辑才看得到效果
watch(
  () => core.conditionalOn.value,
  () => nextTick(() => tableRef.value?.updateData?.()),
);

// ===================== 单元格样式 =====================
// 错误标红 / 查找命中高亮 / 填充闪烁 / 框选高亮（分别来自 核心校验、查找替换、填充手柄、选区状态机）
/**
 * cellClassName —— 为单个单元格计算 class（错误/查找命中/闪烁/活动格/十字高亮/选区边框）。
 * @param row vxe 行数据；@param column vxe 列数据
 * @returns 空格分隔的 className 串（空串表示无特殊样式）
 * 说明：本函数集中输出所有"单元格级视觉状态"，是渲染性能关键点（每次重绘都会调用），
 *       只做轻量判定，不在此改数据。
 * 坑点：
 *   - 活动格取 anchor（选区固定端）而非 currentCell（见 posLabel 注释）；
 *   - 十字高亮用 background-image 而非 background-color，以便与 cell-sel 的
 *     background-color(!important) 叠加不打架；
 *   - 复制态下与 copiedRect 重合的选区格不再画实线外框，让位给蚂蚁线（见下方 inCopied 判定）。
 */
const cellClassName = ({ row, column }: any) => {
  const field = column?.field;
  if (!field) return '';
  const cls: string[] = [];
  const key = core.errKey(rowIdOf(row), field);
  if (core.cellErrors[key]) cls.push('cell-error');
  if (find.findMatchKeys.value.has(key)) cls.push('cell-found');
  // 闪烁来自两处：核心的单格闪烁（错误跳转）与填充手柄的多格闪烁（填充预览）
  if (core.flashKeys.value.has(key) || mouse.flashKeys.value.has(key)) cls.push('cell-flash');
  // 活动格在选区内恢复本色底，与淡色底的其余选区格区分（Excel 活动单元格语义）。
  // 活动格取 anchor（选区固定端）而非 currentCell：Shift 扩展时 currentCell 会跟到 focus 端，
  // 而 Excel 中白底始终留在起始格（anchor）上
  const act = sel.anchor.value;
  if (act && act.rowId === rowIdOf(row) && act.field === field) cls.push('cell-active');
  // 十字高亮：活动格所在行/列淡色引导（多列宽表录入时防串行）。
  // 用 background-image 而非 background-color：与 cell-sel 的 background-color(!important) 可叠加不打架
  if (act) {
    const sameRow = act.rowId === rowIdOf(row);
    const sameCol = act.field === field;
    // 活动格自身不加（它已有 cell-active 白底，再叠淡蓝会脏）
    if (!(sameRow && sameCol)) {
      if (sameRow) cls.push('cross-row');
      else if (sameCol) cls.push('cross-col');
    }
  }
  if (sel.isCellSelected(rowIdOf(row), field)) {
    // 选区内淡色底 + 区域外框（仅矩形四边的格带描边类，角格自动合成两条）。
    // 复制态下与 copiedRect 重合的格不再画实线外框——让位给蚂蚁线（Excel：Ctrl+C 后原边框被虚线动画替代），
    // 避免同色同位的实线把虚线行军效果压住
    cls.push('cell-sel');
    const cr = mouse.copiedRect.value;
    const inCopied = !!cr && cr.rowIds.has(rowIdOf(row)) && cr.fields.includes(field);
    if (!inCopied) {
      const e = sel.selEdge(rowIdOf(row), field);
      if (e.t) cls.push('sel-t');
      if (e.b) cls.push('sel-b');
      if (e.l) cls.push('sel-l');
      if (e.r) cls.push('sel-r');
    }
  }
  return cls.join(' ');
};

/**
 * rowClassName —— 整行级 class：仅需标脏时使用。
 * @param row 行数据
 * 说明：行标脏（__dirty）用于行首色条提示，与单元格级样式解耦。
 */
const rowClassName = ({ row }: any) => {
  if (!row || !dirtyOf(row)) return '';
  return 'row-dirty';
};

// 序号列点击 = 选中整行（行头语义）；数据列点击 = 移动当前格（选区由 watcher 塌缩/Shift 扩展）
/**
 * onCellClick —— 单元格点击分发。
 * @param params vxe cell-click 事件参数（含 column/row）
 * 坑点：序号列（type==='seq'）按"行头"语义处理（选整行），必须在此拦截，
 *       否则会走到 core.onCellClick 误当成普通数据格移动当前格。
 */
const onCellClick = (params: any) => {
  if (params?.column?.type === 'seq') {
    if (params?.row) sel.selectRow(rowIdOf(params.row));
    return;
  }
  core.onCellClick(params);
};

</script>

<style lang="less" scoped>
/* 页面骨架（.bi-page / .bi-header / .stat-pill / .bi-panel / .bi-statusbar）与色板（--bi-*）
   由全局 assets/style/bi-entry.less 提供，三套录入台共用；此处只留 vxe 专有部分。
   .dt-page / .dt-grid 等类名保留在模板上：仍被下方 html.dark 的 :deep() 覆盖规则引用。 */
.dt-pager { margin-top: 10px; display: flex; justify-content: flex-end; }

/* 填充手柄 */
.dt-fillhandle {
  position: absolute; width: 9px; height: 9px;
  background: var(--dt-primary); border: 1.5px solid var(--dt-panel);
  border-radius: 2px; cursor: crosshair; z-index: 6;
  box-shadow: 0 0 0 1px var(--dt-primary);
  transition: transform .08s ease;
}
.dt-fillhandle:hover { transform: scale(1.35); }

/* 复制蚂蚁线：Excel 式虚线动画边框（stroke-dashoffset 循环位移形成"行军"效果），
   标记 Ctrl+C 后剪贴板内容的来源区域；pointer-events:none 不抢单元格事件 */
.dt-copymarquee { position: absolute; pointer-events: none; z-index: 5; }
.dt-copymarquee svg { display: block; }
.dt-copymarquee rect {
  fill: none;
  stroke: var(--dt-primary);
  stroke-width: 1.5;
  stroke-dasharray: 7 5;
  animation: dt-march .8s linear infinite;
}
// ⚠️ 坑：box-shadow 不支持 dashed（虚线）边框效果，复制蚂蚁线若用 box-shadow 只能得到实线。
// 因此这里改用 SVG <rect> + stroke-dasharray + stroke-dashoffset 循环动画实现"行军虚线"，
// copiedRect（mouse 状态机维护的独立快照）提供位置/尺寸，本 overlay 只负责绘制动画。
@keyframes dt-march { to { stroke-dashoffset: -12; } }

/* 表格视觉：表头作为「列标签条」，字色比正文深一阶、字重 600、底部一条实线；
   网格线降到最淡，让数据本身成为视觉主体（数据平台的通用做法） */
:deep(.vxe-table) {
  font-size: 13px;
  color: var(--dt-text);
  background: var(--dt-panel);
  --vxe-ui-font-color: var(--dt-text);
  --vxe-ui-table-border-color: var(--bi-border-soft);
  --vxe-ui-table-header-background-color: var(--bi-head-bg);
}
:deep(.vxe-table .vxe-header--column) {
  background: var(--dt-header-bg);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--dt-text);
  letter-spacing: 0.2px;
  border-bottom: 1px solid var(--bi-border);
}
:deep(.vxe-table .vxe-header--row) { box-shadow: inset 0 -1px 0 var(--bi-border); }

/* 表头工具图标：整列可编辑是常态（铅笔无信息量，直接隐藏）；
   排序箭头与筛选漏斗降到 30% 透明，hover 列头才恢复——否则每个列头挂 3 个图标，
   一屏十几列就是一片小图标噪声 */
/* 网格：去掉竖向单元格线，只保留行间横线（数据表只靠横线分行最好读；列宽固定，
   列与列靠留白区分）。冻结列、表头底线单独保留，否则冻结区会和滚动区糊成一片 */
:deep(.vxe-table .vxe-body--column),
:deep(.vxe-table .vxe-header--column) { border-right: 0; }
:deep(.vxe-table .vxe-body--row .vxe-body--column) { border-bottom: 1px solid var(--bi-border); }
:deep(.vxe-table .fixed-left--wrapper .vxe-body--column),
:deep(.vxe-table .fixed-right--wrapper .vxe-body--column) { border-right: 1px solid var(--bi-border-soft); }

:deep(.vxe-table .vxe-cell--edit-icon) { display: none; }
/* 表头工具图标：整列可编辑是常态（铅笔无信息量，直接隐藏）；
   排序箭头与筛选漏斗默认完全透明，hover 该列头时才显形——否则每个列头挂 3 个图标，
   一屏十几列就是一片小图标噪声。
   ⚠️ 透明必须压在图标元素上，不能压在 .vxe-cell--sort 容器上：
      父级 opacity:0 会把子级一起裁掉，子级再写 opacity:1 也救不回来。
   ⚠️ 激活态类名是 .sort--active（挂在图标上）与 .is--filter-active（挂在 th 上），
      写成 .is-active 会静默失效（曾经踩过）。 */
:deep(.vxe-table .vxe-cell--sort .vxe-sort--asc-btn),
:deep(.vxe-table .vxe-cell--sort .vxe-sort--desc-btn),
:deep(.vxe-table .vxe-cell--filter .vxe-filter--btn) {
  opacity: 0;
  transition: opacity 0.12s ease;
}
:deep(.vxe-table .vxe-header--column:hover .vxe-cell--sort .vxe-sort--asc-btn),
:deep(.vxe-table .vxe-header--column:hover .vxe-cell--sort .vxe-sort--desc-btn),
:deep(.vxe-table .vxe-header--column:hover .vxe-cell--filter .vxe-filter--btn) { opacity: 1; }
/* 已生效的排序 / 筛选必须常显，否则用户不知道当前列被筛过 */
:deep(.vxe-table .vxe-cell--sort .sort--active) { opacity: 1; color: var(--dt-primary); }
:deep(.vxe-table .vxe-header--column.is--filter-active .vxe-cell--filter .vxe-filter--btn) {
  opacity: 1;
  color: var(--dt-primary);
}
:deep(.vxe-table .vxe-body--row:hover) { background: var(--dt-hover); }
:deep(.vxe-table .vxe-body--row.row-dirty) { box-shadow: inset 2px 0 0 var(--dt-warn); }
:deep(.vxe-table .vxe-body--column.cell-error) { background-color: rgba(245,63,63,.1) !important; }
:deep(.vxe-table .vxe-body--column.cell-error .vxe-cell) { color: var(--dt-danger); }
:deep(.vxe-table .vxe-body--column.cell-found) { background-color: rgba(255,180,46,.16) !important; }
:deep(.vxe-table .vxe-body--column.cell-flash) { background-color: var(--dt-primary-soft) !important; animation: dtflash .6s ease; }
@keyframes dtflash { from { background-color: var(--dt-primary) !important; } to { background-color: var(--dt-primary-soft) !important; } }
/* 十字高亮（活动格所在行/列）：background-image 与 cell-sel / cell-error 的 background-color 叠加，
   不争抢同一属性，故无论是否在选区内都能看见 */
:deep(.vxe-table .vxe-body--column.cross-row) { background-image: linear-gradient(rgba(43, 92, 246, 0.055), rgba(43, 92, 246, 0.055)); }
:deep(.vxe-table .vxe-body--column.cross-col) { background-image: linear-gradient(rgba(43, 92, 246, 0.09), rgba(43, 92, 246, 0.09)); }
:deep(.vxe-table .vxe-body--column.cross-both) { background-image: linear-gradient(rgba(43, 92, 246, 0.12), rgba(43, 92, 246, 0.12)); }
html.dark .dt-page :deep(.vxe-table .vxe-body--column.cross-row) { background-image: linear-gradient(rgba(111, 141, 255, 0.07), rgba(111, 141, 255, 0.07)); }
html.dark .dt-page :deep(.vxe-table .vxe-body--column.cross-col) { background-image: linear-gradient(rgba(111, 141, 255, 0.11), rgba(111, 141, 255, 0.11)); }
html.dark .dt-page :deep(.vxe-table .vxe-body--column.cross-both) { background-image: linear-gradient(rgba(111, 141, 255, 0.15), rgba(111, 141, 255, 0.15)); }

/* 单元格框选（自研选区）：选区内淡色底，矩形四边由自定义属性拼出区域外框（角格两条） */
:deep(.vxe-table .vxe-body--column.cell-sel) {
  background-color: var(--dt-primary-soft) !important;
  box-shadow: var(--sel-t, 0 0 #0000), var(--sel-b, 0 0 #0000), var(--sel-l, 0 0 #0000), var(--sel-r, 0 0 #0000);
}
:deep(.vxe-table .vxe-body--column.sel-t) { --sel-t: inset 0 1.5px 0 0 var(--dt-primary); }
:deep(.vxe-table .vxe-body--column.sel-b) { --sel-b: inset 0 -1.5px 0 0 var(--dt-primary); }
:deep(.vxe-table .vxe-body--column.sel-l) { --sel-l: inset 1.5px 0 0 0 var(--dt-primary); }
:deep(.vxe-table .vxe-body--column.sel-r) { --sel-r: inset -1.5px 0 0 0 var(--dt-primary); }
/* 活动格（currentCell）在选区内恢复本色底，与淡色底的其余选区格区分（置于 cell-sel 之后以覆盖淡色底） */
:deep(.vxe-table .vxe-body--column.cell-sel.cell-active) { background-color: var(--dt-panel) !important; }
:deep(.vxe-table .fixed-left--wrapper) { box-shadow: 4px 0 10px -6px rgb(16 24 40 / 8%); }
:deep(.vxe-table .vxe-header--column.dt-col-req .vxe-cell::after) { content: '*'; color: var(--dt-danger); margin-left: 2px; }
:deep(.vxe-table .vxe-footer--row) { background: var(--dt-header-bg); font-weight: 600; color: var(--dt-text); }
/* ===== 单元格编辑器（element-plus）：融入单元格——无边框、透明底、撑满格高、文字随单元格主题 =====
   ⚠️ 坑：编辑单元格必须用 element-plus 组件（而非 vxe 自带编辑器）；输入框必须去除 box-shadow 边框
   （box-shadow: none）、透明背景、无 padding，使编辑器"融"进单元格而不突兀；
   且"编辑不高亮整列"——选区/活动格样式控制在单元格级，不借助 vxe 的列高亮。 */
:deep(.dt-el-editor),
:deep(.dt-el-editor .el-input__wrapper),
:deep(.dt-el-editor .el-select__wrapper) { height: 100%; }
:deep(.dt-el-editor .el-input__wrapper),
:deep(.dt-el-editor .el-select__wrapper) {
  box-shadow: none;
  background: transparent;
  border: none;
  padding: 0;
}
:deep(.dt-el-editor .el-input__inner),
:deep(.dt-el-editor .el-select__selected-item),
:deep(.dt-el-editor .el-select__placeholder) { color: inherit; }
:deep(.dt-el-editor .el-select__placeholder) { opacity: 0.5; }

/* 单元格显示渲染 */
:deep(.dt-tag) {
  display: inline-block; padding: 0 7px; border-radius: 4px; font-size: 12px;
  border: 1px solid transparent; line-height: 19px; white-space: nowrap;
}
:deep(.dt-num) { display: inline-block; width: 100%; text-align: right; font-variant-numeric: tabular-nums; font-weight: 500; }
:deep(.dt-num-plain) { color: var(--dt-text); }
:deep(.dt-date) { color: var(--dt-sub); }
:deep(.dt-text) { color: var(--dt-text); }
:deep(.dt-bar-cell) {
  position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-end;
  padding-right: 8px; box-sizing: border-box; overflow: hidden;
}
:deep(.dt-bar-cell .dt-bar) {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: rgba(43, 92, 246, 0.16);
  border-right: 1px solid rgba(43, 92, 246, 0.38); z-index: 0;
}
html.dark :deep(.dt-bar-cell .dt-bar) { background: rgba(111, 141, 255, 0.22); border-right-color: rgba(111, 141, 255, 0.5); }
:deep(.dt-bar-cell .dt-num) { position: relative; z-index: 1; }

/* 深色主题下 vxe 边框/底色覆盖 */
html.dark .dt-page :deep(.vxe-table) { background: var(--dt-panel); }
html.dark .dt-page :deep(.vxe-table .vxe-table--body-wrapper),
html.dark .dt-page :deep(.vxe-table .vxe-table--header-wrapper) { background: var(--dt-panel); }
html.dark .dt-page :deep(.vxe-table .vxe-body--column),
html.dark .dt-page :deep(.vxe-table .vxe-header--column) { border-color: var(--dt-border) !important; }
html.dark .dt-page :deep(.vxe-table .vxe-table--border-line) { border-color: var(--dt-border); }
html.dark .dt-page :deep(.vxe-table .vxe-body--row.row--stripe) { background: var(--dt-panel); }
</style>
