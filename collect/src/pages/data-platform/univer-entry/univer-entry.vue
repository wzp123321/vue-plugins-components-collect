<!--
  Univer BI 数据录入台（页面入口 · 装配层）
  ============================================================================
  本文件职责：
    1. 组装布局：工具条 / 查找条 / 画布表格 / 状态栏 / 各抽屉弹窗（页头标题与统计条已按需求去掉，纵向空间全留给数据区）；
    2. 装配 composables（useEntrySheet / useEntryRules / useEntryOps / useEntryIO / useEntryFind）
       并把它们接线到子组件与键盘快捷键；
    3. 承担页面级协调：初始数据装载、列结构变更后的"表头 + 验证 + 冻结 + 筛选区"重下发、
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
    - 行级校验（行内有值即校验 / 错误格红框+淡红底）/ 模板 / 批量填充 / 数据质量 / 提交 → 本页自研（Univer 无对应能力）
  ============================================================================
-->
<template>
  <div class="ue-page bi-page" ref="pageRef">
    <EntryToolbar
      :ops="ops"
      :find="find"
      @add-column="openAddColumn"
      @undo="onUndo"
      @redo="onRedo"
      @save="onSave"
    />

    <FindBar v-if="find.findVisible.value" ref="findBarRef" :find="find" />

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

    <ColumnDrawer v-model:visible="columnDrawer" :defs="defs" :ops="ops" @config="openColumnConfig" />
    <BiColumnDrawer
      v-model:visible="columnConfigVisible"
      :column="columnConfigTarget"
      :add="columnConfigAddMode"
      :siblings="defs"
      :caps="{ width: true }"
      @confirm="onColumnConfigConfirm"
      @add="onColumnConfigAdd"
      @remove="onColumnConfigRemove"
    />
    <RegionPickerDialog
      v-model:visible="regionPickerVisible"
      :current="regionPickerCurrent"
      @confirm="onRegionPicked"
    />
    <FillDialog v-model:visible="fillVisible" :defs="defs" :ops="ops" />
    <HelpDialog v-model:visible="helpVisible" />
    <input ref="fileInputRef" type="file" accept=".xlsx,.xls" style="display: none" @change="io.onFileChange" />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import EntryToolbar from './components/EntryToolbar.vue';
import ColumnDrawer from './components/ColumnDrawer.vue';
import BiColumnDrawer from '@/components/bi-column-drawer/bi-column-drawer.vue';
import type { ColumnDraft } from '@/components/bi-column-drawer/types';
import FillDialog from './components/FillDialog.vue';
import FindBar from './components/FindBar.vue';
import HelpDialog from './components/HelpDialog.vue';
import RegionPickerDialog from './components/RegionPickerDialog.vue';
import type { RegionValue } from './region-data';
import { DEFAULT_COLS, HEADER_ROW, SHEET_ROW_COUNT, genSampleRecords, rowIsEmpty, rowSignature, type ColDef } from './schema';
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
/** 查找替换条实例：Ctrl+H 时主动聚焦「替换为」输入框 */
const findBarRef = ref<InstanceType<typeof FindBar>>();

// ===================== 列定义与 composables =====================
const defs = ref<ColDef[]>(DEFAULT_COLS.map((d) => ({ ...d, rules: d.rules ? { ...d.rules } : undefined })));
const sheetApi = useEntrySheet();
const rules = useEntryRules(sheetApi);
const find = useEntryFind(sheetApi, defs);

const columnDrawer = ref(false);
/** 点列标 → 单列配置（与另两套同一份共享抽屉）；工具栏「列设置」仍走全量列表 */
const columnConfigVisible = ref(false);
const columnConfigField = ref('');
/** 新增模式：工具栏「新增列」打开同一个抽屉，但不绑定任何已有列 */
const columnConfigAddMode = ref(false);
const columnConfigTarget = computed(() =>
  (columnConfigAddMode.value ? null : defs.value.find((d) => d.field === columnConfigField.value) ?? null)
);
const fillVisible = ref(false);
const helpVisible = ref(false);
const totalRows = ref(0);
const dirtyRows = ref(0);

