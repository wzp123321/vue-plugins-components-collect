<template>
  <div class="dt-page" ref="gridWrapper">
    <!-- 顶部标题 -->
    <div class="dt-header">
      <div class="dt-title">
        <span class="dt-logo">表</span>
        <div>
          <h3>网页端 Excel 数据录入台</h3>
          <p class="dt-sub">vxe-table · 数据中台录入台 · 虚拟滚动 / 框选 / 填充 / 校验</p>
        </div>
      </div>
      <div class="dt-stats">
        <span class="stat-pill"><b>{{ processedRows.length.toLocaleString() }}</b> 行</span>
        <span class="stat-pill warn"><b>{{ dirtyCount }}</b> 改动</span>
        <span class="stat-pill danger"><b>{{ errorCount }}</b> 错误</span>
        <span class="stat-pill ok"><b>{{ selectionCount }}</b> 选中</span>
        <span v-if="lastGen" class="stat-pill info">{{ lastGen }}</span>
      </div>
    </div>

    <!-- 工具栏 / 查找替换条 / 批量填充面板 -->
    <GridToolbar :core="core" :ops="ops" :tpl="tpl" :demo="demo" :io="io" :find="find" />
    <GridFindBar :find="find" />
    <GridFillBar :core="core" :ops="ops" />

    <!-- 表格 -->
    <div class="dt-grid" ref="gridBox">
      <VxeTable
        ref="tableRef"
        :data="pagedRows"
        :edit-config="editConfig"
        :keyboard-config="keyboardConfig"
        :mouse-config="{ selected: false }"
        :sort-config="{ trigger: 'cell', remote: true, multiple: true }"
        :filter-config="{ remote: true }"
        :tooltip-config="{ mode: 'title' }"
        :row-config="{ keyField: '__id', isHover: true }"
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
        @sort-change="onSortChange"
        @filter-change="onFilterChange"
        @edit-actived="onEditActived"
        @edit-closed="onEditClosed"
      />
      <!-- 拖拽填充手柄 -->
      <div
        v-show="fillHandle.show"
        class="dt-fillhandle"
        :style="fillHandle.style"
        title="拖拽以填充（纵向复制）"
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
    <div class="dt-statusbar">
      <span class="sb-item">行数 <b>{{ processedRows.length.toLocaleString() }}</b></span>
      <span class="sb-item">改动 <b class="c-warn">{{ dirtyCount }}</b></span>
      <span class="sb-item">选中 <b class="c-ok">{{ selectionCount }}</b></span>
      <span class="sb-item">错误 <b class="c-danger">{{ errorCount }}</b></span>
      <template v-if="activeStats">
        <span class="sb-sep" />
        <span class="sb-item">{{ activeColLabel }}：</span>
        <span class="sb-item">计数 <b>{{ activeStats.count }}</b></span>
        <span class="sb-item">求和 <b>{{ activeStats.sum }}</b></span>
        <span class="sb-item">平均 <b>{{ activeStats.avg }}</b></span>
        <span class="sb-item">最大 <b>{{ activeStats.max }}</b></span>
        <span class="sb-item">最小 <b>{{ activeStats.min }}</b></span>
      </template>
      <template v-if="selectionStats">
        <span class="sb-sep" />
        <span class="sb-item">选区统计：</span>
        <span class="sb-item">计数 <b>{{ selectionStats.count }}</b></span>
        <span class="sb-item">求和 <b>{{ selectionStats.sum }}</b></span>
        <span class="sb-item">平均 <b>{{ selectionStats.avg }}</b></span>
        <span class="sb-item">最大 <b>{{ selectionStats.max }}</b></span>
        <span class="sb-item">最小 <b>{{ selectionStats.min }}</b></span>
      </template>
      <span class="sb-tip">提示：拖动框选单元格 · 点序号格选中整行 · 双击/F2 编辑 · Ctrl+D 向下填充 · Ctrl+A 全选 · 拖右下角 ▢ 填充 · F1 快捷键帮助</span>
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
    <ErrorDrawer :core="core" :ops="ops" />
    <TemplateDialog :tpl="tpl" />

    <input ref="fileInputRef" type="file" accept=".xlsx,.xls" style="display: none" @change="onFileChange" />
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, onMounted } from 'vue';
import { VxeTable } from 'vxe-table';
import 'vxe-table/es/style.css';
import './theme.css';
import { registerAllRenderers } from './components/cells';
import GridToolbar from './components/GridToolbar.vue';
import GridFindBar from './components/GridFindBar.vue';
import GridFillBar from './components/GridFillBar.vue';
import GridContextMenu from './components/GridContextMenu.vue';
import GridHelpDialog from './components/GridHelpDialog.vue';
import AddColumnDialog from './components/AddColumnDialog.vue';
import ColumnManagerDrawer from './components/ColumnManagerDrawer.vue';
import ErrorDrawer from './components/ErrorDrawer.vue';
import TemplateDialog from './components/TemplateDialog.vue';
import { useGridCore } from './hooks/useGridCore';
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
const find = useGridFindReplace(core, scroll);
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

