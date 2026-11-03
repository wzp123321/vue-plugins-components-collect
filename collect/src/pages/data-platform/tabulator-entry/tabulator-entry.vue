<!--
  Tabulator BI 数据录入台（页面入口 · 装配层）
  ============================================================================
  本文件职责：
    1. 组装布局：标题统计条 / 工具条 / 查找条 / Tabulator 表格 / 状态栏 / 各抽屉弹窗；
    2. 装配 composables（useEntrySheet / useEntryRules / useEntryOps / useEntryIO / useEntryFind）
       并接线到子组件与键盘快捷键；
    3. 承担页面级协调：初始数据装载、列结构变更后的"列同步 + 重校验"、脏行统计、选区聚合统计、明暗主题跟随。

  在整体架构中的角色：对应 vxe 版 excel-data-entry-vxe.vue、Univer 版 univer-entry.vue —— 只做装配与协调，
  校验/操作/导入导出/查找这些真实逻辑都下沉在 composables 里。

  能力对标（与另两套一致）：
    - 行增删/复制、清空、空行/重复清理、批量填充 → 走 useEntryOps；
    - 必填/数值/长度/正则/唯一/跨列校验 → useEntryRules（DOM class 标红）；
    - 列结构模板、导入导出（SheetJS）、查找替换 → useEntryIO / useEntryFind；
    - 单列配置（共享 BiColumnDrawer）从「单元格右键菜单 → 打开该列配置」进，
      工具条「列设置」→ 全量列表（共享 BiColumnManager）。列头左键留给排序/筛选。

  Tabulator 专属取舍（与 Univer 画布的差异，已确认属 DOM 模型的优势或边界）：
    - 斑马纹 / 必填红星 / 行 hover / 查找黄底 全靠 CSS class，零命令式成本（这是选 Tabulator 的核心动机）；
    - 行身份用 rowId（index:'rowId'）：错误/查找高亮、选区、行操作全部以 rowId 为键，
      所以排序与筛选后都不会错行 —— 这也是敢开 headerSort + headerFilter 的前提；
    - 撤销重做走自带快照栈（Tabulator 无命令栈），单格编辑与结构性变更均可撤销；
    - 交互走内置模块：SelectRange（矩形选区 + 填充柄）、Clipboard（TSV，与 Excel 互通）、
      Keybindings（方向键/Tab）、Menu（右键菜单），不自造键盘事件。
  ============================================================================