// ===================== 院区选择弹框状态 =====================
const regionPickerVisible = ref(false);
/** 本次弹框要回填的单元格坐标（0-based） */
const regionPickerCell = reactive({ row: -1, col: -1 });
const regionPickerCurrent = ref<RegionValue | null>(null);

/**
 * 进页面/重建结构后**清掉选区**，不留任何默认选中格。
 *
 * 为什么不是"选中 A1 或 A2"：这是一张录入表，一进页面就在表头上挂个蓝框，
 * 看起来像"表头被选中了"（用户反馈的第 1 条），也没有任何业务含义。
 * Univer 的 Facade 没有 clear 方法，只能下发 SetSelectionsOperation 并传空数组
 * （见 useEntrySheet.clearSelection）；命令不可用时退化为"光标落在第一个数据格"，
 * 至少不会落在表头上。
 */
const releaseSelection = () => {
  sheetApi.clearSelection().then((ok) => {
    if (!ok) sheetApi.focusCell(HEADER_ROW + 1, 0);
  });
};

/**
 * 重下发"表格外观与约束"：表头 → 列宽 → 显隐 → 数据验证 → 冻结 → 筛选区。
 * 每次列结构变化都要走一遍（Univer 的验证/格式挂在具体列区间上，列一挪就失效）。
 */
const applyChrome = () => {
  sheetApi.writeHeader(defs.value);
  sheetApi.applyColumnWidths(defs.value);
  sheetApi.applyColumnVisibility(defs.value);
  sheetApi.applyDataValidation(defs.value);
  // 只冻结表头行，不冻结任何列（首列冻结已按需求去掉）
  sheetApi.applyFreeze(false);
  // 漏斗按钮依赖 filterModel 的 range，ribbon 被隐藏后没有开关菜单，必须主动建筛选区
  sheetApi.ensureFilter(defs.value.length);
  // 上面这些整列 range 操作（写表头 / 显隐列 / 数据验证）会把 active cell 顺带挪到最后一列，
  // 表现为"一进页面就整列选中备注列"。收尾统一清掉选区。
  releaseSelection();
};

const ops = useEntryOps(sheetApi, defs, rules, applyChrome);

// ===================== 脏行统计（无行对象，靠与基线快照逐格比对） =====================
let baseline: string[] = [];
/** 上一轮读取到的行签名：用来定位"哪几行被改过"，行级校验只重算这些行 */
let prevSigs: string[] = [];
/** 院区值是对象，String() 会退化成 [object Object]，统一走共用签名函数 */
const signatureOf = (rec: Record<string, unknown>): string => rowSignature(defs.value, rec);

const markBaseline = () => {
  const records = sheetApi.readRecords(defs.value);
  baseline = records.map(signatureOf);
  // 行级校验的"上一轮快照"与基线同步，避免初始化那一次把整表当成改动
  prevSigs = [...baseline];
  dirtyRows.value = 0;
};

const countDirty = (records: ReturnType<typeof sheetApi.readRecords>) => {
  let n = 0;
  records.forEach((rec, i) => {
    if (signatureOf(rec) !== (baseline[i] ?? '')) n++;
  });
  dirtyRows.value = n;
};

const recomputeDirty = () => {
  countDirty(sheetApi.readRecords(defs.value));
};

