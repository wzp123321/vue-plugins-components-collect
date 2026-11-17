<!--
 * 场景上下文：本页跑在 @visactor/vtable-sheet 上（工作表容器），底层仍由 @visactor/vtable 的
 *   ListTable 渲染，单元格编辑走 @visactor/vtable-editors。能力面对齐 Univer 录入台
 *   （pages/data-platform/univer-entry），但不重写 Excel 仿真层。
 * 技术组合：Vue3 <script setup> + @visactor/vtable-sheet 1.26.x + @visactor/vtable 1.26.x
 *          + @visactor/vtable-editors 1.26.x + Element Plus
 * 分工：sheet 管「数据 / 列 / 主题 / 生命周期 / 冻结」，单元格级交互（选区、滚动、编辑、
 *       重绘）走 WorkSheet 公开的 tableInstance；工具栏、撤销栈、右键菜单、查找替换是自绘的。
 *       因此 mainMenu / showFormulaBar / showSheetTab / undoRedo 全部关闭。
 * 功能面（对齐 Univer，只多不少不删）：
 *   工具条：新增行 / 新增列 / 撤销 / 重做 / 搜索 / 查找替换 / 保存；
 *   点列头 → 共享单列配置抽屉（BiColumnDrawer），新增列走抽屉 add 模式，删除列走抽屉「删除该列」；
 *   院区列（type='region'）双击弹 RegionPickerDialog；选区数字格聚合统计；
 *   表头筛选/排序抽屉、右键菜单（复制/粘贴/清空）、序列填充（填充柄 / Ctrl+D / Ctrl+R）。
 * 模块划分（./bi-entry/*）：
 *   schema.ts        数据契约（列/行/规则/字典/工具）
 *   useBiColumns     列结构增删改、显隐/冻结/分组、列宽分配
 *   useBiValidation  声明式校验（必填/范围/整数/长度/正则/唯一/跨列）
 *   useBiQuery       全局搜索、每列筛选、多列排序、查询 chips
 *   useBiHistory     撤销重做（结构快照 + 单元格增量）
 *   useBiActions     行操作、序列填充、种子数据
 * 本文件负责：VTable 实例与事件接线、键盘流、填充柄、右键菜单、院区选择器、全部 UI。
 * 踩坑落点：见 .workbuddy/memory/MEMORY.md「接缝本」
 -->
<template>
  <div class="vtable-sheet-bi" @keydown.esc="closeOverlays">
    <!-- ===================== 工具栏 ===================== -->
    <div class="vtable-sheet-bi__toolbar bi-toolbar">
      <div class="vtable-sheet-bi__group">
        <el-tooltip content="新增行（追加到末尾）" placement="bottom">
          <el-button :icon="Plus" size="small" @click="onAddRow" />
        </el-tooltip>
        <el-tooltip content="新增列" placement="bottom">
          <el-button :icon="Grid" size="small" @click="openAddCol" />
        </el-tooltip>
      </div>

      <el-divider direction="vertical" />

      <div class="vtable-sheet-bi__group">
        <el-tooltip :content="`撤销${undoLabel ? '：' + undoLabel : ''} (Ctrl+Z)`" placement="bottom">
          <el-button :icon="RefreshLeft" size="small" :disabled="!canUndo" @click="onUndo" />
        </el-tooltip>
        <el-tooltip :content="`重做${redoLabel ? '：' + redoLabel : ''} (Ctrl+Y)`" placement="bottom">
          <el-button :icon="RefreshRight" size="small" :disabled="!canRedo" @click="onRedo" />
        </el-tooltip>
      </div>

      <el-divider direction="vertical" />

      <div class="vtable-sheet-bi__group">
        <el-input
          v-model="query.searchText.value"
          size="small"
          clearable
          :prefix-icon="Search"
          placeholder="搜索全部字段…"
          class="vtable-sheet-bi__search"
        />
        <el-tooltip content="查找替换 (Ctrl+F)" placement="bottom">
          <el-button :icon="Aim" size="small" :type="findVisible ? 'primary' : 'info'" plain @click="toggleFind" />
        </el-tooltip>
        <el-tooltip content="筛选 / 排序" placement="bottom">
          <el-button :icon="Filter" size="small" :type="query.filters.value.length ? 'primary' : 'info'" plain @click="queryDrawer = true" />
        </el-tooltip>
      </div>

      <el-divider direction="vertical" />

      <el-tooltip content="保存（全量校验，mock 提交）" placement="bottom">
        <el-button type="success" :icon="SelectIcon" size="small" :loading="submitting" @click="onSubmit">保存</el-button>
      </el-tooltip>

      <el-divider direction="vertical" />

      <el-tooltip content="快捷键帮助 (F1)" placement="bottom">
        <el-button :icon="QuestionFilled" size="small" plain @click="helpVisible = true" />
      </el-tooltip>
    </div>

    <!-- ===================== 查询 chips ===================== -->
    <div v-if="chips.length" class="vtable-sheet-bi__chips">
      <span class="vtable-sheet-bi__chips-label">查询条件</span>
      <el-tag
        v-for="c in chips"
        :key="c.key"
        :type="chipTagType(c.kind)"
        closable
        size="small"
        @close="c.remove()"
      >
        {{ c.label }}
      </el-tag>
      <el-button size="small" text type="primary" @click="query.clearAllQuery()">清空全部</el-button>
    </div>

    <!-- ===================== 查找替换条 ===================== -->
    <div v-if="findVisible" class="vtable-sheet-bi__bar">
      <el-input v-model="findText" size="small" placeholder="查找内容" class="vtable-sheet-bi__bar-input" @keyup.enter="findNext" />
      <span class="vtable-sheet-bi__bar-count">{{ findIndexLabel }}</span>
      <el-button size="small" :icon="ArrowUp" @click="findPrev" />
      <el-button size="small" :icon="ArrowDown" @click="findNext" />
      <el-input v-model="replaceText" size="small" placeholder="替换为" class="vtable-sheet-bi__bar-input" />
      <el-button size="small" :disabled="!hasMatches" @click="replaceCurrent">替换</el-button>
      <el-button size="small" type="primary" plain :disabled="!hasMatches" @click="replaceAll">全部替换</el-button>
      <el-button size="small" text :icon="Close" @click="findVisible = false" />
    </div>

    <!-- ===================== 表格 ===================== -->
    <div ref="tableRef" class="vtable-sheet-bi__table bi-panel"></div>

    <!-- ===================== 状态栏 ===================== -->
    <div class="vtable-sheet-bi__status bi-statusbar">
      <span class="vtable-sheet-bi__status-pos sb-item pos">{{ posLabel }}</span>
      <span class="sb-item">行数 <b>{{ displayRows.length }}</b>/{{ records.length }}</span>
      <span class="sb-item">改动 <b :class="{ 'c-warn': dirtyCount > 0 }">{{ dirtyCount }}</b></span>
      <span class="sb-item">选中 <b :class="{ 'c-ok': selectedCount > 0 }">{{ selectedCount }}</b></span>
      <span class="sb-item">错误 <b :class="{ 'c-danger': errorCount > 0 }">{{ errorCount }}</b></span>
      <template v-if="selectionStats">
        <span class="sb-sep" />
        <span class="sb-item">选区：</span>
        <span class="sb-item">计数 <b>{{ selectionStats.count }}</b></span>
        <span class="sb-item">求和 <b>{{ selectionStats.sum }}</b></span>
        <span class="sb-item">平均 <b>{{ selectionStats.avg }}</b></span>
        <span class="sb-item">最大 <b>{{ selectionStats.max }}</b></span>
        <span class="sb-item">最小 <b>{{ selectionStats.min }}</b></span>
      </template>
      <span class="sb-tip">
        拖右下角 ▢ 序列填充（双击填到底）· Ctrl+D 向下 / Ctrl+R 向右 · 院区列双击选择 · 列头点击配置
      </span>
    </div>

    <!-- ===================== 右键菜单 ===================== -->
    <div v-if="menu.show" class="vtable-sheet-bi__menu" :style="{ left: `${menu.x}px`, top: `${menu.y}px` }">
      <div class="vtable-sheet-bi__menu-item" @click="menuAct('copy')">复制</div>
      <div class="vtable-sheet-bi__menu-item" @click="menuAct('paste')">粘贴</div>
      <div class="vtable-sheet-bi__menu-sep" />
      <div class="vtable-sheet-bi__menu-item" @click="menuAct('clear')">清空内容</div>
    </div>

    <!-- ===================== 单列配置 / 新增列（三套共用抽屉，交互唯一定义处） ===================== -->
    <BiColumnDrawer
      v-model:visible="colConfigVisible"
      :column="colConfigTarget"
      :add="addColMode"
      :siblings="cols"
      :caps="{ frozen: true, group: true }"
      @confirm="applyColConfig"
      @add="onColumnConfigAdd"
      @remove="onRemoveConfigCol"
    />

    <!-- ===================== 院区选择器（与 Univer 录入台同一份） ===================== -->
    <RegionPickerDialog
      v-model:visible="regionPickerVisible"
      :current="regionPickerCurrent"
      @confirm="onRegionPicked"
    />

    <!-- ===================== 筛选 / 排序抽屉 ===================== -->
    <el-drawer v-model="queryDrawer" title="筛选 / 排序" size="420px" class="bi-dlg">
      <div class="vtable-sheet-bi__querybox">
        <el-select v-model="queryField" size="small" placeholder="选择列" class="vtable-sheet-bi__coleselect">
          <el-option v-for="c in visibleCols" :key="c.field" :label="c.label" :value="c.field" />
        </el-select>
        <el-button size="small" @click="query.cycleSort(queryField, true)" :disabled="!queryField">按此列排序</el-button>
      </div>

      <template v-if="queryCol">
        <div class="vtable-sheet-bi__querysub">{{ queryCol.label }} · 筛选</div>
        <template v-if="queryCol.type === 'number'">
          <div class="vtable-sheet-bi__querybox">
            <el-input-number v-model="filterDraft.min" :controls="false" size="small" placeholder="最小值" />
            <el-input-number v-model="filterDraft.max" :controls="false" size="small" placeholder="最大值" />
            <el-button size="small" type="primary" @click="applyFilter">应用</el-button>
            <el-button size="small" @click="clearFilterOf(queryField)">清除</el-button>
          </div>
        </template>
        <template v-else>
          <el-select v-model="filterDraft.values" multiple filterable allow-create size="small" placeholder="选择或输入取值" class="vtable-sheet-bi__full">
            <el-option v-for="v in distinctValues" :key="v" :label="v" :value="v" />
          </el-select>
          <div class="vtable-sheet-bi__querybox">
            <el-button size="small" type="primary" @click="applyFilter">应用</el-button>
            <el-button size="small" @click="clearFilterOf(queryField)">清除</el-button>
          </div>
        </template>
      </template>

      <el-divider>当前条件</el-divider>
      <el-empty v-if="!chips.length" description="没有筛选或排序条件" :image-size="60" />
      <div v-else class="vtable-sheet-bi__querylist">
        <el-tag v-for="c in chips" :key="c.key" size="small" closable @close="c.remove()">{{ c.label }}</el-tag>
      </div>
    </el-drawer>

    <!-- ===================== 快捷键帮助 ===================== -->
    <el-dialog v-model="helpVisible" title="快捷键与操作" width="620px" append-to-body>
      <el-table :data="HELP_ROWS" size="small" border>
        <el-table-column prop="key" label="快捷键" width="180" />
        <el-table-column prop="desc" label="作用" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Aim,
  ArrowDown,
  ArrowUp,
  Close,
  Filter,
  Grid,
  Plus,
  QuestionFilled,
  RefreshLeft,
  RefreshRight,
  Search,
  Select as SelectIcon,
} from '@element-plus/icons-vue';
import { register, themes, type ColumnsDefine, type ListTable, type ListTableConstructorOptions } from '@visactor/vtable';
import { DateInputEditor, InputEditor, ListEditor } from '@visactor/vtable-editors';
// vtable-sheet 内部强制装载 context-menu-plugin 会再画一份右键菜单，与本页自绘的 vtable-sheet-bi__menu 冲突（双弹）。
// 提升为直接依赖，仅禁用这一个插件；其余插件（筛选/序号/自动填充/编辑键盘）保持默认。
import { ContextMenuPlugin } from '@visactor/vtable-plugins';
import { VTableSheet, type ISheetDefine } from '@visactor/vtable-sheet';
import { useThemeStore } from '@/store/modules/useThemeStore';
import {
  emptyValueFor,
  isBlank,
  isMetaField,
  numOf,
  renderDate,
  round2,
  tagColor,
  type BiCol,
  type BiRow,
} from './bi-entry/schema';
import BiColumnDrawer from '@/components/bi-column-drawer/bi-column-drawer.vue';
import type { ColumnDraft } from '@/components/bi-column-drawer/types';
import RegionPickerDialog from '@/pages/data-platform/univer-entry/components/RegionPickerDialog.vue';
import { isRegionValue, type RegionValue } from '@/pages/data-platform/univer-entry/region-data';
import { ROWNO_WIDTH, SELECT_WIDTH, allocWidths, groupColumns, useBiColumns } from './bi-entry/useBiColumns';
import { useBiValidation } from './bi-entry/useBiValidation';
import { useBiQuery } from './bi-entry/useBiQuery';
import { useBiHistory } from './bi-entry/useBiHistory';
import { useBiActions } from './bi-entry/useBiActions';

defineOptions({ name: 'VtBiEntry' });

interface CellStyleArg {
  col: number;
  row: number;
  value?: unknown;
}

interface CellChangeArg {
  col: number;
  row: number;
  rawValue?: string | number;
}

interface CheckboxArg {
  col: number;
  row: number;
  checked: boolean;
}

interface CellRange {
  start: { col: number; row: number };
  end: { col: number; row: number };
}

// ============================ 基础状态（必须早于组合式函数：回调里要用） ============================
const themeStore = useThemeStore();
const tableRef = ref<HTMLElement>();
/** VTable-Sheet 实例：工作表容器，数据 / 列 / 主题 / 生命周期归它管 */
let sheet: VTableSheet | null = null;
/** 底层 ListTable：WorkSheet 官方暴露的逃生口，选区 / 滚动 / 编辑 / 合并等细粒度操作走它 */
let table: ListTable | null = null;