onMounted(() => {
  core.revalidateAll();
  nextTick(gridColumns.applyColumns);
  nextTick(gridColumns.syncBodyWidth);
  nextTick(mouse.syncGridHeight);
  tpl.loadTemplates();
  nextTick(mouse.refreshFillHandle);
});

// ===================== 单元格样式 =====================
// 错误标红 / 查找命中高亮 / 填充闪烁 / 框选高亮（分别来自 核心校验、查找替换、填充手柄、选区状态机）
const cellClassName = ({ row, column }: any) => {
  const field = column?.field;
  if (!field) return '';
  const cls: string[] = [];
  const key = core.errKey(row.__id, field);
  if (core.cellErrors[key]) cls.push('cell-error');
  if (find.findMatchKeys.value.has(key)) cls.push('cell-found');
  // 闪烁来自两处：核心的单格闪烁（错误跳转）与填充手柄的多格闪烁（填充预览）
  if (core.flashKeys.value.has(key) || mouse.flashKeys.value.has(key)) cls.push('cell-flash');
  // 活动格在选区内恢复本色底，与淡色底的其余选区格区分（Excel 活动单元格语义）。
  // 活动格取 anchor（选区固定端）而非 currentCell：Shift 扩展时 currentCell 会跟到 focus 端，
  // 而 Excel 中白底始终留在起始格（anchor）上
  const act = sel.anchor.value;
  if (act && act.rowId === row.__id && act.field === field) cls.push('cell-active');
  if (sel.isCellSelected(row.__id, field)) {
    // 选区内淡色底 + 区域外框（仅矩形四边的格带描边类，角格自动合成两条）。
    // 复制态下与 copiedRect 重合的格不再画实线外框——让位给蚂蚁线（Excel：Ctrl+C 后原边框被虚线动画替代），
    // 避免同色同位的实线把虚线行军效果压住
    cls.push('cell-sel');
    const cr = mouse.copiedRect.value;
    const inCopied = !!cr && cr.rowIds.has(row.__id) && cr.fields.includes(field);
    if (!inCopied) {
      const e = sel.selEdge(row.__id, field);
      if (e.t) cls.push('sel-t');
      if (e.b) cls.push('sel-b');
      if (e.l) cls.push('sel-l');
      if (e.r) cls.push('sel-r');
    }
  }
  return cls.join(' ');
};
const rowClassName = ({ row }: any) => (row?.__dirty ? 'row-dirty' : '');

// 序号列点击 = 选中整行（行头语义）；数据列点击 = 移动当前格（选区由 watcher 塌缩/Shift 扩展）
const onCellClick = (params: any) => {
  if (params?.column?.type === 'seq') {
    if (params?.row) sel.selectRow(params.row.__id);
    return;
  }
  core.onCellClick(params);
};

</script>

<style lang="less" scoped>
/* 主题变量（--dt-*）见 theme.css：挂在 .dt-page 与 teleport 弹窗的 .dt-dlg 上 */
.dt-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 14px 16px 16px;
  box-sizing: border-box;
  background: var(--dt-bg);
  font-family: -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--dt-text);
  transition: background .25s ease, color .25s ease;
}