-->
<template>
  <div class="tb-page bi-page" ref="pageRef">
    <div class="tb-header bi-header">
      <div class="tb-title bi-title">
        <span class="tb-logo bi-logo">T</span>
        <div>
          <h3>Tabulator BI 数据录入台</h3>
          <p class="tb-sub bi-sub">tabulator-tables 6.7.1 · MIT 开源 · DOM 渲染 / 行即对象 / 原生斑马纹与必填红星</p>
        </div>
      </div>
      <div class="tb-stats bi-stats">
        <span class="stat-pill"><b>{{ totalRows.toLocaleString() }}</b> 行</span>
        <span class="stat-pill warn"><b>{{ dirtyRows }}</b> 改动</span>
        <span class="stat-pill danger"><b>{{ rules.errorCount.value }}</b> 错误</span>
        <span class="stat-pill ok"><b>{{ selectionCellCount }}</b> 选中</span>
        <span v-if="lastGen" class="stat-pill info">{{ lastGen }}</span>
      </div>
    </div>

    <EntryToolbar
      :ops="ops"
      :io="io"
      :find="find"
      :rules="rules"
      :conditional-on="conditionalOn"
      :freeze-first="freezeFirst"
      :submitting="ops.submitting.value"
      @toggle-cond="toggleConditional"
      @toggle-freeze="toggleFreeze"
      @open-columns="columnManagerVisible = true"
      @open-fill="fillVisible = true"
      @open-errors="errorDrawer = true"
      @gen-data="genData"
      @undo="onUndo"
      @redo="onRedo"
      @open-help="helpVisible = true"
    />

    <FindBar v-if="find.findVisible.value" :find="find" />

    <div class="tb-grid bi-panel" ref="gridBox">
      <div ref="containerRef" class="tb-canvas" />
    </div>

    <div class="tb-statusbar bi-statusbar">
      <span class="sb-item pos">{{ sheetApi.activeCell.value }}</span>
      <span class="sb-item">行数 <b>{{ totalRows.toLocaleString() }}</b></span>
      <span class="sb-item">改动 <b :class="{ 'c-warn': dirtyRows > 0 }">{{ dirtyRows }}</b></span>
      <span class="sb-item">选中 <b :class="{ 'c-ok': selectionCellCount > 0 }">{{ selectionCellCount }}</b></span>
      <span class="sb-item">错误 <b :class="{ 'c-danger': rules.errorCount.value > 0 }">{{ rules.errorCount.value }}</b></span>
      <template v-if="selectionStats">
        <span class="sb-sep" />
        <span class="sb-item">选区统计：</span>
        <span class="sb-item">计数 <b>{{ selectionStats.count }}</b></span>
        <span class="sb-item">求和 <b>{{ selectionStats.sum }}</b></span>
        <span class="sb-item">平均 <b>{{ selectionStats.avg }}</b></span>
        <span class="sb-item">最大 <b>{{ selectionStats.max }}</b></span>
        <span class="sb-item">最小 <b>{{ selectionStats.min }}</b></span>
      </template>
      <span class="sb-tip">
        双击编辑 · 拖拽/Shift 框选 · Ctrl+C/V 与 Excel 互通 · 拖右下角填充柄 · Delete 清空 · 右键菜单 · F1 看全部快捷键
      </span>
    </div>

    <!-- 单列配置：共享抽屉（与 vxe / Univer 同一份），右键菜单或列表「配置」都走它 -->
    <BiColumnDrawer
      v-model:visible="columnConfigVisible"
      :column="columnConfigTarget"
      :siblings="defs"
      :caps="{ width: true }"
      @confirm="onColumnConfigConfirm"
      @remove="onColumnConfigRemove"
    />
    <!-- 全量列列表：共享管理器 -->
    <BiColumnManager
      v-model:visible="columnManagerVisible"
      :cols="defs"
      :caps="{ frozen: false, retype: true, add: true }"
      @move="(i, dir) => ops.moveColumn(i, dir)"
      @rename="(field, label) => ops.updateColumn(field, { label })"
      @retype="(field, type) => ops.updateColumn(field, { type })"
      @toggle="onListToggle"
      @config="openColumnConfig"
      @remove="(field) => ops.removeColumn(field)"
      @add="(payload) => ops.addColumn(payload)"
    />

    <ErrorDrawer v-model:visible="errorDrawer" :errors="rules.errors.value" :rules="rules" />
    <FillDialog v-model:visible="fillVisible" :defs="defs" :ops="ops" />
    <HelpDialog v-model:visible="helpVisible" />
    <input ref="fileInputRef" type="file" accept=".xlsx,.xls" style="display: none" @change="io.onFileChange" />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import 'tabulator-tables/dist/css/tabulator.min.css';
import EntryToolbar from './components/EntryToolbar.vue';
import FindBar from './components/FindBar.vue';
import ErrorDrawer from './components/ErrorDrawer.vue';
import FillDialog from './components/FillDialog.vue';
import HelpDialog from './components/HelpDialog.vue';
import BiColumnDrawer from '@/components/bi-column-drawer/bi-column-drawer.vue';
import type { ColumnDraft } from '@/components/bi-column-drawer/types';
import BiColumnManager from '@/components/bi-column-manager/bi-column-manager.vue';
import { DEFAULT_COLS, genSampleRecords, type ColDef } from './schema';
import { useEntrySheet, type MenuItem } from './useEntrySheet';
import { useEntryRules } from './useEntryRules';
import { useEntryOps } from './useEntryOps';
import { useEntryIO } from './useEntryIO';
import { useEntryFind } from './useEntryFind';

defineOptions({ name: 'TabulatorEntry' });

const pageRef = ref<HTMLElement>();
const gridBox = ref<HTMLElement>();
const containerRef = ref<HTMLElement>();
const fileInputRef = ref<HTMLInputElement>();

// ===================== 列定义与 composables =====================
const defs = ref<ColDef[]>(DEFAULT_COLS.map((d) => ({ ...d, rules: d.rules ? { ...d.rules } : undefined })));
const sheetApi = useEntrySheet();
const rules = useEntryRules(sheetApi);
const find = useEntryFind(sheetApi, defs);