/** 统计口径的刷新触发器：record 内部字段变化不改数组引用，需要 tick 让 computed 重算 */
const statsTick = ref(0);
const tickDep = () => statsTick.value;

const submitting = ref(false);
const helpVisible = ref(false);
const queryDrawer = ref(false);
const colConfigVisible = ref(false);
/** 新增列模式：共享抽屉以 add 形态打开（与 Univer 的 openAddColumn 同语义） */
const addColMode = ref(false);
const findVisible = ref(false);

const activeCell = ref<{ col: number; row: number } | null>(null);
const selectionRect = ref<{ c0: number; r0: number; c1: number; r1: number } | null>(null);
const flashPos = ref<{ col: number; row: number } | null>(null);

const queryField = ref('');
const filterDraft = reactive<{ values: string[]; min: number | null; max: number | null }>({
  values: [],
  min: null,
  max: null,
});

const menu = reactive({ show: false, x: 0, y: 0 });

// ============================ 院区选择器（对齐 Univer：双击 region 列弹框） ============================
const regionPickerVisible = ref(false);
const regionPickerCurrent = ref<RegionValue | null>(null);
/** 双击的那一格（坐标态：确认回填时要用） */
let regionCell: { col: number; row: number } | null = null;

const HELP_ROWS = [
  { key: '双击 / F2 / 直接键入', desc: '编辑单元格（直接键入会覆盖原值；院区列双击弹出选择器）' },
  { key: 'Enter / Tab', desc: '提交并向下 / 向右移动' },
  { key: '方向键 / Ctrl+方向键', desc: '移动活动单元格 / 跳到数据边界' },
  { key: 'PageUp / PageDown', desc: '翻一屏' },
  { key: 'Ctrl+C / Ctrl+V', desc: '复制选区 / 粘贴多格 TSV' },
  { key: 'Ctrl+X', desc: '剪切选区（复制并清空）' },
  { key: 'Ctrl+D / Ctrl+R', desc: '首行向下填充 / 首列向右填充（数字等差、日期按天）' },
  { key: 'Ctrl+Z / Ctrl+Y', desc: '撤销 / 重做' },
  { key: 'Ctrl+F', desc: '查找替换' },
  { key: 'Ctrl+A', desc: '全选' },
  { key: 'Delete / Backspace', desc: '清空选区内单元格' },
  { key: '拖右下角方块 / 双击', desc: '拖拽填充 / 填到数据末行' },
  { key: '右键', desc: '复制 / 粘贴 / 清空内容' },
  { key: '点列头', desc: '打开该列的配置抽屉' },
  { key: 'F1', desc: '打开本帮助' },
];