/** 批量变更后统一收口：重算行数/脏行（行级校验由 revision watcher 负责，这里只管统计） */
const refreshAfterBulkChange = () => {
  totalRows.value = sheetApi.dataRowCount();
  recomputeDirty();
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
// ⚠️ 清空选区后 Univer 仍保留"上一次的活动格"（内部 lastSelectionPrimaryCell 不清），
//    getActiveCell() 会返回陈旧地址；此时按"无选区"显示 ——，否则状态栏会一直挂着 A1。
const activeCell = ref('—');
watch(
  [() => sheetApi.revision.value, () => sheetApi.selection.value],
  () => {
    activeCell.value = sheetApi.selection.value ? sheetApi.activeCellA1() : '—';
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
 *
 * 打开的是**单列配置抽屉**（components/bi-column-drawer，三套共用），
 * 与 vxe / vtable-sheet 完全同一套交互；工具栏的「列设置」仍是全量列表抽屉。
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
    columnConfigAddMode.value = false;
    columnConfigField.value = d.field;
    columnConfigVisible.value = true;
  },
);

/** 抽屉关闭后复位，否则同一列第二次点击不会再弹 */
watch(columnConfigVisible, (v) => {
  if (!v) lastHeaderCol.value = -1;
});

/** 列设置（全量列表）里点「配置」：打开同一份单列配置抽屉 */
const openColumnConfig = (field: string) => {
  columnConfigAddMode.value = false;
  columnConfigField.value = field;
  columnConfigVisible.value = true;
};

/** 工具栏「新增列」：打开同一个抽屉的新增模式（不绑定已有列） */
const openAddColumn = () => {
  columnConfigAddMode.value = true;
  columnConfigField.value = '';
  columnConfigVisible.value = true;
};

/** 新增模式确认：ops.addColumn 会重写表头/数据并走 applyChrome 重建筛选区 */
const onColumnConfigAdd = (d: Omit<ColumnDraft, 'field'>) => {
  ops.addColumn({
    label: d.label,
    type: d.type,
    required: d.required,
    visible: d.visible,
    width: d.width,
    options: d.options,
    rules: d.rules,
    cross: d.cross?.length ? d.cross : undefined,
    dateFormat: d.dateFormat,
  });
};

/** 共享抽屉确认：改列定义走 ops.updateColumn（重写表头 + 重下发验证 + 重校） */
const onColumnConfigConfirm = (d: ColumnDraft) => {
  const target = columnConfigTarget.value;
  ops.updateColumn(d.field, {
    label: d.label,
    type: d.type,
    required: !!d.required,
    visible: d.visible,
    width: d.width ?? target?.width ?? 120,
    dateFormat: d.type === 'date' ? d.dateFormat : undefined,
    options: d.type === 'select' ? d.options : undefined,
    rules: d.rules,
    cross: d.cross?.length ? d.cross : undefined,
  });
};

/** 共享抽屉里点「删除该列」 */
const onColumnConfigRemove = () => {
  if (columnConfigField.value) ops.removeColumn(columnConfigField.value);
};

// ===================== 院区单元格：双击弹出选择器 =====================
/**
 * 交互口径（对齐 Excel / 飞书多维表格这类带选择器的表格）：
 *   - **单击只选中**，不弹任何东西 → 用户可以正常 Ctrl+C 复制、Ctrl+V 粘贴、拖填充柄；
 *   - **双击才进入编辑**：院区列弹院区选择框。
 * 早期是单击即弹，结果是"想复制一个单元格的数据根本做不到"（一按就弹框、焦点被抢走）。
 *
 * 下拉列（select）不走这里：它挂的是 Univer 原生 LIST 规则（renderMode TEXT，静态不画箭头），
 * 点中单元格即由 registerCellClick 弹原生选项列表，见该函数注释。
 */
const lastClickCell = reactive({ row: -1, col: -1 });

/** 弹框确定 / 清除：把选中的 {name,id,code} 回填到点击的那个单元格 */
const onRegionPicked = (value: RegionValue | null) => {
  const { row, col } = regionPickerCell;
  if (row > HEADER_ROW && col >= 0) sheetApi.setRegionCell(row, col, value);
  regionPickerCell.row = -1;
  regionPickerCell.col = -1;
};

/** 该列是否需要"双击进选择器" */
const isPickerColumn = (def: ColDef | undefined): boolean => def?.type === 'region';

/** 在指定格上打开院区选择器 */
const openPickerAt = (row: number, col: number) => {
  regionPickerCell.row = row;
  regionPickerCell.col = col;
  regionPickerCurrent.value = sheetApi.getRegionValue(row, col);
  regionPickerVisible.value = true;
};

/**
 * 双击拦截：必须挂**捕获阶段**。
 * Univer 把 dblclick 监听挂在画布元素上，双击选择器列时会先进入单元格文本编辑；
 * 在容器上捕获到 dblclick 后 stopPropagation，编辑就不会启动，弹框独占这次双击。
 *
 * 单元格坐标取自最近一次 CellClicked（click 一定晚于 pointerdown、早于 dblclick）。
 * 不用"时间窗口"判断：每次 pointerdown 先把坐标作废，再由紧随其后的 click 填回来。
 * 这样 dblclick 落在**表头**（不会触发 CellClicked）或拖拽松手时，坐标是空的，不会误弹；
 * 也不必猜"用户两次点击的间隔有多长"（早期用 600ms 窗口，慢速双击会被漏掉）。
 */
const onGridDblClick = (e: MouseEvent) => {
  const c = lastClickCell;
  if (c.row < 0) return;
  if (c.row <= HEADER_ROW || c.col < 0 || c.col >= defs.value.length) return;
  if (!isPickerColumn(defs.value[c.col])) return;
  e.preventDefault();
  e.stopPropagation();
  openPickerAt(c.row, c.col);
};

/**
 * 订阅"用户点中了某一格"（row / column 均 0-based）。
 * 信号来自 useEntrySheet 的指针判定（Univer 的 CellClicked 事件在本页收不到，原因见那边的注释）。
 * 两件事：
 *   1. 记录"最近点了哪一格"，作为双击定位的依据（院区列双击弹选择框靠它）；
 *   2. 下拉列（select）点中即弹**原生**选项列表。该列的验证规则渲染模式是 TEXT，
 *      静态只有文本、没有常驻箭头，"聚焦才出现下拉"由此保证：点一下弹列表、选完自动收起。
 *      拖选 / 拖填充柄不会误弹：选区不是单格时 useEntrySheet 就不上报。
 */
const registerCellClick = () => {
  sheetApi.onCellClick(({ row, column }) => {
    lastClickCell.row = row;
    lastClickCell.col = column;
    if (row <= HEADER_ROW) return;
    const def = defs.value[column];
    if (def?.type === 'select' && def.options?.length) sheetApi.showOptionDropdown(row, column);
  });
};

/** 每次按下先把"上一格"作废：表头上双击、拖填充柄松手都不会再带出陈旧的单元格坐标 */
const onGridPointerDown = () => {
  lastClickCell.row = -1;
  lastClickCell.col = -1;
};

// ===================== 主题 =====================
let themeObserver: MutationObserver | null = null;
const syncTheme = () => {
  const dark = document.documentElement.classList.contains('dark');
  sheetApi.setDark(dark);
  // 表头底色写的是「亮色值」，暗黑由 Univer 反色统一处理，理论上无需重下发；
  // 但切主题会触发整体重绘，这里重写一次保证加粗/居中/底色在切换后仍一致（幂等、代价小）。
  sheetApi.writeHeader(defs.value);
};

// ===================== 初始化 =====================
/** 快捷键：Ctrl+F 打开查找条、F1 打开帮助（其余快捷键由 Univer 自身接管） */
const onKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
    e.preventDefault();
    find.open();
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
    // 替换快捷键：没开查找条先开，再聚焦「替换为」输入框
    e.preventDefault();
    if (!find.findVisible.value) find.open();
    nextTick(() => findBarRef.value?.focusReplace());
  } else if (e.key === 'F1') {
    e.preventDefault();
    helpVisible.value = true;
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
    // Univer 已处理 Ctrl+Z；这里只补一次统计刷新，避免脏行数字滞后
    setTimeout(recomputeDirty, 120);
  }
};