const columnConfigVisible = ref(false);
const columnConfigField = ref('');
const columnConfigTarget = computed(() => defs.value.find((d) => d.field === columnConfigField.value) ?? null);
const columnManagerVisible = ref(false);
const errorDrawer = ref(false);
const fillVisible = ref(false);
const helpVisible = ref(false);
const conditionalOn = ref(false);
const freezeFirst = ref(true);
const lastGen = ref('');
const totalRows = ref(0);
const dirtyRows = ref(0);

/** 列结构/外观重建：列同步（表头/宽度/可见/编辑器/冻结）+ 数据条 */
const applyChrome = () => {
  sheetApi.syncColumns(defs.value);
  sheetApi.applyDataBars(defs.value, conditionalOn.value);
};

const ops = useEntryOps(sheetApi, defs, rules, applyChrome);

// ===================== 脏行统计（行即对象，按基线快照逐行比对） =====================
let baseline: string[] = [];
const signatureOf = (rec: Record<string, unknown>): string => defs.value.map((d) => String(rec[d.field] ?? '')).join('\u0001');

const markBaseline = () => {
  baseline = sheetApi.readRecords().map(signatureOf);
  dirtyRows.value = 0;
};

const recomputeDirty = () => {
  const records = sheetApi.readRecords();
  let n = 0;
  records.forEach((rec, i) => {
    if (signatureOf(rec) !== (baseline[i] ?? '')) n++;
  });
  dirtyRows.value = n;
};

/** 批量变更后统一收口：重算行数/脏行 + 全量复检 */
const refreshAfterBulkChange = () => {
  totalRows.value = sheetApi.dataRowCount();
  recomputeDirty();
  rules.validateAndMark(defs.value);
};

const io = useEntryIO(sheetApi, defs, fileInputRef, () => {
  applyChrome();
  refreshAfterBulkChange();
});

// ===================== 选区统计 ====================
const selectionCellCount = computed(() => {
  const sel = sheetApi.selection.value;
  return sel ? sel.rows * sel.cols : 0;
});

/** 选区数值聚合 */
const selectionStats = computed(() => {
  const sel = sheetApi.selection.value;
  if (!sel) return null;
  const nums: number[] = [];
  sel.values.forEach((row) => {
    row.forEach((v) => {
      if (v === null || v === undefined || v === '') return;
      const n = Number(v);
      if (Number.isFinite(n)) nums.push(n);
    });
  });
  if (!nums.length) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  return {
    count: nums.length,
    sum: Number(sum.toFixed(2)),
    avg: Number((sum / nums.length).toFixed(2)),
    max: Math.max(...nums),
    min: Math.min(...nums),
  };
});

// ===================== 打开单列配置（右键菜单 / 列列表） =====================
const openColumnConfig = (field: string) => {
  columnConfigField.value = field;
  columnConfigVisible.value = true;
};

// ===================== 单元格右键菜单（Menu 模块） =====================
/** 先把被点的格子变成选区，再复用同一套行操作——否则菜单会作用在上一次的选区上 */
const withCellSelected = (cell: Parameters<typeof sheetApi.selectCell>[0], run: () => void) => {
  sheetApi.selectCell(cell);
  run();
};

const cellMenuItems: MenuItem[] = [
  { label: '在上方插入行', action: (_e, cell) => withCellSelected(cell, ops.insertRowAbove) },
  { label: '复制选中行', action: (_e, cell) => withCellSelected(cell, ops.duplicateSelectedRows) },
  { label: '删除选中行', action: (_e, cell) => withCellSelected(cell, ops.deleteSelectedRows) },
  { label: '', separator: true },
  { label: '打开该列配置', action: (_e, cell) => openColumnConfig(String(cell.getField() ?? '')) },
  { label: '查找替换', action: () => find.open() },
];

/** 共享抽屉确认：改列定义走 ops.updateColumn（重写列 + 重校验） */
const onColumnConfigConfirm = (d: ColumnDraft) => {
  ops.updateColumn(d.field, {
    label: d.label,
    type: d.type,
    required: !!d.required,
    visible: d.visible,
    width: d.width ?? columnConfigTarget.value?.width ?? 120,
    options: d.type === 'select' ? d.options : undefined,
    rules: d.rules,
    cross: d.cross?.length ? d.cross : undefined,
  });
};