// ============================ 迟绑定钩子（打破「组合式函数 ↔ 表格刷新」的循环依赖） ============================
/** 结构变更后的收尾（重排统计、刷新表格），定义在后面再赋值 */
let onStructure: () => void = () => undefined;
let onCells: () => void = () => undefined;
let onRestored: () => void = () => undefined;
/** 点表头 → 打开该列配置：内部要调 openColConfig（定义在后面），同样后置赋值 */
let onHeaderCell: (col: number, row: number) => void = () => undefined;

// ============================ 数据与模块装配 ============================
const { cols, visibleCols, labelOf, colOf, addCol, removeCol, updateCol } = useBiColumns();

/** records：唯一真源。shallowRef —— 只有整体替换才触发视图同步，避免十万行深响应式追踪 */
const records = shallowRef<BiRow[]>([]);
const validation = useBiValidation(cols);
const { errors: errorItems, errorCount, errMap } = validation;
const query = useBiQuery(cols, records);
const { displayRows } = query;

const historyApi = useBiHistory({
  getRows: () => records.value,
  setRows: (next) => {
    records.value = next;
  },
  getCols: () => cols.value,
  setCols: (next) => {
    cols.value = next;
  },
  afterRestore: () => onRestored(),
});

const { canUndo, canRedo, undoLabel, redoLabel } = historyApi;

const actions = useBiActions({
  rows: records,
  cols,
  activeCols: visibleCols,
  validation,
  history: historyApi,
  afterStructure: () => onStructure(),
  afterCells: () => onCells(),
});

// ============================ 列索引 ↔ 字段 ============================
/** 叶子列顺序（含前置「#」「选择」）：VTable 的 col 下标就是它的下标 */
const colFields = ref<string[]>(['rowNo', 'selected']);
const fieldAt = (col: number): string => colFields.value[col] ?? '';
const recordAt = (rowIndex: number): BiRow | undefined => displayRows.value[rowIndex];

// ============================ 编辑器注册 ============================
const registeredEditors = new Set<string>();
const ensureEditors = () => {
  if (!registeredEditors.has('bi-input')) {
    register.editor('bi-input', new InputEditor());
    registeredEditors.add('bi-input');
  }
  if (!registeredEditors.has('bi-date')) {
    register.editor('bi-date', new DateInputEditor());
    registeredEditors.add('bi-date');
  }
  // 下拉列各注册一个 ListEditor：选项随列配置变化，每次重建重注册覆盖
  visibleCols.value
    .filter((c) => c.type === 'select')
    .forEach((c) => {
      register.editor(`bi-sel-${c.field}`, new ListEditor({ values: c.options ?? [] }));
      registeredEditors.add(`bi-sel-${c.field}`);
    });
};

/** region 列不配编辑器：双击由 dblclick_cell 拦截弹院区选择器（getEditor 为空 → VTable 不会进文本编辑） */
const editorOf = (col: BiCol): string | undefined => {
  if (col.type === 'select') {
    return `bi-sel-${col.field}`;
  }
  if (col.type === 'date') {
    return 'bi-date';
  }
  if (col.type === 'number' || col.type === 'text') {
    return 'bi-input';
  }
  return undefined;
};

// ============================ 单元格样式 / 列构建 ============================
/** 单元格状态色：Canvas 每格都要用，不能逐格 getComputedStyle，建表时取一次缓存下来 */
const cellPalette = { errBg: '', errFg: '', flashBg: '' };

const cellStyle = (args: CellStyleArg) => {
  const field = fieldAt(args.col);
  const row = recordAt(args.row);
  const base: Record<string, unknown> = { fontFamily: 'inherit' };
  if (!row || isMetaField(field)) {
    return base;
  }
  const key = `${row.rowId}\u0001${field}`;
  if (errMap.has(key)) {
    return { ...base, bgColor: cellPalette.errBg, color: cellPalette.errFg };
  }
  if (flashPos.value && flashPos.value.col === args.col && flashPos.value.row === args.row) {
    return { ...base, bgColor: cellPalette.flashBg };
  }
  const col = colOf(field);
  if (col?.type === 'select' && col.options?.length) {
    const idx = col.options.indexOf(String(args.value ?? ''));
    if (idx >= 0) {
      const c = tagColor(idx, themeStore.isDark);
      return { ...base, bgColor: c.bg, color: c.fg };
    }
  }
  return base;
};

const buildColumns = (containerWidth: number): ColumnsDefine => {
  const widths = allocWidths(visibleCols.value, containerWidth || tableRef.value?.clientWidth || 1200);
  const widthOf = new Map<string, number>();
  visibleCols.value.forEach((c, i) => {
    widthOf.set(c.field, widths[i] ?? c.width);
  });

  const leaf = (c: BiCol): Record<string, unknown> => {
    const common: Record<string, unknown> = {
      field: c.field,
      title: c.label,
      width: widthOf.get(c.field),
      style: cellStyle,
    };
    if (c.type === 'region') {
      // 院区值是结构化对象 { name, id, code }：只展示 name
      return {
        ...common,
        fieldFormat: (rec: BiRow) => {
          const v = rec[c.field];
          return isRegionValue(v) ? String(v.name ?? '') : String(v ?? '');
        },
      };
    }
    if (c.type === 'date') {
      return { ...common, fieldFormat: (record: BiRow) => renderDate(record[c.field], c.dateFormat), editor: editorOf(c) };
    }
    return { ...common, editor: editorOf(c) };
  };

  // 表头分组：连续同名 group 聚成父表头；单列组退化为普通列
  const nodes = groupColumns(visibleCols.value)
    .map((g) => {
      if (!g.title) {
        const c = colOf(g.fields[0]);
        return c ? leaf(c) : null;
      }
      const children = g.fields
        .map((f) => colOf(f))
        .filter((c): c is BiCol => Boolean(c))
        .map((c) => leaf(c));
      return { title: g.title, columns: children };
    })
    .filter((x): x is Record<string, unknown> => Boolean(x));

  // 叶子顺序必须与 colFields 一致（col 下标 → 字段）
  colFields.value = ['rowNo', 'selected', ...visibleCols.value.map((c) => c.field)];

  const front: Array<Record<string, unknown>> = [
    { field: 'rowNo', title: '#', width: ROWNO_WIDTH, style: cellStyle },
    { field: 'selected', title: '', width: SELECT_WIDTH, cellType: 'checkbox', style: cellStyle },
  ];
  return [...front, ...nodes] as unknown as ColumnsDefine;
};

/** 冻结列数 = 前置两列 + 连续冻结的业务列 */
const frozenCount = () => {
  let n = 2;
  visibleCols.value.forEach((c) => {
    if (c.frozen && n === visibleCols.value.indexOf(c) + 2) {
      n += 1;
    }
  });
  return n;
};

// ============================ 数据同步 ============================
const syncData = (keepSelection = false) => {
  if (!table) {
    return;
  }
  const sel = keepSelection ? selectionRect.value : null;
  // 直接写底层 records：sheet 的 updateSheetOption({ data }) 会重建表格，丢掉选区与滚动位置
  table.setRecords(displayRows.value);
  if (!sel) {
    return;
  }
  try {
    // ⚠️ selectCells 只接受 CellRange[]（不是四个数字），签名传错不报错但选区不生效
    table.selectCells([
      {
        start: { col: Math.min(sel.c0, sel.c1), row: Math.min(sel.r0, sel.r1) },
        end: { col: Math.max(sel.c0, sel.c1), row: Math.max(sel.r0, sel.r1) },
      },
    ]);
  } catch {
    // 结构已变化时选区可能越界，忽略
  }
};

// ============================ 填充（手柄 / Ctrl+D / Ctrl+R） ============================
let fillAnchor: { c0: number; r0: number; c1: number; r1: number } | null = null;

const coerce = (col: BiCol, raw: unknown, before: unknown): { value: unknown; reject: boolean } => {
  // 院区列不接受键盘输入 / 粘贴：只能双击弹选择器（对齐 Univer）
  if (col.type === 'region') {
    return { value: before, reject: true };
  }
  if (col.type === 'number') {
    if (isBlank(raw)) {
      return { value: null, reject: false };
    }
    const n = numOf(raw);
    return n === null ? { value: before, reject: true } : { value: n, reject: false };
  }
  if (col.type === 'date') {
    if (isBlank(raw)) {
      return { value: '', reject: false };
    }
    return { value: raw instanceof Date ? renderDate(raw) : String(raw), reject: false };
  }
  return { value: raw === null || raw === undefined ? '' : String(raw), reject: false };
};

