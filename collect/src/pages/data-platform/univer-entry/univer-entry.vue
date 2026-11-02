<!--
  Univer BI 数据录入台（页面入口 · 装配层）
  ============================================================================
  本文件职责：
    1. 组装布局：标题统计条 / 工具条 / 查找条 / 画布表格 / 状态栏 / 各抽屉弹窗；
    2. 装配 composables（useEntrySheet / useEntryRules / useEntryOps / useEntryIO / useEntryFind）
       并把它们接线到子组件与键盘快捷键；
    3. 承担页面级协调：初始数据装载、列结构变更后的"表头 + 验证 + 冻结 + 条件格式"重下发、
       脏行统计（与基线快照逐格比对）、选区聚合统计、明暗主题跟随。

  在整体架构中的角色：对应 vxe 版的 excel-data-entry-vxe.vue —— 只做装配与协调，
  校验/操作/导入导出/查找这些真实逻辑都下沉在 composables 里。

  能力对标（vxe 版 → 本页）：
    - 虚拟滚动      → Univer 画布渲染本身就是视口级渲染，无需配置
    - 框选/整行整列  → Univer 原生；批量作用域仍从选区取
    - 填充柄/序列    → Univer 原生（拖右下角 ▢）
    - 复制粘贴/蚂蚁线 → Univer 原生（不进本页代码）
    - 撤销重做      → Univer 命令栈（本页只加按钮）
    - 排序/筛选     → Univer OSS preset（列头漏斗 + 右键）
    - 查找替换      → FTextFinder + 本页自绘高亮
    - 数据验证      → Univer data-validation（下拉 / 数字区间），其余规则由本地引擎兜底
    - 条件格式      → Univer conditional-formatting（数值列数据条）
    - 校验面板/模板/批量填充/数据质量/提交 → 本页自研（Univer 无对应能力）
  ============================================================================
-->
<template>
  <div class="ue-page bi-page" ref="pageRef">
    <div class="ue-header bi-header">
      <div class="ue-title bi-title">
        <span class="ue-logo bi-logo">U</span>
        <div>
          <h3>Univer BI 数据录入台</h3>
          <p class="ue-sub bi-sub">@univerjs/presets 1.3.0 · 全开源包（Apache-2.0）· 画布渲染 / 数据验证 / 条件格式 / 原生填充柄</p>
        </div>
      </div>
      <div class="ue-stats bi-stats">
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
      :merge-count="mergeCount"
      @toggle-cond="toggleConditional"
      @toggle-freeze="toggleFreeze"
      @open-columns="columnDrawer = true"
      @open-fill="fillVisible = true"
      @open-errors="errorDrawer = true"
      @gen-data="genData"
      @undo="onUndo"
      @redo="onRedo"
      @merge="onMerge"
      @clear-merges="onClearMerges"
      @open-help="helpVisible = true"
    />

    <FindBar v-if="find.findVisible.value" :find="find" />

    <div class="ue-grid bi-panel" ref="gridBox">
      <!-- Univer 画布挂载点：必须有确定尺寸（flex 撑满），否则初始化时拿到 0 尺寸画不出内容 -->
      <div ref="containerRef" class="ue-canvas" />
    </div>

    <div class="ue-statusbar bi-statusbar">
      <span class="sb-item pos">{{ activeCell }}</span>
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
        拖右下角 ▢ 序列填充 · Ctrl+C/V 复制粘贴 · Ctrl+Z 撤销 · 列头漏斗筛选/排序 · Ctrl+F 查找
      </span>
    </div>

    <ColumnDrawer v-model:visible="columnDrawer" :defs="defs" :ops="ops" :focus-field="columnFocus" @close="onColumnDrawerClose" />
    <ErrorDrawer v-model:visible="errorDrawer" :errors="rules.errors.value" :rules="rules" />
    <FillDialog v-model:visible="fillVisible" :defs="defs" :ops="ops" />
    <HelpDialog v-model:visible="helpVisible" />
    <input ref="fileInputRef" type="file" accept=".xlsx,.xls" style="display: none" @change="io.onFileChange" />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import EntryToolbar from './components/EntryToolbar.vue';