/** 共享抽屉里点「删除该列」 */
const onColumnConfigRemove = () => {
  if (columnConfigField.value) ops.removeColumn(columnConfigField.value);
};

/** 列列表里的开关：必填 / 显隐（frozen 由工具条统一控制，caps.frozen=false 不展示，这里兜底忽略） */
const onListToggle = (field: string, flag: 'required' | 'visible' | 'frozen') => {
  const def = defs.value.find((d) => d.field === field);
  if (!def) return;
  if (flag === 'required') ops.updateColumn(field, { required: !def.required });
  else if (flag === 'visible') ops.toggleColumnVisible(field);
};

// ===================== 主题 =====================
let themeObserver: MutationObserver | null = null;
const syncTheme = () => {
  const dark = document.documentElement.classList.contains('dark');
  sheetApi.setDark(dark);
};

// ===================== 撤销 / 重做（复用自带快照栈） =====================
const onUndo = () => {
  sheetApi.undo();
  totalRows.value = sheetApi.dataRowCount();
  recomputeDirty();
  rules.validateAndMark(defs.value);
};

const onRedo = () => {
  sheetApi.redo();
  totalRows.value = sheetApi.dataRowCount();
  recomputeDirty();
  rules.validateAndMark(defs.value);
};

// ===================== 初始化 =====================
const onKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
    e.preventDefault();
    find.open();
  } else if (e.key === 'F1') {
    e.preventDefault();
    helpVisible.value = true;
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
    onUndo();
  } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
    onRedo();
  }
};

const seedData = (records: ReturnType<typeof genSampleRecords>, label: string) => {
  sheetApi.writeRecords(records);
  applyChrome();
  refreshAfterBulkChange();
  markBaseline();
  lastGen.value = label;
};