const doFill = (dir: 'down' | 'up' | 'right' | 'left') => {
  const src = fillAnchor ?? selectionRect.value;
  const cur = selectionRect.value;
  if (!src || !cur) {
    ElMessage.info('先选中要填充的单元格区域');
    return;
  }
  if (dir === 'down' || dir === 'up') {
    const srcRows: string[] = [];
    for (let r = src.r0; r <= src.r1; r += 1) {
      const rec = recordAt(r);
      if (rec) {
        srcRows.push(rec.rowId);
      }
    }
    const targetRows: string[] = [];
    if (dir === 'down') {
      for (let r = src.r1 + 1; r <= cur.r1; r += 1) {
        const rec = recordAt(r);
        if (rec) {
          targetRows.push(rec.rowId);
        }
      }
    } else {
      for (let r = src.r0 - 1; r >= cur.r0; r -= 1) {
        const rec = recordAt(r);
        if (rec) {
          targetRows.push(rec.rowId);
        }
      }
    }
    const fields: string[] = [];
    for (let c = Math.min(src.c0, cur.c0); c <= Math.max(src.c1, cur.c1); c += 1) {
      const f = fieldAt(c);
      if (f && !isMetaField(f)) {
        fields.push(f);
      }
    }
    const n = actions.fillLinear({
      sourceRowIds: srcRows,
      targetRowIds: targetRows,
      fields,
      direction: dir,
      label: dir === 'down' ? '向下填充' : '向上填充',
    });
    ElMessage.success(n ? `已填充 ${n} 个单元格` : '没有需要填充的单元格');
    return;
  }

  // 横向填充：按行把源区各列的值循环铺到目标列；跨列类型不同，统一按目标列类型 coerce
  const patches: Array<{ rowId: string; field: string; before: unknown; after: unknown }> = [];
  for (let r = Math.min(src.r0, src.r1); r <= Math.max(src.r0, src.r1); r += 1) {
    const row = recordAt(r);
    if (row) {
      const srcFields: string[] = [];
      for (let c = src.c0; c <= src.c1; c += 1) {
        const f = fieldAt(c);
        if (f && !isMetaField(f)) {
          srcFields.push(f);
        }
      }
      const targetCols: number[] = [];
      if (dir === 'right') {
        for (let c = src.c1 + 1; c <= cur.c1; c += 1) {
          targetCols.push(c);
        }
      } else {
        for (let c = src.c0 - 1; c >= cur.c0; c -= 1) {
          targetCols.push(c);
        }
      }
      if (srcFields.length) {
        targetCols.forEach((c, i) => {
          const field = fieldAt(c);
          const col = colOf(field);
          if (!col || isMetaField(field)) {
            return;
          }
          const raw = row[srcFields[i % srcFields.length]];
          const { value, reject } = coerce(col, raw, row[field]);
          if (reject || row[field] === value) {
            return;
          }
          patches.push({ rowId: row.rowId, field, before: row[field], after: value });
          row[field] = value;
          row.changed = true;
        });
      }
    }
  }
  if (!patches.length) {
    ElMessage.info('没有需要填充的单元格');
    return;
  }
  historyApi.pushCells(dir === 'right' ? '向右填充' : '向左填充', patches);
  records.value = records.value.slice();
  validation.scanAll(records.value);
  tickDep();
  syncData(true);
  ElMessage.success(`已填充 ${patches.length} 个单元格`);
};

const onFillStart = () => {
  fillAnchor = selectionRect.value ? { ...selectionRect.value } : null;
};

const onFillEnd = (args?: { direction?: 'top' | 'bottom' | 'left' | 'right' }) => {
  let dir: 'down' | 'up' | 'right' | 'left' = 'down';
  if (args?.direction === 'top') {
    dir = 'up';
  } else if (args?.direction === 'left') {
    dir = 'left';
  } else if (args?.direction === 'right') {
    dir = 'right';
  }
  doFill(dir);
  fillAnchor = null;
};

const onFillToEnd = () => {
  const src = fillAnchor ?? selectionRect.value;
  if (!src) {
    return;
  }
  const last = displayRows.value.length - 1;
  if (last <= src.r1) {
    return;
  }
  selectionRect.value = { ...src, r1: last };
  doFill('down');
  fillAnchor = null;
};

// ============================ 单元格 / 选区事件 ============================
const onCellChange = (args: CellChangeArg) => {
  const field = fieldAt(args.col);
  const row = recordAt(args.row);
  const col = colOf(field);
  if (!row || !col || isMetaField(field)) {
    return;
  }
  // ⚠️ change_cell_value 在 VTable 已把新值写进 record 之后才触发：
  //    这里读 row[field] 已是新值，旧值只能取事件自带的 rawValue。
  const before = args.rawValue;
  const { value, reject } = coerce(col, row[field], before);
  if (reject) {
    row[field] = before === undefined ? null : before;
    table?.updateCellContent(args.col, args.row);
    ElMessage.warning(`「${col.label}」不接受该输入`);
    return;
  }
  row[field] = value;
  row.changed = true;
  table?.updateCellContent(args.col, args.row);

  historyApi.pushCells(`编辑「${col.label}」`, [{ rowId: row.rowId, field, before, after: value }]);
  validation.noteUniqueEdit(records.value, field, before, value);
  validation.setCellError(row, field);
  if (col.rules?.unique) {
    validation.revalidateColumn(records.value, field);
  }
  validation.dependentFields(field).forEach((f) => validation.setCellError(row, f));
  tickDep();
  table?.renderWithRecreateCells();
};

const onCheckboxChange = (args: CheckboxArg) => {
  const field = fieldAt(args.col);
  const row = recordAt(args.row);
  if (!row || isMetaField(field)) {
    return;
  }
  if (field === 'selected') {
    row.selected = args.checked;
  } else {
    row[field] = args.checked;
    row.changed = true;
  }
  tickDep();
  table?.renderWithRecreateCells();
};

const onClickCell = (args: { col: number; row: number; cellLocation?: string }) => {
  activeCell.value = { col: args.col, row: args.row };
  menu.show = false;
  // 点表头 = 配这一列（三套录入台统一入口，对齐 Univer 的点列标）。
  // ⚠️ CellLocation 的取值是 'columnHeader'（不是 'colHeader'），写错会静默失效。
  if (args.cellLocation === 'columnHeader') {
    onHeaderCell(args.col, args.row);
    return;
  }
  // B1 点行号列 → 选中整行（含所有列），结果同步回 selectionRect
  if (fieldAt(args.col) === 'rowNo') {
    const lastCol = colFields.value.length - 1;
    const row = args.row;
    try {
      // ⚠️ selectCells 只接受 CellRange[]，四个数字会静默失效
      table?.selectCells([{ start: { col: 0, row }, end: { col: lastCol, row } }]);
    } catch {
      // 选区越界时忽略
    }
    selectionRect.value = { c0: 0, r0: row, c1: lastCol, r1: row };
    tickDep();
  }
};

/** 双击院区列 → 弹选择器（region 列无编辑器，不会进文本编辑；其他列走 VTable 原生编辑） */
const onDblClickCell = (args: { col: number; row: number }) => {
  const field = fieldAt(args.col);
  const col = colOf(field);
  if (!col || col.type !== 'region') {
    return;
  }
  const row = recordAt(args.row);
  if (!row) {
    return;
  }
  regionCell = { col: args.col, row: args.row };
  const v = row[field];
  regionPickerCurrent.value = isRegionValue(v) ? v : null;
  regionPickerVisible.value = true;
};

/** 选择器确认：把 RegionValue 写回双击的那一格（入撤销栈 + 重校 + 重绘） */
const onRegionPicked = (value: RegionValue | null) => {
  const cell = regionCell;
  regionCell = null;
  if (!cell || !table) {
    return;
  }
  const field = fieldAt(cell.col);
  const col = colOf(field);
  const row = recordAt(cell.row);
  if (!row || !col) {
    return;
  }
  const before = row[field];
  const after = value ? { ...value } : '';
  if (before === after) {
    return;
  }
  historyApi.pushCells(`选择「${col.label}」`, [{ rowId: row.rowId, field, before, after }]);
  row[field] = after;
  row.changed = true;
  validation.setCellError(row, field);
  tickDep();
  table.updateCellContent(cell.col, cell.row);
  table.renderWithRecreateCells();
};