.dt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.dt-title { display: flex; align-items: center; gap: 12px; }
.dt-logo {
  width: 38px; height: 38px; border-radius: 10px;
  background: linear-gradient(135deg, #3b5bdb, #5b8def);
  color: #fff; font-weight: 700; font-size: 18px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 91, 219, 0.35);
}
.dt-title h3 { margin: 0; font-size: 17px; color: var(--dt-text); font-weight: 650; }
.dt-sub { margin: 2px 0 0; font-size: 12px; color: var(--dt-sub); }

.dt-stats { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.stat-pill {
  background: var(--dt-panel); border: 1px solid var(--dt-border); border-radius: 999px;
  padding: 4px 12px; font-size: 12px; color: var(--dt-sub);
}
.stat-pill b { color: var(--dt-text); margin-right: 2px; }
.stat-pill.warn b { color: var(--dt-warn); }
.stat-pill.danger b { color: var(--dt-danger); }
.stat-pill.ok b { color: var(--dt-ok); }
.stat-pill.info { color: var(--dt-primary); border-color: #c5cdf7; background: var(--dt-primary-soft); }
html.dark .stat-pill.info { border-color: #2c3a66; }

.dt-grid {
  position: relative;
  flex: 1;
  min-height: 320px;
  border: 1px solid var(--dt-border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--dt-panel);
  box-shadow: var(--dt-shadow);
}
.dt-pager { margin-top: 10px; display: flex; justify-content: flex-end; }

/* 状态栏 */
.dt-statusbar {
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  margin-top: 10px; padding: 8px 12px;
  background: var(--dt-panel); border: 1px solid var(--dt-border); border-radius: 10px;
  font-size: 12px; color: var(--dt-sub);
}
.dt-statusbar .sb-item b { color: var(--dt-text); margin: 0 2px; }
.dt-statusbar .sb-item .c-warn { color: var(--dt-warn); }
.dt-statusbar .sb-item .c-danger { color: var(--dt-danger); }
.dt-statusbar .sb-item .c-ok { color: var(--dt-ok); }
.dt-statusbar .sb-sep { width: 1px; height: 14px; background: var(--dt-border); }
.dt-statusbar .sb-tip { margin-left: auto; opacity: .8; }

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
@keyframes dt-march { to { stroke-dashoffset: -12; } }

/* 表格视觉美化 */
:deep(.vxe-table) { font-size: 13px; color: var(--dt-text); background: var(--dt-panel); }
:deep(.vxe-table .vxe-header--column) { background: var(--dt-header-bg); font-weight: 600; color: var(--dt-sub); }
:deep(.vxe-table .vxe-body--row:hover) { background: var(--dt-hover); }
:deep(.vxe-table .vxe-body--row.row-dirty) { box-shadow: inset 3px 0 0 var(--dt-warn); }
:deep(.vxe-table .vxe-body--column.cell-error) { background-color: rgba(245,63,63,.1) !important; }
:deep(.vxe-table .vxe-body--column.cell-error .vxe-cell) { color: var(--dt-danger); }
:deep(.vxe-table .vxe-body--column.cell-found) { background-color: rgba(255,180,46,.16) !important; }
:deep(.vxe-table .vxe-body--column.cell-flash) { background-color: var(--dt-primary-soft) !important; animation: dtflash .6s ease; }
@keyframes dtflash { from { background-color: var(--dt-primary) !important; } to { background-color: var(--dt-primary-soft) !important; } }
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
:deep(.vxe-table .fixed-left--wrapper) { box-shadow: 4px 0 8px -4px rgba(0, 0, 0, 0.12); }
:deep(.vxe-table .vxe-header--column.dt-col-req .vxe-cell::after) { content: '*'; color: var(--dt-danger); margin-left: 2px; }
:deep(.vxe-table .vxe-footer--row) { background: var(--dt-header-bg); font-weight: 600; color: var(--dt-text); }
/* ===== 单元格编辑器（element-plus）：融入单元格——无边框、透明底、撑满格高、文字随单元格主题 ===== */
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
  display: inline-block; padding: 1px 9px; border-radius: 999px; font-size: 12px;
  border: 1px solid transparent; line-height: 18px; white-space: nowrap;
}
:deep(.dt-num) { display: inline-block; width: 100%; text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
:deep(.dt-num-plain) { color: var(--dt-text); }
:deep(.dt-date) { color: var(--dt-sub); }
:deep(.dt-text) { color: var(--dt-text); }
:deep(.dt-bar-cell) {
  position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-end;
  padding-right: 8px; box-sizing: border-box; overflow: hidden;
}
:deep(.dt-bar-cell .dt-bar) {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: linear-gradient(90deg, rgba(59,91,219,.28), rgba(59,91,219,.12));
  border-right: 1px solid rgba(59,91,219,.45); z-index: 0;
}
html.dark :deep(.dt-bar-cell .dt-bar) { background: linear-gradient(90deg, rgba(107,138,253,.34), rgba(107,138,253,.12)); border-right-color: rgba(107,138,253,.55); }
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