onMounted(async () => {
  await nextTick();
  if (!containerRef.value) return;
  window.addEventListener('keydown', onKeydown);
  // 首屏装配必须等建表完成：Tabulator 构造函数内部是 setTimeout 延迟建表，
  // 返回时 setData / setColumns / redraw 都还没到可用时机（会刷 "Table Not Initialized" 并在加载器里抛错）。
  sheetApi.init(containerRef.value, () => {
    // 菜单要在首次 syncColumns 之前注入，列定义重建时才会挂上 contextMenu
    sheetApi.setCellMenu(cellMenuItems);
    syncTheme();
    ops.loadTemplates();
    seedData(genSampleRecords(200), '示例 200 行');
  });
  sheetApi.setFrozenFirst(true);
  themeObserver = new MutationObserver(syncTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  themeObserver?.disconnect();
  themeObserver = null;
  sheetApi.destroy();
});

// 命令执行（编辑/粘贴/填充/撤销）后刷新行数、脏行与统计；校验按数据量择机跑
watch(
  () => sheetApi.revision.value,
  () => {
    totalRows.value = sheetApi.dataRowCount();
    recomputeDirty();
    if (sheetApi.dataRowCount() <= 3000) rules.validateAndMark(defs.value);
  },
);

// ===================== 页面级动作 =====================
const toggleConditional = () => {
  conditionalOn.value = !conditionalOn.value;
  sheetApi.applyDataBars(defs.value, conditionalOn.value);
  ElMessage.success(conditionalOn.value ? '已开启条件格式：数值列数据条' : '已关闭条件格式');
};

const toggleFreeze = () => {
  freezeFirst.value = !freezeFirst.value;
  sheetApi.setFrozenFirst(freezeFirst.value);
  sheetApi.syncColumns(defs.value);
  ElMessage.success(freezeFirst.value ? '已冻结首列' : '已取消冻结首列');
};

const genData = (n: number) => {
  seedData(genSampleRecords(n), `压测 ${n.toLocaleString()} 行`);
  ElMessage.success(`已生成 ${n.toLocaleString()} 行压测数据`);
};
</script>

<style lang="less">
/* Tabulator 主题接入：基础样式已在 <script> 内 import（全局注入一次），
   此处仅用 .bi-* 令牌覆盖，保证三套录入台观感一致。
   DOM 模型的优势：斑马纹 / 必填红星 / 错误红 / 查找黄底 / 行 hover 全部走 CSS，零命令式成本。 */

.tb-page {
  .tb-canvas {
    width: 100%;
    height: 100%;
  }

  /* 表头：亚灰底 + 加粗 + 居中，与另两套表头同色 */
  .tabulator .tabulator-header {
    background: var(--bi-head-bg);
    border-bottom: 1px solid var(--bi-border);
  }
  .tabulator .tabulator-header .tabulator-col {
    background: var(--bi-head-bg);
    border-right: 1px solid var(--bi-border-soft);
  }
  .tabulator .tabulator-header .tabulator-col-title {
    font-weight: 600;
    color: var(--bi-text);
    text-align: center;
  }
  .tb-req-star {
    color: var(--bi-danger);
    margin-left: 2px;
  }

  /* 单元格 */
  .tabulator .tabulator-cell {
    border-right: 1px solid var(--bi-border-soft);
    border-bottom: 1px solid var(--bi-border-soft);
    padding: 4px 8px;
    color: var(--bi-text);
  }
  .tabulator .tabulator-cell.cell-num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  /* 斑马纹（DOM 原生，比 Univer 画布易做得多）。
     必须显式给行基础底色：Tabulator 默认 .tabulator-row 是白底，暗色主题下不覆盖就是一条白带。 */
  .tabulator .tabulator-row {
    background-color: var(--bi-panel);
    border-bottom: 1px solid var(--bi-border-soft);
  }
  .tabulator .tabulator-row:nth-child(even),
  .tabulator .tabulator-row.tabulator-row-even {
    background-color: var(--bi-stripe);
  }
  /* hover：未开行选择后行上不再有 .tabulator-selectable 类，直接按行给 hover；
     抬高一级特异性，压过 Tabulator 自带的 .tabulator-row:hover。 */
  .tabulator .tabulator-row:hover {
    background-color: var(--bi-hover);
  }

  /* ===== 单元格选区（SelectRange 覆盖层） =====
     官方是把蓝框画在一个覆盖层 div 上（不是给单元格上底色），
     这里换成本项目主色 + 低透明度填充，保证文字依然清晰。 */
  .tabulator .tabulator-tableholder .tabulator-range-overlay .tabulator-range {
    border: 1px solid var(--bi-primary);
    background: var(--bi-select-fill);
  }
  .tabulator .tabulator-tableholder .tabulator-range-overlay .tabulator-range.tabulator-range-fill-preview {
    border-style: dashed;
    background: transparent;
  }
  .tabulator .tabulator-tableholder .tabulator-range-overlay .tabulator-range-cell-active {
    border: 2px solid var(--bi-primary);
    background: transparent;
  }
  /* 填充柄：右下角方点，拖拽即向下/向右填充 */
  .tabulator .tabulator-range-fill-handle {
    width: 8px;
    height: 8px;
    right: -4px;
    bottom: -4px;
    background-color: var(--bi-primary);
    box-shadow: 0 0 0 1px var(--bi-panel);
  }
  /* 选区覆盖到的列头同步高亮 */
  .tabulator .tabulator-header .tabulator-col.tabulator-range-selected,
  .tabulator .tabulator-header .tabulator-col.tabulator-range-highlight {
    background-color: var(--bi-primary-soft);
    color: var(--bi-text);
  }

  /* ===== 列头筛选 + 排序 ===== */
  .tabulator .tabulator-header .tabulator-col .tabulator-col-content {
    padding: 4px 6px;
  }
  .tabulator .tabulator-header .tabulator-header-filter input,
  .tabulator .tabulator-header .tabulator-header-filter select {
    box-sizing: border-box;
    width: 100%;
    height: 22px;
    padding: 0 4px;
    font-size: 12px;
    color: var(--bi-text);
    background: var(--bi-input-bg);
    border: 1px solid var(--bi-border-soft);
    border-radius: var(--bi-radius-sm);
    outline: none;
  }
  .tabulator .tabulator-header .tabulator-header-filter input:focus,
  .tabulator .tabulator-header .tabulator-header-filter select:focus {
    border-color: var(--bi-primary);
  }
  .tabulator .tabulator-header .tabulator-col .tabulator-col-title {
    padding-bottom: 2px;
  }
  /* 排序箭头：官方 CSS 把颜色写死（未排序 #bbb / 已排序 #666），暗色表头上偏暗。
     注意特异性：官方是
       .tabulator .tabulator-header .tabulator-col.tabulator-sortable[aria-sort="descending"]
         .tabulator-col-content .tabulator-col-sorter .tabulator-arrow   → 0,8,0
     短选择器（.tabulator-arrow 那几层）压不住，必须按同一条路径写全，再加 .tb-page 前缀赢一级。 */
  .tabulator .tabulator-header .tabulator-col.tabulator-sortable .tabulator-col-content .tabulator-col-sorter .tabulator-arrow {
    border-top-color: var(--bi-sub);
    border-bottom-color: var(--bi-sub);
  }
  .tabulator .tabulator-header .tabulator-col.tabulator-sortable[aria-sort='ascending'] .tabulator-col-content .tabulator-col-sorter .tabulator-arrow,
  .tabulator .tabulator-header .tabulator-col.tabulator-sortable[aria-sort='descending'] .tabulator-col-content .tabulator-col-sorter .tabulator-arrow {
    border-top-color: var(--bi-primary);
    border-bottom-color: var(--bi-primary);
  }

  /* 冻结首列（自定义 sticky 类，不用 frozen 选项，避免 SelectRange 的误报警告）：
     表头与单元格都左贴边，单元格底色继承行，斑马纹/hover/错误标红都能跟着走。 */
  .tabulator .tabulator-header .tabulator-col.tb-pin-col {
    position: sticky;
    left: 0;
    z-index: 11;
    background: var(--bi-head-bg);
    border-right: 2px solid var(--bi-border);
  }
  .tabulator .tabulator-row .tabulator-cell.tb-pin-col {
    position: sticky;
    left: 0;
    z-index: 11;
    background-color: inherit;
    border-right: 2px solid var(--bi-border);
  }

  /* 错误格：浅红底 + 红字 */
  .tabulator .tabulator-cell.cell-error {
    background: var(--bi-danger-bg) !important;
    color: var(--bi-danger) !important;
    font-weight: 600;
  }

  /* 查找命中：浅黄底 */
  .tabulator .tabulator-cell.cell-find {
    background: var(--bi-find-bg) !important;
  }

  /* 滚动条容器占满 */
  .tabulator {
    background: var(--bi-input-bg);
    border: 1px solid var(--bi-border);
    border-radius: var(--bi-radius);
    height: 100%;
  }
  .tabulator .tabulator-tableholder {
    overflow: auto;
  }
}

/* 暗色：仅靠令牌切换即可，DOM 模型天然继承 html.dark 的 --bi-* 变量 */
html.dark .tb-page {
  .tabulator .tabulator-header,
  .tabulator .tabulator-header .tabulator-col {
    background: var(--bi-head-bg);
  }
}

/* ===== 右键菜单 =====
   Menu 模块把弹层 append 到 body（在 .tb-page 之外），拿不到 --bi-* 令牌，
   所以这里用与令牌同值的字面色，并按 html.dark 给一套暗色。 */
.tabulator-popup-container {
  padding: 4px;
  font-size: 13px;
  color: #1d2129;
  background: #fff;
  border: 1px solid #e5e7ec;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgb(16 24 40 / 12%);
}
.tabulator-menu .tabulator-menu-item {
  padding: 6px 12px;
  border-radius: 6px;
}
.tabulator-menu .tabulator-menu-item:not(.tabulator-menu-item-disabled):hover {
  background: #f2f5fa;
}
.tabulator-menu .tabulator-menu-separator {
  margin: 4px 0;
  border-top: 1px solid #eef0f4;
}
html.dark .tabulator-popup-container {
  color: #e6e8ec;
  background: #16191f;
  border-color: #272c35;
  box-shadow: 0 8px 24px rgb(0 0 0 / 45%);
}
html.dark .tabulator-menu .tabulator-menu-item:not(.tabulator-menu-item-disabled):hover {
  background: #2e3137;
}
html.dark .tabulator-menu .tabulator-menu-separator {
  border-top-color: #20242c;
}
</style>

<style lang="less" scoped>
/* 页面骨架（.bi-page / .bi-header / .stat-pill / .bi-panel / .bi-statusbar）与色板（--bi-*）
   由全局 assets/style/bi-entry.less 提供，三套录入台共用；此处只留 Tabulator 专有部分。 */
.tb-canvas {
  width: 100%;
  height: 100%;
}
</style>