const onSelectedChanged = (args?: { ranges?: CellRange[] }) => {
  const ranges = args?.ranges ?? [];
  if (!ranges.length) {
    selectionRect.value = null;
    return;
  }
  const c0 = Math.min(...ranges.map((r) => Math.min(r.start.col, r.end.col)));
  const c1 = Math.max(...ranges.map((r) => Math.max(r.start.col, r.end.col)));
  const r0 = Math.min(...ranges.map((r) => Math.min(r.start.row, r.end.row)));
  const r1 = Math.max(...ranges.map((r) => Math.max(r.start.row, r.end.row)));
  selectionRect.value = { c0, r0, c1, r1 };
  tickDep();
};

const onContextMenu = (args: { col: number; row: number; event?: Event }) => {
  const ev = args.event as MouseEvent | undefined;
  activeCell.value = { col: args.col, row: args.row };
  menu.x = ev?.clientX ?? 200;
  menu.y = ev?.clientY ?? 200;
  menu.show = true;
};

// ============================ 表格生命周期 ============================
/**
 * VTable 主题：色值从全局 --bi-* 读（assets/style/bi-entry.less 是唯一来源）。
 * Canvas 取不到 CSS 变量，只能取值后喂给 TableTheme，但"改一处三处生效"依然成立。
 */
const cssVar = (name: string, fallback: string): string => {
  const el = tableRef.value ?? document.documentElement;
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
};

const buildTableTheme = () => {
  const dark = themeStore.isDark;
  const panel = cssVar('--bi-panel', dark ? '#16191f' : '#fff');
  const headBg = cssVar('--bi-head-bg', dark ? '#1a1e25' : '#f7f8fa');
  const text = cssVar('--bi-text', dark ? '#e6e8ec' : '#1d2129');
  const border = cssVar('--bi-border', dark ? '#272c35' : '#e5e7ec');
  const borderSoft = cssVar('--bi-border-soft', dark ? '#20242c' : '#eef0f4');
  const base = dark ? themes.DARK : themes.BRIGHT;
  // 与 vxe 版的 .cell-error / .cell-flash 同一套观感：淡色底 + 语义色字
  cellPalette.errBg = dark ? 'rgba(247, 101, 96, 0.18)' : 'rgba(245, 63, 63, 0.1)';
  cellPalette.errFg = cssVar('--bi-danger', '#f53f3f');
  cellPalette.flashBg = cssVar('--bi-primary-soft', dark ? '#1c2440' : '#eef2ff');
  // 悬停行 / 列头：取 --bi-hover（暗黑为中性灰抬升一阶，不偏蓝），三套同色
  const hoverBg = cssVar('--bi-hover', dark ? '#2e3137' : '#f7f9fc');
  // 选区行列引导底：统一 0.06（暗黑不再用 0.1，避免行列交叉处叠成偏重蓝块）
  const selTint = dark ? 'rgba(111, 141, 255, 0.06)' : 'rgba(43, 92, 246, 0.06)';
  const primary = cssVar('--bi-primary', dark ? '#6f8dff' : '#2b5cf6');
  return new themes.TableTheme(
    {
      underlayBackgroundColor: panel,
      // 字号与 vxe 版对齐（正文 13 / 表头 12.5），网格线用最淡一阶，
      // 表头字色用正文色而非次级色——表头是列标签，比正文更需要清晰
      defaultStyle: {
        color: text,
        bgColor: panel,
        borderColor: borderSoft,
        fontSize: 13,
        // 选中态底色不在此设置——统一交给 selectionStyle，避免与它的行列双向底叠成偏重蓝块
      },
      headerStyle: {
        color: text,
        bgColor: headBg,
        borderColor: border,
        fontSize: 12.5,
        fontWeight: 600,
        hover: { cellBgColor: hoverBg },
        select: { inlineColumnBgColor: selTint },
      },
      // 分组表头（多级表头的父行）必须单独配：不配就走 base 主题的深色组头，
      // 与自定义的浅色底拼在一起会「上深下浅」断层
      groupTitleStyle: {
        color: text,
        bgColor: headBg,
        borderColor: border,
        fontSize: 12.5,
        fontWeight: 600,
        hover: { cellBgColor: hoverBg },
      },
      // 行悬停必须写在 bodyStyle 上，且 cellBgColor 与 inlineRowBgColor 同值：
      // 内置 DARK 主题在 bodyStyle.hover.cellBgColor 里写死了 #29364D，
      // 只给行级的 inlineRowBgColor 会被逐格上色盖住（表现为改不动、整行发蓝）。
      bodyStyle: {
        color: text,
        bgColor: panel,
        borderColor: borderSoft,
        fontSize: 13,
        hover: { cellBgColor: hoverBg, inlineRowBgColor: hoverBg },
      },
      // 去掉内置主题的圆角与投影：外框由 .bi-panel 统一提供，避免「卡片套卡片」
      frameStyle: { borderColor: border, borderLineWidth: 0, cornerRadius: 0, shadowBlur: 0 },
      // 选区描边用品牌色（不用内置的灰蓝），与另外两套的选中观感对齐
      selectionStyle: {
        cellBorderColor: primary,
        cellBorderLineWidth: 2,
        inlineRowBgColor: selTint,
        inlineColumnBgColor: selTint,
        selectionFillMode: 'overlay',
      },
      // 滚动条：滑块用半透明品牌色，轨道透明（Hover 才浮现，由 visible 控制）
      scrollStyle: {
        scrollSliderColor: dark ? 'rgba(143, 149, 163, 0.45)' : 'rgba(29, 33, 41, 0.28)',
        scrollRailColor: 'transparent',
        visible: 'scrolling',
      },
      // 表头排序图标改用品牌色（默认是 Univer 蓝，与我们的主色不一致）
      functionalIconsStyle: {
        sort_color: primary,
        sort_color_opacity: '0.55',
      },
    },
    base,
  );
};

/** 建表时容器宽度（0 表示容器还没尺寸，等 resize 里再补一次分配） */
let builtWidth = 0;

/**
 * sheet 的工作表定义。
 * ISheetDefine 只声明了「工作表语义」字段（data / columns / frozenColCount…），
 * 但 WorkSheet 内部是 `Object.assign({}, sheetOptions, {...覆盖项})` 整包转给 ListTable，
 * 所以 VTable 的构造选项可以透传进来（键盘流 / 双击编辑 / 右键拦截 / 列宽拖拽）。
 * 唯一例外：excelOptions 会被 sheet 整体替换为 `{ fillHandle: true }`。
 */
type BiSheetDefine = ISheetDefine &
  Omit<ListTableConstructorOptions, keyof ISheetDefine | 'records' | 'container'>;

const BI_SHEET_KEY = 'bi';

const rebuild = () => {
  ensureEditors();
  // sheet.release() 会连带释放底层 ListTable，不要再单独 table.release()
  sheet?.release();
  sheet = null;
  table = null;
  const container = tableRef.value as HTMLElement | undefined;
  if (!container) {
    return;
  }
  builtWidth = container.clientWidth || 0;

  const define: BiSheetDefine = {
    sheetKey: BI_SHEET_KEY,
    sheetTitle: '录入',
    // 列定义沿用 VTable 的 ColumnsDefine：IColumnDefine 继承 ColumnDefine，
    // field / style / cellType / 嵌套 columns 全都透传，多级表头与逐格标红不用改写法
    columns: buildColumns(builtWidth) as ISheetDefine['columns'],
    data: displayRows.value,
    frozenColCount: frozenCount(),
    columnResizeMode: 'all',
    editCellTrigger: 'doubleclick',
    keyboardOptions: {
      moveFocusCellOnTab: true,
      editCellOnEnter: true,
      moveFocusCellOnEnter: true,
      moveEditCellOnArrowKeys: true,
      selectAllOnCtrlA: true,
      shiftMultiSelect: true,
      ctrlMultiSelect: true,
    },
    eventOptions: { preventDefaultContextMenu: true },
  };

  // sheet 自带菜单栏 / 公式栏 / 页签栏 / 撤销按钮全部关掉：本页工具栏、撤销栈（useBiHistory）、
  // 右键菜单都是自绘的，开着就是两套并存。默认行高 32 对齐 vxe 录入台的密排观感。
  sheet = new VTableSheet(container, {
    showFormulaBar: false,
    showSheetTab: false,
    mainMenu: { show: false },
    undoRedo: { show: false },
    // 禁用 vtable-sheet 自带的 context-menu-plugin：它与本页自绘的 vtable-sheet-bi__menu 都会监听右键，会双弹。
    // 本页右键由 table.on('contextmenu_cell') 触发，原生菜单已被 eventOptions.preventDefaultContextMenu 屏蔽。
    VTablePluginModules: [{ module: ContextMenuPlugin, disabled: true }],
    defaultRowHeight: 32,
    theme: { tableTheme: buildTableTheme() },
    sheets: [define as ISheetDefine],
  });

  // 单元格级交互（选区 / 滚动 / 编辑 / 重绘）继续走底层 ListTable —— 官方在工作表上公开了该实例
  table = sheet.getActiveSheet()?.tableInstance ?? null;
  if (!table) {
    return;
  }
  table.on('change_cell_value', onCellChange);
  table.on('checkbox_state_change', onCheckboxChange);
  table.on('click_cell', onClickCell);
  table.on('dblclick_cell', onDblClickCell);
  table.on('selected_changed', onSelectedChanged);
  table.on('contextmenu_cell', onContextMenu);
  table.on('mousedown_fill_handle', onFillStart);
  table.on('drag_fill_handle_end', onFillEnd);
  table.on('dblclick_fill_handle', onFillToEnd);
};