import ColumnDrawer from './components/ColumnDrawer.vue';
import ErrorDrawer from './components/ErrorDrawer.vue';
import FillDialog from './components/FillDialog.vue';
import FindBar from './components/FindBar.vue';
import HelpDialog from './components/HelpDialog.vue';
import { DEFAULT_COLS, SHEET_ROW_COUNT, genSampleRecords, type ColDef } from './schema';
import { useEntrySheet } from './useEntrySheet';
import { useEntryRules } from './useEntryRules';
import { useEntryOps } from './useEntryOps';
import { useEntryIO } from './useEntryIO';
import { useEntryFind } from './useEntryFind';

defineOptions({ name: 'UniverEntry' });

// 站点主题是 dark 时给 Univer 也切深色（Univer 用自己的主题系统，不读 html.dark）
const pageRef = ref<HTMLElement>();
const gridBox = ref<HTMLElement>();
const containerRef = ref<HTMLElement>();
const fileInputRef = ref<HTMLInputElement>();

// ===================== 列定义与 composables =====================
const defs = ref<ColDef[]>(DEFAULT_COLS.map((d) => ({ ...d, rules: d.rules ? { ...d.rules } : undefined })));
const sheetApi = useEntrySheet();
const rules = useEntryRules(sheetApi);
const find = useEntryFind(sheetApi, defs);

const columnDrawer = ref(false);
/** 点列标时带过去的列 field：抽屉打开后滚动并展开这一列 */
const columnFocus = ref('');
const errorDrawer = ref(false);
const fillVisible = ref(false);
const helpVisible = ref(false);
const conditionalOn = ref(false);
const freezeFirst = ref(true);
const lastGen = ref('');
const totalRows = ref(0);
const dirtyRows = ref(0);

/**
 * 重下发"表格外观与约束"：表头 → 列宽 → 显隐 → 数据验证 → 条件格式 → 冻结。
 * 每次列结构变化都要走一遍（Univer 的验证/格式挂在具体列区间上，列一挪就失效）。
 */
const applyChrome = () => {
  sheetApi.writeHeader(defs.value);
  sheetApi.applyColumnWidths(defs.value);
  sheetApi.applyColumnVisibility(defs.value);
  sheetApi.applyDataValidation(defs.value);
  sheetApi.applyDataBars(defs.value, conditionalOn.value);
  sheetApi.applyFreeze(freezeFirst.value);
};

const ops = useEntryOps(sheetApi, defs, rules, applyChrome);

// ===================== 脏行统计（无行对象，靠与基线快照逐格比对） =====================
let baseline: string[] = [];
const signatureOf = (rec: Record<string, unknown>): string => defs.value.map((d) => String(rec[d.field] ?? '')).join('\u0001');

const markBaseline = () => {
  baseline = sheetApi.readRecords(defs.value).map(signatureOf);
  dirtyRows.value = 0;
};

const recomputeDirty = () => {
  const records = sheetApi.readRecords(defs.value);
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

// 导入是覆盖式写入，收口逻辑与批量变更一致
const io = useEntryIO(sheetApi, defs, fileInputRef, () => {
  applyChrome();
  refreshAfterBulkChange();
});

// ===================== 选区统计 ====================
const selectionCellCount = computed(() => {
  const sel = sheetApi.selection.value;
  return sel ? sel.rows * sel.cols : 0;
});

/** 选区数值聚合：与 vxe 版状态栏的"选区内数字格统计"对齐 */
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

// 活动格地址（名称框语义）：Univer 的 selectionChange 不覆盖"仅移动活动格"的场景，
// 故订阅 revision + selection 两个信号，变更后主动取一次地址。
const activeCell = ref('—');
watch(
  [() => sheetApi.revision.value, () => sheetApi.selection.value],
  () => {
    activeCell.value = sheetApi.activeCellA1();
  },
  { immediate: false },
);

// ===================== 点列标 → 打开该列配置 =====================
/**
 * Univer 没有"列头点击"回调（FWorksheet 只暴露 selection 变更与命令事件），
 * 但点列标（A/B/C 那一行）会整列选中，用这个信号等价实现 vxe 版 header-cell-click → 打开列配置。
 * ⚠️ 整列选中的 A1 是**简写 "E:E"**（实测 selA1 === "E:E"），不是 "E1:E20000"；
 *    早期只认 "E1:E20000" 导致正则永不命中、抽屉打不开（"Univer 好像不支持"的真相）。
 *    两种都认：简写 "E:E" 直接判定；全量 "E1:E20000" 需行数达到底部（避免 A1:A10 这类选段误触）。
 * 不会误触的情况：单元格单击（C5）、拖拽选区（A1:C9）、点行标（A5:BD5）、左上角全选（A1:BD20000）。
 */
/** 列字母 → 0-based 索引（A=0, Z=25, AA=26…），不依赖 getRange 对简写的解析 */
const colIndexOfLetters = (letters: string): number =>
  [...letters].reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0) - 1;