const seedData = (records: ReturnType<typeof genSampleRecords>) => {
  sheetApi.writeRecords(defs.value, records);
  applyChrome();
  refreshAfterBulkChange();
  markBaseline();
};

onMounted(async () => {
  await nextTick();
  if (!containerRef.value) return;
  // 本应用 :root 字号被大屏方案放大到 ~78px，会把 Univer 的 rem 尺寸放大 ~4.88 倍；
  // 进本页时恢复 16px（样式见下方 html.univer-normal-rem），离开时移除，不影响其它页面。
  document.documentElement.classList.add('univer-normal-rem');
  sheetApi.init(containerRef.value);
  registerCellClick();
  // 双击选择器列：捕获阶段拦截，避免 Univer 同时进入文本编辑（见 onGridDblClick）
  containerRef.value.addEventListener('dblclick', onGridDblClick, true);
  containerRef.value.addEventListener('pointerdown', onGridPointerDown, true);
  syncTheme();
  // 站点主题切换（html.dark）时同步给 Univer
  themeObserver = new MutationObserver(syncTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  seedData(genSampleRecords(10));
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  containerRef.value?.removeEventListener('dblclick', onGridDblClick, true);
  containerRef.value?.removeEventListener('pointerdown', onGridPointerDown, true);
  themeObserver?.disconnect();
  themeObserver = null;
  document.documentElement.classList.remove('univer-normal-rem');
  sheetApi.destroy();
});

// ===================== 合并单元格 =====================
// 合并/取消合并的工具栏入口已随精简下线（Univer 原生右键菜单仍可用）；
// 对应的 sheetApi.mergeSelection / clearAllMerges 保持在网格底座里，需要时再接回来。

// 命令执行（编辑/粘贴/填充/撤销）后：刷新行数与脏行，并对"内容变过的行"做行级校验。
// 校验口径（与用户确认过的交互）：
//   - 一行只要有一个单元格有值，就校验整行 → 必填缺失 / 格式错 / 唯一性冲突当场红框；
//   - 整行被清空 → 视为"还没开始填"，清掉该行红框，不报错；
//   - 不弹任何错误面板，错误只体现在单元格边框与顶部/状态栏的「错误」计数上。
watch(
  () => sheetApi.revision.value,
  () => {
    totalRows.value = sheetApi.dataRowCount();
    const records = sheetApi.readRecords(defs.value);
    countDirty(records);
    const changed: number[] = [];
    records.forEach((rec, i) => {
      if (signatureOf(rec) !== (prevSigs[i] ?? '')) changed.push(i);
    });
    prevSigs = records.map(signatureOf);
    if (changed.length) rules.revalidateRows(defs.value, changed);
  },
);

// ===================== 页面级动作 =====================
const onUndo = () => {
  sheetApi.undo();
  setTimeout(() => {
    totalRows.value = sheetApi.dataRowCount();
    recomputeDirty();
  }, 120);
};

const onRedo = () => {
  sheetApi.redo();
  setTimeout(() => {
    totalRows.value = sheetApi.dataRowCount();
    recomputeDirty();
  }, 120);
};

/**
 * 保存（mock）：**先整表复核、再打印**。
 *   1. 全表跑一遍规则引擎（必填 / 数值区间 / 长度 / 正则 / 唯一 / 跨列），
 *      未通过的单元格描红框（只描边、不改底色，见 useEntryRules.markErrors）；整行为空的行跳过；
 *   2. 有错误 → 滚到第一条错误格，不打印数据（不弹面板，红框就是提示）；
 *   3. 全部通过 → 把录入数据打印到控制台，不做真实持久化。
 * 打印的是 readRecords 的原样记录：院区列是 {name,id,code} 对象，三者都能看到；
 * 空行（所有列都为空）不参与保存，与提交流程口径一致。
 */
const onSave = () => {
  const errs = rules.validateAndMark(defs.value);
  if (errs.length) {
    rules.jumpTo(errs[0]);
    ElMessage.error(`有 ${errs.length} 处未通过校验，已用红框标出`);
    return;
  }
  const records = sheetApi.readRecords(defs.value).filter((r) => !rowIsEmpty(defs.value, r));
  console.log('[Univer 录入台] 保存数据', {
    columns: defs.value.map((d) => ({ field: d.field, label: d.label, type: d.type })),
    rows: records,
  });
  ElMessage.success(`校验通过，已保存 ${records.length} 条记录，数据已打印到控制台`);
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

/* ===== 下拉候选面板（数据验证下拉） =====
   它**不是** .univer-popup，而是 teleport 到 body 的另一个 portal：
   <section class="univer-pointer-events-auto univer-fixed univer-z-[1020]">
     └ div.univer-rounded-lg.univer-bg-gray-0（面板）
        └ div.univer-max-h-52（滚动区）└ div.univer-cursor-pointer（候选项）└ div.univer-rounded-full（值药丸）
   Univer 默认 py-1(4px) + 药丸高 16px，一行只有 16px：字贴着上下沿、候选项之间又留 gap，
   既有挤压感又显松散。这里统一成「28px 高菜单行 + 12.5px 字」，与左侧工具栏同密度。
   选择器一律带 section.univer-pointer-events-auto 前缀，避免误伤主画布上的其它浮层。 */
section.univer-pointer-events-auto {
  font-size: 12.5px;
  line-height: 20px;
}
/* 候选列表：拉开高度上限（208px → 264px），去掉项间 gap，左右内边距收到 4px */
section.univer-pointer-events-auto .univer-max-h-52 {
  max-height: 264px !important;
}
section.univer-pointer-events-auto .univer-gap-1 {
  gap: 0 !important;
}
section.univer-pointer-events-auto .univer-px-2 {
  padding-left: 4px !important;
  padding-right: 4px !important;
}
/* 候选项：28px 行高 + 6px 圆角，hover 由 Univer 自带的 bg 类负责 */
section.univer-pointer-events-auto .univer-cursor-pointer {
  min-height: 28px !important;
  padding: 4px 8px !important;
  border-radius: 6px !important;
}
/* 候选值默认会被包成一枚圆角药丸（rounded-full + px-1.5 + h-4），列表里像一串标签；
   录入台按纯文本菜单行显示，去掉药丸的底色/内边距，只留文字 */
section.univer-pointer-events-auto .univer-cursor-pointer .univer-rounded-full {
  height: auto !important;
  padding: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
}
section.univer-pointer-events-auto .univer-text-xs {
  font-size: 12.5px !important;
  line-height: 20px !important;
}
/* 暗色主题下候选值仍是 univer-text-gray-900（rgb(27,28,31)），落在深色面板上几乎看不见（实测对比度约 1.1:1）。
   面板底色由主题切成深色，文字色却没跟着切 —— 这是 Univer 下拉自身的主题缺口，只能在本页补。
   「选择一项」「编辑」等标题行走 univer-text-gray-1000/白字，不受影响。 */
html.dark section.univer-pointer-events-auto .univer-cursor-pointer,
html.dark section.univer-pointer-events-auto .univer-cursor-pointer * {
  color: #e8eaee !important;
}
/* 选中项的勾是 svg（currentColor），上面那条会把它一起染白、丢掉「已选中」的品牌色提示，这里单独还给蓝色 */
html.dark section.univer-pointer-events-auto .univer-cursor-pointer svg {
  color: #4c8dfd !important;
}
/* 顶部过滤输入框的 placeholder 同样继承暗字，提亮后才能看见提示语 */
html.dark section.univer-pointer-events-auto input::placeholder {
  color: #9aa0aa !important;
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