// 迟绑定钩子赋值：此刻所有函数已定义
onStructure = () => {
  tickDep();
  validation.scanAll(records.value);
  syncData();
};
onCells = () => {
  tickDep();
  syncData(true);
};
onRestored = () => {
  tickDep();
  validation.scanAll(records.value);
  rebuild();
};

// ============================ 剪贴板 ============================
const selectionCells = (): Array<{ field: string; row: BiRow }> => {
  const s = selectionRect.value;
  if (!s) {
    return [];
  }
  const out: Array<{ field: string; row: BiRow }> = [];
  for (let r = Math.min(s.r0, s.r1); r <= Math.max(s.r0, s.r1); r += 1) {
    const row = recordAt(r);
    if (row) {
      for (let c = Math.min(s.c0, s.c1); c <= Math.max(s.c0, s.c1); c += 1) {
        const f = fieldAt(c);
        if (f && !isMetaField(f)) {
          out.push({ field: f, row });
        }
      }
    }
  }
  return out;
};

const copySelection = async () => {
  const s = selectionRect.value;
  if (!s) {
    ElMessage.info('先框选要复制的单元格');
    return;
  }
  const lines: string[] = [];
  for (let r = s.r0; r <= s.r1; r += 1) {
    const row = recordAt(r);
    if (row) {
      const cells: string[] = [];
      for (let c = s.c0; c <= s.c1; c += 1) {
        const f = fieldAt(c);
        const col = colOf(f);
        // 院区列复制展示名（与单元格显示一致）
        const v = row[f];
        const text = col?.type === 'region' && isRegionValue(v) ? String(v.name ?? '') : String(v ?? '');
        cells.push(f && !isMetaField(f) ? text : '');
      }
      lines.push(cells.join('\t'));
    }
  }
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    ElMessage.success(`已复制 ${lines.length} 行`);
  } catch {
    ElMessage.warning('浏览器拒绝了剪贴板写入');
  }
};

const applyPasteText = (text: string) => {
  const anchor = activeCell.value;
  if (!anchor) {
    ElMessage.info('先点一个起始单元格');
    return 0;
  }
  const patches: Array<{ rowId: string; field: string; before: unknown; after: unknown }> = [];
  text
    .replace(/\r/g, '')
    .split('\n')
    .forEach((line, ri) => {
      const row = recordAt(anchor.row + ri);
      if (!row || !line) {
        return;
      }
      line.split('\t').forEach((cellText, ci) => {
        const field = fieldAt(anchor.col + ci);
        const col = colOf(field);
        if (!col || isMetaField(field)) {
          return;
        }
        const { value, reject } = coerce(col, cellText, row[field]);
        const before = row[field];
        if (reject || before === value) {
          return;
        }
        patches.push({ rowId: row.rowId, field, before, after: value });
        row[field] = value;
        row.changed = true;
      });
    });
  if (!patches.length) {
    return 0;
  }
  historyApi.pushCells('粘贴', patches);
  records.value = records.value.slice();
  validation.scanAll(records.value);
  tickDep();
  syncData(true);
  return patches.length;
};

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText();
    const n = applyPasteText(text);
    ElMessage.success(n ? `已粘贴 ${n} 个单元格` : '剪贴板内容无法写入当前区域');
  } catch {
    ElMessage.warning('浏览器拒绝了剪贴板读取');
  }
};

const clearSelectionCells = () => {
  const patches = selectionCells()
    .map(({ field, row }) => {
      const col = colOf(field);
      const before = row[field];
      const after = col ? emptyValueFor(col) : '';
      if (before === after) {
        return null;
      }
      row[field] = after;
      row.changed = true;
      return { rowId: row.rowId, field, before, after };
    })
    .filter((x): x is { rowId: string; field: string; before: unknown; after: unknown } => Boolean(x));
  if (!patches.length) {
    return;
  }
  historyApi.pushCells('清空选区', patches);
  records.value = records.value.slice();
  validation.scanAll(records.value);
  tickDep();
  syncData(true);
};

/** 剪切：复用 copySelection 把选区 TSV 写入剪贴板，再清空选区内容并入历史 */
const cutSelection = () => {
  const s = selectionRect.value;
  if (!s) {
    ElMessage.info('先框选要剪切的单元格');
    return;
  }
  copySelection()
    .then(() => {
      const patches = selectionCells()
        .map(({ field, row }) => {
          const col = colOf(field);
          const before = row[field];
          const after = col ? emptyValueFor(col) : '';
          if (before === after) {
            return null;
          }
          row[field] = after;
          row.changed = true;
          return { rowId: row.rowId, field, before, after };
        })
        .filter((x): x is { rowId: string; field: string; before: unknown; after: unknown } => Boolean(x));
      if (patches.length) {
        historyApi.pushCells('剪切', patches);
      }
      records.value = records.value.slice();
      validation.scanAll(records.value);
      tickDep();
      syncData(true);
      ElMessage.success(`已剪切 ${patches.length} 个单元格`);
    })
    .catch(() => undefined);
};

// ============================ 撤销 / 重做 ============================
const onUndo = () => {
  const label = historyApi.undo();
  if (label) {
    ElMessage.info(`撤销：${label}`);
  }
};

const onRedo = () => {
  const label = historyApi.redo();
  if (label) {
    ElMessage.info(`重做：${label}`);
  }
};

// ============================ 右键菜单动作 ============================
const menuAct = (act: string) => {
  menu.show = false;
  if (act === 'copy') {
    copySelection().catch(() => undefined);
    return;
  }
  if (act === 'paste') {
    pasteFromClipboard().catch(() => undefined);
    return;
  }
  if (act === 'clear') {
    clearSelectionCells();
  }
};

// ============================ 键盘流 ============================
const isTypingTarget = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null;
  if (!el) {
    return false;
  }
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'F1') {
    e.preventDefault();
    helpVisible.value = true;
    return;
  }
  if (isTypingTarget(e.target)) {
    return;
  }
  const mod = e.ctrlKey || e.metaKey;
  const key = e.key.toLowerCase();
  const cell = activeCell.value;
  // sheet 在底层强制开启 copySelected / pasteValueToCell / cutSelected（源码里写死，透传配置改不掉），
  // 会和自研的剪贴板 / 撤销 / 填充抢同一组快捷键。这里在 capture 阶段截断事件传播，
  // 由下面的自研实现独占处理，否则一次 Ctrl+V 会写两遍。
  if (mod && ['c', 'v', 'x', 'z', 'y', 'd', 'r', 'f', 'h'].includes(key)) {
    e.stopPropagation();
  }
  if (mod && key === 'f') {
    e.preventDefault();
    findVisible.value = true;
    return;
  }
  // 替换：Ctrl+H 打开查找替换条（含「替换为」输入框）
  if (mod && key === 'h') {
    e.preventDefault();
    findVisible.value = true;
    return;
  }
  if (mod && key === 'z') {
    e.preventDefault();
    onUndo();
    return;
  }
  if (mod && key === 'y') {
    e.preventDefault();
    onRedo();
    return;
  }
  if (mod && key === 'd') {
    e.preventDefault();
    doFill('down');
    return;
  }
  if (mod && key === 'r') {
    e.preventDefault();
    doFill('right');
    return;
  }
  if (mod && key === 'c') {
    e.preventDefault();
    copySelection().catch(() => undefined);
    return;
  }
  if (mod && key === 'v') {
    e.preventDefault();
    pasteFromClipboard().catch(() => undefined);
    return;
  }
  // 剪切：Ctrl+X 先复制选区到剪贴板，再清空选区内容并记入历史
  if (mod && key === 'x') {
    e.preventDefault();
    cutSelection();
    return;
  }
  if (e.key === 'Escape') {
    menu.show = false;
    return;
  }
  if (!cell) {
    return;
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    clearSelectionCells();
    return;
  }
  if (e.key === 'F2') {
    e.preventDefault();
    table?.startEditCell(cell.col, cell.row);
    return;
  }
  if (e.key === 'PageDown' || e.key === 'PageUp') {
    e.preventDefault();
    const step = 20 * (e.key === 'PageDown' ? 1 : -1);
    const nextRow = Math.min(Math.max(cell.row + step, 0), Math.max(displayRows.value.length - 1, 0));
    table?.selectCell(cell.col, nextRow);
    activeCell.value = { col: cell.col, row: nextRow };
    table?.scrollToCell({ col: cell.col, row: nextRow });
    return;
  }
  if (e.key.length === 1 && !mod && !e.altKey) {
    e.preventDefault();
    table?.startEditCell(cell.col, cell.row, e.key);
  }
};