const lastHeaderCol = ref(-1);
watch(
  () => sheetApi.selection.value?.a1,
  (a1) => {
    if (!a1) return;
    const shorthand = /^([A-Z]+):\1$/.exec(a1);
    const full = /^([A-Z]+)1:\1(\d+)$/.exec(a1);
    let letters = '';
    if (shorthand) letters = shorthand[1];
    else if (full && Number(full[2]) >= SHEET_ROW_COUNT) letters = full[1];
    if (!letters) return;
    const col = colIndexOfLetters(letters);
    if (col < 0 || col === lastHeaderCol.value) return;
    const d = defs.value[col];
    if (!d) return;
    lastHeaderCol.value = col;
    columnFocus.value = d.field;
    columnDrawer.value = true;
  },
);

/** 抽屉关闭后复位，否则同一列第二次点击不会再弹 */
const onColumnDrawerClose = () => {
  lastHeaderCol.value = -1;
  columnFocus.value = '';
};

// ===================== 主题 =====================
let themeObserver: MutationObserver | null = null;
const syncTheme = () => {
  const dark = document.documentElement.classList.contains('dark');
  sheetApi.setDark(dark);
  // 表头底色是硬编码到单元格的（Univer 无「表头分组/角标」能力），主题切换后需重下发，
  // 否则暗黑切回亮色时第 0 行表头仍残留旧底色。setDark 只改画布主题，不碰已写单元格。
  sheetApi.writeHeader(defs.value);
};

// ===================== 初始化 =====================
/** 快捷键：Ctrl+F 打开查找条、F1 打开帮助（其余快捷键由 Univer 自身接管） */
const onKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
    e.preventDefault();
    find.open();
  } else if (e.key === 'F1') {
    e.preventDefault();
    helpVisible.value = true;
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
    // Univer 已处理 Ctrl+Z；这里只补一次统计刷新，避免脏行数字滞后
    setTimeout(recomputeDirty, 120);
  }
};

const seedData = (records: ReturnType<typeof genSampleRecords>, label: string) => {
  sheetApi.writeRecords(defs.value, records);
  applyChrome();
  refreshAfterBulkChange();
  markBaseline();
  lastGen.value = label;
};