// ============================ 查找替换 ============================
const findText = ref('');
const replaceText = ref('');
const findIndex = ref(-1);

interface FindHit {
  row: number;
  col: number;
  field: string;
}

const findHits = shallowRef<FindHit[]>([]);

const computeFind = () => {
  const kw = findText.value.trim().toLowerCase();
  if (!kw) {
    findHits.value = [];
    findIndex.value = -1;
    return;
  }
  const hits: FindHit[] = [];
  displayRows.value.forEach((row, ri) => {
    colFields.value.forEach((field, ci) => {
      if (!isMetaField(field) && String(row[field] ?? '').toLowerCase().includes(kw)) {
        hits.push({ row: ri, col: ci, field });
      }
    });
  });
  findHits.value = hits;
  findIndex.value = hits.length ? 0 : -1;
};

const hasMatches = computed(() => findHits.value.length > 0);
const findIndexLabel = computed(() =>
  findHits.value.length ? `${findIndex.value + 1} / ${findHits.value.length}` : '无匹配',
);

const revealCell = (col: number, row: number) => {
  table?.scrollToCell({ col, row });
  table?.selectCell(col, row);
  activeCell.value = { col, row };
  flashPos.value = { col, row };
  window.setTimeout(() => {
    flashPos.value = null;
    table?.renderWithRecreateCells();
  }, 900);
};

const jumpToHit = (idx: number) => {
  const hit = findHits.value[idx];
  if (!hit) {
    return;
  }
  findIndex.value = idx;
  revealCell(hit.col, hit.row);
};

const findNext = () => {
  if (!findHits.value.length) {
    computeFind();
    return;
  }
  jumpToHit((findIndex.value + 1) % findHits.value.length);
};

const findPrev = () => {
  const n = findHits.value.length;
  if (!n) {
    return;
  }
  jumpToHit((findIndex.value - 1 + n) % n);
};

const toggleFind = () => {
  findVisible.value = !findVisible.value;
  if (findVisible.value) {
    computeFind();
  }
};

const replaceCurrent = () => {
  const hit = findHits.value[findIndex.value];
  if (!hit) {
    return;
  }
  const row = displayRows.value[hit.row];
  const col = colOf(hit.field);
  if (!row || !col) {
    return;
  }
  const before = row[hit.field];
  const { value } = coerce(col, replaceText.value, before);
  row[hit.field] = value;
  row.changed = true;
  historyApi.pushCells('替换', [{ rowId: row.rowId, field: hit.field, before, after: value }]);
  records.value = records.value.slice();
  validation.scanAll(records.value);
  tickDep();
  syncData(true);
  ElMessage.success('已替换当前项');
};

const replaceAll = () => {
  const kw = findText.value;
  if (!kw) {
    return;
  }
  const patches: Array<{ rowId: string; field: string; before: unknown; after: unknown }> = [];
  records.value.forEach((row) => {
    colFields.value.forEach((field) => {
      const col = colOf(field);
      if (!col || isMetaField(field)) {
        return;
      }
      const text = String(row[field] ?? '');
      if (!text.toLowerCase().includes(kw.toLowerCase())) {
        return;
      }
      const { value, reject } = coerce(col, text.replaceAll(kw, replaceText.value), row[field]);
      if (reject || value === row[field]) {
        return;
      }
      patches.push({ rowId: row.rowId, field, before: row[field], after: value });
      row[field] = value;
      row.changed = true;
    });
  });
  if (!patches.length) {
    ElMessage.info('没有可替换的内容（数字列只接受数值）');
    return;
  }
  historyApi.pushCells('全部替换', patches);
  records.value = records.value.slice();
  validation.scanAll(records.value);
  tickDep();
  syncData(true);
  ElMessage.success(`已替换 ${patches.length} 处`);
};

// ============================ 统计 ============================
interface NumAgg {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}
const emptyAgg = () => ({ count: 0, sum: 0, min: Infinity, max: -Infinity });
const finishAgg = (a: { count: number; sum: number; min: number; max: number }): NumAgg | null =>
  a.count ? { count: a.count, sum: round2(a.sum), avg: round2(a.sum / a.count), min: a.min, max: a.max } : null;

const selectedCount = computed(() => {
  tickDep();
  return records.value.filter((r) => r.selected).length;
});

const dirtyCount = computed(() => {
  tickDep();
  return records.value.filter((r) => r.changed).length;
});

const posLabel = computed(() => {
  const cell = activeCell.value;
  if (!cell) {
    return '未选中单元格';
  }
  const row = recordAt(cell.row);
  const field = fieldAt(cell.col);
  let colLabel = labelOf(field);
  if (field === 'rowNo') {
    colLabel = '行号';
  } else if (field === 'selected') {
    colLabel = '选择';
  }
  return `${colLabel} · 第 ${row ? records.value.indexOf(row) + 1 : cell.row + 1} 行`;
});

const selectionStats = computed<NumAgg | null>(() => {
  tickDep();
  const s = selectionRect.value;
  if (!s) {
    return null;
  }
  const acc = emptyAgg();
  for (let r = Math.min(s.r0, s.r1); r <= Math.max(s.r0, s.r1); r += 1) {
    const row = recordAt(r);
    if (row) {
      for (let c = Math.min(s.c0, s.c1); c <= Math.max(s.c0, s.c1); c += 1) {
        const field = fieldAt(c);
        const col = colOf(field);
        if (col && col.type === 'number') {
          const n = numOf(row[field]);
          if (n !== null) {
            acc.count += 1;
            acc.sum += n;
            if (n < acc.min) {
              acc.min = n;
            }
            if (n > acc.max) {
              acc.max = n;
            }
          }
        }
      }
    }
  }
  return finishAgg(acc);
});

const chips = computed(() => query.chips.value);
const queryCol = computed(() => colOf(queryField.value));
const distinctValues = computed(() => (queryField.value ? query.distinctValues(queryField.value) : []));

const chipType = (kind: 'search' | 'filter' | 'sort'): 'info' | 'warning' | 'success' => {
  if (kind === 'search') {
    return 'info';
  }
  return kind === 'filter' ? 'warning' : 'success';
};

const applyFilter = () => {
  if (!queryField.value) {
    return;
  }
  if (queryCol.value?.type === 'number') {
    query.setFilter(queryField.value, { values: [], min: filterDraft.min, max: filterDraft.max });
  } else {
    query.setFilter(queryField.value, { values: filterDraft.values, min: null, max: null });
  }
  ElMessage.success('筛选已应用');
};

const clearFilterOf = (field: string) => {
  query.clearFilter(field);
};

// ============================ 工具栏动作 ============================
const onAddRow = () => {
  actions.addRow();
  ElMessage.success('已新增行');
};

// ============================ 保存（Univer 式：全量复校验 → 跳错 / 清脏 + mock 提交） ============================
const onSubmit = () => {
  submitting.value = true;
  window.setTimeout(() => {
    submitting.value = false;
    validation.scanAll(records.value);
    tickDep();
    const first = errorItems.value[0];
    if (first) {
      ElMessage.error(`保存失败：${errorCount.value} 处校验未通过`);
      // 跳到第一个错误格（该行被筛选挡住时先清查询条件再定位）
      const locate = () => {
        const at = displayRows.value.findIndex((r) => r.rowId === first.rowId);
        const col = colFields.value.indexOf(first.field);
        if (at >= 0 && col >= 0) {
          revealCell(col, at);
        }
      };
      if (displayRows.value.some((r) => r.rowId === first.rowId)) {
        locate();
      } else {
        query.clearAllQuery();
        nextTick(locate);
      }
      return;
    }
    // 校验全过：清改动标记（服务端已接收），打印 mock 数据（结构对齐 Univer）
    records.value.forEach((r) => {
      r.changed = false;
    });
    records.value = records.value.slice();
    tickDep();
    console.log('[mock] 保存数据', records.value);
    ElMessage.success('保存成功');
  }, 400);
};

// ============================ 列配置（共享抽屉：点列头 / 新增列 / 删除列） ============================
/** 点列头 / 抽屉正在配的那一列（add 模式下为 null） */
const colConfigTarget = ref<BiCol | null>(null);

const openColConfig = (col: BiCol) => {
  addColMode.value = false;
  colConfigTarget.value = col;
  colConfigVisible.value = true;
};

/** 工具栏「新增列」：打开同一个抽屉的新增模式（不绑定已有列，与 Univer 同语义） */
const openAddCol = () => {
  addColMode.value = true;
  colConfigTarget.value = null;
  colConfigVisible.value = true;
};

/** 新增模式确认：建列 + 回写草稿细项 + 全行回填空值（必填空值不标红形同虚设） */
const onColumnConfigAdd = (d: Omit<ColumnDraft, 'field'>) => {
  const before = historyApi.snapshot(`新增列「${d.label}」`);
  const col = addCol(d.type, d.label);
  updateCol(col.field, {
    required: !!d.required,
    visible: d.visible ?? true,
    options: d.type === 'select' ? d.options : undefined,
    rules: d.rules,
    cross: d.cross?.length ? d.cross : undefined,
    dateFormat: d.type === 'date' ? d.dateFormat : undefined,
    width: d.width ?? col.width,
    frozen: d.frozen,
    group: d.group,
  });
  records.value.forEach((r) => {
    r[col.field] = emptyValueFor(col);
  });
  historyApi.pushSnapshot(before);
  validation.scanAll(records.value);
  rebuild();
  ElMessage.success(`已新增列「${col.label}」`);
};

/**
 * 点表头 → 打开该列配置（三套录入台统一入口；vxe 走 header-cell-click，
 * Univer 走「点列标后的整列选中」信号，这里直接拿 click_cell 的 cellLocation）。
 *
 * col 下标含前置的「#」「选择」两列，必须先用 fieldAt 反查真实字段；
 * 分组表头是多行结构，只有最后一行是叶子行——父表头横跨多列，
 * 无法判定要配哪一列，直接忽略。
 */
const headerRowCount = computed(() => (groupColumns(visibleCols.value).some((g) => g.title) ? 2 : 1));

onHeaderCell = (col: number, row: number) => {
  if (row !== headerRowCount.value - 1) {
    return;
  }
  const field = fieldAt(col);
  if (!field || isMetaField(field)) {
    return;
  }
  const target = colOf(field);
  if (target) {
    openColConfig(target);
  }
};

/**
 * 共享抽屉确认：整体回写列定义后全表重校 + 重建。
 * 草稿里的 rules / cross 已由抽屉裁剪（空值不落盘），这里不再二次清洗。
 */
const applyColConfig = (d: ColumnDraft) => {
  const col = colConfigTarget.value;
  if (!col) {
    return;
  }
  updateCol(col.field, {
    label: d.label,
    type: d.type,
    required: !!d.required,
    visible: d.visible,
    frozen: !!d.frozen,
    group: d.group,
    dateFormat: d.dateFormat,
    options: d.options,
    rules: d.rules,
    cross: d.cross,
  });
  validation.scanAll(records.value);
  rebuild();
};

/** 共享抽屉里点「删除该列」：入撤销栈 + 重校 + 重建 */
const onRemoveCol = (col: BiCol) => {
  const before = historyApi.snapshot('删除列');
  removeCol(col.field);
  // 同步清理所有行上的该字段
  records.value.forEach((r) => {
    delete r[col.field];
  });
  historyApi.pushSnapshot(before);
  validation.scanAll(records.value);
  rebuild();
};

/** 共享抽屉里点「删除该列」：删当前正在配置的那一列 */
const onRemoveConfigCol = () => {
  const col = colConfigTarget.value;
  if (!col) {
    return;
  }
  onRemoveCol(col);
};

// ============================ 生命周期 ============================
const onGlobalClick = () => {
  menu.show = false;
};

const closeOverlays = () => {
  menu.show = false;
  colConfigVisible.value = false;
};

onMounted(() => {
  // 种子数据（不进撤销栈，语义对齐 Univer 的 seedData）
  actions.seedData(500);
  rebuild();
  window.addEventListener('keydown', onKeydown, true);
  window.addEventListener('click', onGlobalClick);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown, true);
  window.removeEventListener('click', onGlobalClick);
  // sheet.release() 内部会释放 tableInstance，再单独 table.release() 就是重复释放
  sheet?.release();
  sheet = null;
  table = null;
});

watch(
  () => displayRows.value,
  () => {
    if (!table) {
      return;
    }
    table.setRecords(displayRows.value);
  },
  { flush: 'post' },
);

watch(
  () => themeStore.isDark,
  () => rebuild(),
);

watch(findText, computeFind);

watch(
  () => cols.value.map((c) => `${c.field}:${c.type}:${c.visible ? 1 : 0}:${c.frozen ? 1 : 0}:${c.label}`).join('|'),
  () => rebuild(),
);

// 模板里用到的事件类型判断
const chipTagType = chipType;

/** 父页面（tabs 场景）从隐藏变可见后调用：Canvas 在 display:none 里初始化会得到 0 尺寸 */
const resize = () => {
  if (!sheet) {
    return;
  }
  sheet.resize();
  // 首次挂载在隐藏的 tab 里时容器宽为 0，列宽只能按最小宽兜底 → 表格填不满面板。
  // 容器一有宽度就按真实宽度重算一次列宽（此时才谈得上"撑满"）。
  const w = tableRef.value?.clientWidth ?? 0;
  if (w > 0 && Math.abs(w - builtWidth) > 4) {
    rebuild();
  }
};

defineExpose({ resize });
</script>

<style lang="less" scoped>
.vtable-sheet-bi {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  /* 骨架见全局 .bi-toolbar；此处只留主组件内的微调 */

  &__group {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__search {
    width: 170px;
  }

  &__chips {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    padding: 2px 4px;
  }

  &__chips-label {
    font-size: 12px;
    color: var(--bi-sub);
  }

  &__bar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    padding: 6px 8px;
    border: 1px dashed var(--bi-border);
    border-radius: var(--bi-radius, 10px);
  }

  &__bar-input {
    width: 150px;
  }

  &__bar-count {
    font-size: 12px;
    color: var(--bi-sub);
    min-width: 56px;
    text-align: center;
  }

  // 表格区：边框/圆角/底色/阴影/撑满都来自 .bi-panel（全局 bi-entry.less），此处只补宽度
  &__table {
    width: 100%;

    // sheet 自建根节点 .vtable-sheet-container 要撑满 .bi-panel，否则内容区高度塌陷成 0
    :deep(.vtable-sheet-container) {
      height: 100%;
      min-height: 0;
    }
  }

  // 状态栏：骨架见 .bi-statusbar（全局 bi-entry.less），此处只留 VTable 专有的定位数字样式
  &__status {
    margin-top: 0;
  }

  &__status-pos {
    font-weight: 650;
  }

  &__sep {
    width: 1px;
    height: 12px;
    background: var(--bi-border);
  }

  &__menu {
    position: fixed;
    z-index: 3000;
    min-width: 168px;
    padding: 4px;
    background: var(--el-bg-color-overlay, #fff);
    border: 1px solid var(--el-border-color-light, #e4e7ed);
    border-radius: var(--ai-radius-sm);
    box-shadow: 0 6px 20px rgb(0 0 0 / 12%);
  }

  &__menu-item {
    padding: 6px 10px;
    font-size: 13px;
    border-radius: var(--ai-radius-xs);
    cursor: pointer;

    &:hover {
      background: var(--el-fill-color-light, #f5f7fa);
    }
  }

  &__menu-sep {
    height: 1px;
    margin: 4px 2px;
    background: var(--el-border-color-lighter, #ebeef5);
  }

  &__coleselect {
    width: 150px;
  }

  &__querybox {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  &__querysub {
    margin: 6px 0;
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399);
  }

  &__querylist {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__full {
    width: 100%;
  }
}
</style>