onMounted(async () => {
  await nextTick();
  if (!containerRef.value) return;
  // 本应用 :root 字号被大屏方案放大到 ~78px，会把 Univer 的 rem 尺寸放大 ~4.88 倍；
  // 进本页时恢复 16px（样式见下方 html.univer-normal-rem），离开时移除，不影响其它页面。
  document.documentElement.classList.add('univer-normal-rem');
  sheetApi.init(containerRef.value);
  syncTheme();
  // 站点主题切换（html.dark）时同步给 Univer
  themeObserver = new MutationObserver(syncTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  seedData(genSampleRecords(200), '示例 200 行');
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  themeObserver?.disconnect();
  themeObserver = null;
  document.documentElement.classList.remove('univer-normal-rem');
  sheetApi.destroy();
});

// ===================== 合并单元格 =====================
// Univer 的 merged cell 只有左上角保留值，其余格读出来为空 → 合并过的数据行在
// readRecords 里会出现"空字段"。所以这里不做静默合并：成功则在状态栏提示，失败把原因带出来。
const mergeCount = ref(0);
const refreshMergeCount = () => {
  mergeCount.value = sheetApi.mergeCount();
};

const onMerge = () => {
  const res = sheetApi.mergeSelection();
  if (!res.ok) {
    ElMessage.warning(res.msg);
    return;
  }
  refreshMergeCount();
  ElMessage.success(res.msg);
};

const onClearMerges = () => {
  const n = sheetApi.clearAllMerges();
  refreshMergeCount();
  ElMessage.success(n ? `已取消 ${n} 处合并` : '没有合并单元格');
};

// 命令执行（编辑/粘贴/填充/撤销）后刷新行数、脏行与统计；校验按数据量择机跑
watch(
  () => sheetApi.revision.value,
  () => {
    totalRows.value = sheetApi.dataRowCount();
    recomputeDirty();
    refreshMergeCount();
    // 大表逐格复检代价高：3000 行以内自动复检，超过则只在提交/结构变更/手动触发时校验
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
  sheetApi.applyFreeze(freezeFirst.value);
  ElMessage.success(freezeFirst.value ? '已冻结首列' : '已取消冻结首列');
};

const onUndo = () => {
  sheetApi.undo();
  setTimeout(() => {
    totalRows.value = sheetApi.dataRowCount();
    recomputeDirty();
    rules.validateAndMark(defs.value);
  }, 120);
};

const onRedo = () => {
  sheetApi.redo();
  setTimeout(() => {
    totalRows.value = sheetApi.dataRowCount();
    recomputeDirty();
    rules.validateAndMark(defs.value);
  }, 120);
};

const genData = (n: number) => {
  seedData(genSampleRecords(n), `压测 ${n.toLocaleString()} 行`);
  ElMessage.success(`已生成 ${n.toLocaleString()} 行压测数据`);
};

</script>

<style lang="less">
/* Univer 浮层（右键菜单 / 单元格下拉 / 筛选面板）由 React + Tailwind 原子类渲染，createPortal 到 body，
   实际挂在 <section class="univer-popup"> 下，scoped 样式够不到，故本块不 scoped。
   ⚠️ 锚点是 `.univer-popup` 这个类；`#univer-popup-portal-*` 只是个空容器（实测 0 子节点），
      早期按它写选择器是死代码，别再回去。
   ⚠️ 弹层"字改小了、框还是巨大"的真正根因：本应用 common.less 里
      `:root { font-size: calc(100vh / 10.8) }`（大屏自适应模板）把根字号顶到 ~78px，
      而 Univer 的 Tailwind 全用 rem（gap / padding / min-w / size 全被放大 ~4.88 倍）。
      rem 恒定相对根字号，压容器 font-size 治不了 → 必须在进入本页时把根字号恢复 16px。
      本页与外壳布局均为 px，实测侧边栏 / 表格不受影响；离开本页即移除，不污染其它页面。 */
html.univer-normal-rem {
  font-size: 16px;
}

.univer-popup {
  font-size: 12.5px;
  line-height: 18px;
}

.univer-popup .univer-text-xs,
.univer-popup .univer-text-sm,
.univer-popup .univer-text-base,
.univer-popup .univer-text-lg,
.univer-popup .univer-text-2xl {
  font-size: 12.5px !important;
  line-height: 18px !important;
}

/* 密度收紧到与下拉框一致的紧凑档（锚点只用 .univer-popup，按 Univer 真实 Tailwind 类覆盖） */
/* 菜单项高度 min-h-8(32px) → 24px；顶部图标行按钮 size-8/7 → 24/22px */
.univer-popup .univer-min-h-8 {
  min-height: 24px !important;
}
.univer-popup .univer-size-8 {
  width: 24px !important;
  height: 24px !important;
}
.univer-popup .univer-size-7 {
  width: 22px !important;
  height: 22px !important;
}
/* 面板宽度 min-w-52(208px) → 184px；项水平内边距 px-2(8px) → 6px；分组 py-1(4px) → 2px */
.univer-popup .univer-min-w-52 {
  min-width: 184px !important;
}
.univer-popup .univer-px-2 {
  padding-left: 6px !important;
  padding-right: 6px !important;
}
.univer-popup .univer-py-1 {
  padding-top: 2px !important;
  padding-bottom: 2px !important;
}

/* 兜底：popup 内所有文本统一收口（覆盖任何 Tailwind 工具类 / CSS-module 固定字号） */
.univer-popup * {
  font-size: 12.5px !important;
  line-height: 18px !important;
}
</style>

<style lang="less" scoped>
/* 页面骨架（.bi-page / .bi-header / .stat-pill / .bi-panel / .bi-statusbar）与色板（--ue-* → --bi-*）
   由全局 assets/style/bi-entry.less 提供，三套录入台共用；此处只留 Univer 专有部分。 */
/* 画布挂载点：必须有确定尺寸（.bi-panel 的 flex 撑满 + min-height 兜底），否则初始化时拿到 0 尺寸 */
.ue-canvas {
  width: 100%;
  height: 100%;
}
</style>
