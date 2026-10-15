<template>
  <div class="dt-page" ref="gridWrapper">
    <!-- 顶部标题 -->
    <div class="dt-header">
      <div class="dt-title">
        <span class="dt-logo">表</span>
        <div>
          <h3>网页端 Excel 数据录入</h3>
          <p class="dt-sub">vxe-table · 数据中台录入台 · 支持大数据量虚拟滚动</p>
        </div>
      </div>
      <div class="dt-stats">
        <span class="stat-pill"><b>{{ processedRows.length.toLocaleString() }}</b> 行</span>
        <span class="stat-pill warn"><b>{{ dirtyCount }}</b> 改动</span>
        <span class="stat-pill danger"><b>{{ errorCount }}</b> 错误</span>
        <span class="stat-pill ok"><b>{{ selectedCount }}</b> 选中</span>
        <span v-if="lastGen" class="stat-pill info">{{ lastGen }}</span>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="dt-toolbar">
      <div class="tb-group">
        <el-button type="primary" @click="addRow">＋ 新增</el-button>
        <el-button @click="insertRow">⬇ 插入</el-button>
        <el-button type="danger" plain @click="deleteSelected" :disabled="!selectedCount">－ 删除选中</el-button>
        <el-button @click="duplicateSelected" :disabled="!selectedCount">⧉ 复制行</el-button>
      </div>
      <el-divider direction="vertical" />
      <div class="tb-group">
        <el-button @click="openAddCol">＋ 列</el-button>
        <el-button @click="colDrawer = true">⚙ 列设置</el-button>
        <el-button @click="fillVisible = !fillVisible">▣ 批量填充</el-button>
      </div>
      <el-divider direction="vertical" />
      <div class="tb-group">
        <el-button :disabled="!canUndo" @click="undo" title="Ctrl+Z">↶ 撤销</el-button>
        <el-button :disabled="!canRedo" @click="redo" title="Ctrl+Y">↷ 重做</el-button>
      </div>
      <el-divider direction="vertical" />
      <div class="tb-group">
        <el-input v-model="searchText" placeholder="全局搜索…" clearable style="width: 170px" />
        <el-button @click="findVisible = !findVisible" type="primary" plain title="Ctrl+F">🔍 查找替换</el-button>
      </div>
      <el-divider direction="vertical" />
      <div class="tb-group">
        <el-button @click="importExcel">⬆ 导入</el-button>
        <el-dropdown @command="onExportCommand" trigger="click">
          <el-button>⬇ 导出<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="excelAll">导出 Excel（全部）</el-dropdown-item>
              <el-dropdown-item command="excelResult">导出 Excel（当前结果）</el-dropdown-item>
              <el-dropdown-item command="csv">导出 CSV（当前结果）</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <el-divider direction="vertical" />
      <div class="tb-group">
        <el-button type="success" @click="submit" :loading="submitting">💾 提交</el-button>
        <el-button @click="clearAll" plain>清空</el-button>
      </div>
      <el-divider direction="vertical" />
      <div class="tb-group gen">
        <el-button size="small" type="primary" @click="presetData(500)">预制数据</el-button>
        <span class="gen-label">压测：</span>
        <el-button size="small" @click="genData(1000)">1千</el-button>
        <el-button size="small" @click="genData(10000)">1万</el-button>
        <el-button size="small" @click="genData(50000)">5万</el-button>
        <el-button size="small" @click="genData(100000)">10万</el-button>
      </div>
      <el-divider direction="vertical" />
      <div class="tb-group">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="virtual">虚拟滚动</el-radio-button>
          <el-radio-button value="paged">分页</el-radio-button>
        </el-radio-group>
        <el-button size="small" @click="errDrawer = true" :disabled="!errorCount">
          校验面板 ({{ errorCount }})
        </el-button>
      </div>
    </div>

    <!-- 查找替换条 -->
    <div v-if="findVisible" class="dt-findbar">
      <span>查找</span>
      <el-input v-model="findText" style="width: 150px" placeholder="内容…" @keyup.enter="findNext" />
      <span>替换</span>
      <el-input v-model="replaceText" style="width: 150px" placeholder="替换为…" />
      <el-select v-model="findScope" style="width: 110px">
        <el-option label="全部列" value="all" />
        <el-option label="当前列" value="col" />
      </el-select>
      <el-checkbox v-model="findCase">区分大小写</el-checkbox>
      <el-checkbox v-model="findWhole">整格匹配</el-checkbox>
      <el-button size="small" @click="findNext">查找下一个</el-button>
      <el-button size="small" @click="replaceOne">替换</el-button>
      <el-button size="small" type="primary" @click="replaceAll">全部替换</el-button>
      <span class="find-count">命中 {{ findMatches.length }} 处 / 第 {{ findIdx + 1 }} 个</span>
      <el-button size="small" text @click="findVisible = false">✕</el-button>
    </div>

    <!-- 批量填充面板 -->
    <div v-if="fillVisible" class="dt-fillbar">
      <span>列</span>
      <el-select v-model="fillField" style="width: 130px">
        <el-option v-for="d in visibleDefs" :key="d.field" :label="d.label" :value="d.field" />
      </el-select>
      <span>值</span>
      <el-input v-if="fillDef?.type !== 'select'" v-model="fillValue" style="width: 150px"
        :placeholder="fillDef?.type === 'number' ? '数字' : '文本'" />
      <el-select v-else v-model="fillValue" style="width: 150px" placeholder="选择">
        <el-option v-for="o in fillDef.options" :key="o" :label="o" :value="o" />
      </el-select>
      <span>范围</span>
      <el-select v-model="fillScope" style="width: 130px">
        <el-option label="选中行" value="selected" />
        <el-option label="当前结果" value="result" />
        <el-option label="全部" value="all" />
      </el-select>
      <el-button size="small" type="primary" @click="batchFill">应用</el-button>
      <el-button size="small" @click="batchClearCol">清空该列</el-button>
      <el-button size="small" text @click="fillVisible = false">✕</el-button>
    </div>

    <!-- 表格 -->
    <div class="dt-grid" ref="gridBox">
      <VxeTable
        ref="tableRef"
        :data="pagedRows"
        :edit-config="editConfig"
        :keyboard-config="keyboardConfig"
        :mouse-config="{ selected: true }"
        :sort-config="{ trigger: 'cell', remote: true, multiple: true }"
        :filter-config="{ remote: true }"
        :tooltip-config="{ mode: 'title' }"
        :row-config="{ keyField: '__id', isCurrent: true, isHover: true }"
        :column-config="{ resizable: true, isCurrent: true }"
        :show-overflow="true"
        :border="true"
        :scroll-y="{ enabled: true, gt: 10 }"
        :scroll-x="{ enabled: true, gt: 0 }"
        :height="gridHeight"
        :auto-resize="true"
        :cell-class-name="cellClassName"
        :row-class-name="rowClassName"
        @cell-click="onCellClick"
        @sort-change="onSortChange"
        @filter-change="onFilterChange"
      />
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

    <!-- 新增列 -->
    <el-dialog v-model="colDialogVisible" title="新增自定义列" width="420px">
      <el-form label-width="80px">
        <el-form-item label="列名" required>
          <el-input v-model="colForm.name" placeholder="如：手机号" maxlength="20" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="colForm.type" style="width: 100%">
            <el-option label="文本" value="text" />
            <el-option label="数字" value="number" />
            <el-option label="下拉" value="select" />
            <el-option label="日期" value="date" />
          </el-select>
        </el-form-item>
        <el-form-item label="下拉选项" v-if="colForm.type === 'select'">
          <el-input v-model="colForm.options" placeholder="逗号分隔，如：A,B,C" />
        </el-form-item>
        <el-form-item label="必填">
          <el-switch v-model="colForm.required" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="colDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddCol">确定</el-button>
      </template>
    </el-dialog>

    <!-- 列设置抽屉 -->
    <el-drawer v-model="colDrawer" title="列设置" direction="rtl" size="420px">
      <div class="col-set-tip">拖拽排序、显隐、冻结、必填；改完即时生效。</div>
      <div class="col-set-list">
        <div v-for="(d, i) in columnDefs" :key="d.field" class="col-set-item">
          <span class="col-order">
            <el-button text size="small" :disabled="i === 0" @click="moveCol(i, -1)">↑</el-button>
            <el-button text size="small" :disabled="i === columnDefs.length - 1" @click="moveCol(i, 1)">↓</el-button>
          </span>
          <el-input v-model="d.label" size="small" class="col-label" />
          <el-tag size="small" effect="plain">{{ typeLabel[d.type] }}</el-tag>
          <el-switch v-model="d.visible" size="small" inline-prompt active-text="显" inactive-text="隐" />
          <el-switch v-model="d.frozen" size="small" inline-prompt active-text="冻" inactive-text="松" />
          <el-switch v-model="d.required" size="small" inline-prompt active-text="必" inactive-text="选" />
        </div>
      </div>
    </el-drawer>

    <!-- 校验面板抽屉 -->
    <el-drawer v-model="errDrawer" title="校验问题" direction="rtl" size="420px">
      <el-empty v-if="!errorList.length" description="没有校验错误，数据合规 ✅" />
      <div v-else class="err-list">
        <div v-for="(e, i) in errorList" :key="i" class="err-item" @click="jumpToError(e)">
          <span class="err-idx">#{{ i + 1 }}</span>
          <div>
            <div class="err-field">{{ e.rowLabel }} · {{ e.colLabel }}</div>
            <div class="err-msg">{{ e.msg }}</div>
          </div>
          <el-button text size="small" type="primary">跳转</el-button>
        </div>
      </div>
    </el-drawer>

    <input ref="fileInputRef" type="file" accept=".xlsx,.xls" style="display: none" @change="onFileChange" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, h, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { VxeTable, renderer as vxeTableRenderer } from 'vxe-table';
import 'vxe-table/es/style.css';
import * as XLSX from 'xlsx';

defineOptions({ name: 'ExcelDataEntryVxe' });

// ===================== 类型与基础定义 =====================
type Row = { __id: string; __dirty: boolean; [key: string]: any };
type ColType = 'text' | 'number' | 'select' | 'date';
interface ColDef {
  field: string;
  label: string;
  type: ColType;
  options?: string[];
  required?: boolean;
  visible: boolean;
  frozen?: boolean;
  width?: number;
}
const typeLabel: Record<ColType, string> = { text: '文本', number: '数字', select: '下拉', date: '日期' };

const DEPARTMENTS = ['研发', '市场', '财务', '人事', '运营'];
const STATUSES = ['在职', '试用期', '离职'];
const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
const GIVEN = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '霞', '平', '刚', '燕'];
const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '苏州'];

const columnDefs = ref<ColDef[]>([
  { field: 'name', label: '姓名', type: 'text', required: true, frozen: true, visible: true, width: 120 },
  { field: 'age', label: '年龄', type: 'number', required: true, visible: true, width: 90 },
  { field: 'department', label: '部门', type: 'select', options: DEPARTMENTS, required: true, visible: true, width: 110 },
  { field: 'joinDate', label: '入职日期', type: 'date', required: true, visible: true, width: 130 },
  { field: 'email', label: '邮箱', type: 'text', required: false, visible: true, width: 200 },
  { field: 'status', label: '状态', type: 'select', options: STATUSES, required: true, visible: true, width: 100 },
  { field: 'remark', label: '备注', type: 'text', required: false, visible: true, width: 160 },
]);

let seq = 0;
const uid = () => `row_${Date.now().toString(36)}_${seq++}`;
const makeRow = (init: Record<string, any> = {}): Row => {
  const row: Row = { __id: uid(), __dirty: false, ...init };
  for (const d of columnDefs.value) {
    if (!(d.field in row)) {
      row[d.field] = d.type === 'number' ? null : d.type === 'select' ? (d.options?.[0] ?? '') : '';
    }
  }
  return row;
};

// 真实感示例数据（数据中台：员工主数据）
const genSampleRows = (n: number): Row[] => {
  const arr: Row[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const name = SURNAMES[i % SURNAMES.length] + GIVEN[(i * 3) % GIVEN.length];
    const age = 22 + (i % 40);
    const department = DEPARTMENTS[i % DEPARTMENTS.length];
    const year = 2018 + (i % 8);
    const month = 1 + (i % 12);
    const day = 1 + ((i * 5) % 27);
    const joinDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const email = `emp${String(i + 1).padStart(4, '0')}@corp.example.com`;
    const status = STATUSES[i % STATUSES.length];
    const remark = CITIES[i % CITIES.length];
    arr[i] = makeRow({ name, age, department, joinDate, email, status, remark });
  }
  return arr;
};

// 预制示例数据（页面打开即载入）
const allRows = ref<Row[]>(genSampleRows(200));

// ===================== 校验 =====================
const cellErrors = reactive<Record<string, string>>({});
const errKey = (rowId: string, field: string) => `${rowId}__${field}`;

const validateCell = (row: Row, field: string) => {
  const key = errKey(row.__id, field);
  const value = row[field];
  const def = columnDefs.value.find((d) => d.field === field);
  let msg = '';
  if (def?.required && (value === null || value === undefined || value === '')) {
    msg = `${def.label}必填`;
  } else if (field === 'email' && value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value))) {
    msg = '邮箱格式不正确';
  } else if (field === 'age' && value !== null && value !== '' && (Number(value) < 18 || Number(value) > 65)) {
    msg = '年龄需在 18-65';
  }
  if (msg) cellErrors[key] = msg;
  else delete cellErrors[key];
};

const revalidateAll = () => {
  for (const k of Object.keys(cellErrors)) delete cellErrors[k];
  for (const r of allRows.value) for (const d of columnDefs.value) validateCell(r, d.field);
};

const errorCount = computed(() => Object.keys(cellErrors).length);
const dirtyCount = computed(() => allRows.value.reduce((n, r) => n + (r.__dirty ? 1 : 0), 0));

// ===================== 编辑渲染器 =====================
const editContext = { rowId: '', field: '', old: undefined as any };
// 自定义编辑渲染器：v4 内联 renderEdit 无效，必须经 renderer.add 注册后按 name 引用
const renderInputEdit = (renderOpts: any, params: any) => {
  const { row, column } = params;
  const field = column.field;
  return [
    h('input', {
      class: 'dt-edit-native',
      type: renderOpts.type || 'text',
      value: row[field] ?? '',
      style: 'width:100%;height:100%;border:none;outline:none;background:transparent;padding:0 8px;font-size:13px;',
      onFocus: () => { editContext.rowId = row.__id; editContext.field = field; editContext.old = row[field]; },
      onInput: (e: any) => { row[field] = e.target.value; },
      onBlur: () => {
        const changed = editContext.rowId === row.__id && editContext.field === field && editContext.old !== row[field];
        if (changed) pushHistoryWithRevert(row.__id, field, editContext.old);
        editContext.rowId = ''; editContext.field = '';
        row.__dirty = true;
        validateCell(row, field);
      },
    }),
  ];
};

const renderSelectEdit = (renderOpts: any, params: any) => {
  const { row, column } = params;
  const field = column.field;
  const options: string[] = renderOpts.options ?? [];
  return [
    h(
      'select',
      {
        class: 'dt-edit-native',
        value: row[field] ?? '',
        style: 'width:100%;height:100%;border:none;outline:none;background:transparent;padding:0 4px;font-size:13px;',
        onChange: (e: any) => { row[field] = e.target.value; row.__dirty = true; validateCell(row, field); },
      },
      [h('option', { value: '' }, ''), ...options.map((o) => h('option', { value: o }, o))],
    ),
  ];
};

const ensureRenderers = () => {
  const r = vxeTableRenderer as any;
  if (!r?.add) return;
  if (!r.get('dt-native-input')) {
    r.add('dt-native-input', { autofocus: '.dt-edit-native', renderEdit: renderInputEdit });
  }
  if (!r.get('dt-native-select')) {
    r.add('dt-native-select', { autofocus: '.dt-edit-native', renderEdit: renderSelectEdit });
  }
};
ensureRenderers();

const makeEditRender = (d: ColDef) =>
  d.type === 'number'
    ? { name: 'dt-native-input', type: 'number' }
    : d.type === 'select'
      ? { name: 'dt-native-select', options: d.options ?? [] }
      : d.type === 'date'
        ? { name: 'dt-native-input', type: 'date' }
        : { name: 'dt-native-input', type: 'text' };

// ===================== 列定义 =====================
const visibleDefs = computed(() => columnDefs.value.filter((d) => d.visible));
const labelOf = (f: string) => columnDefs.value.find((d) => d.field === f)?.label ?? f;

const buildColumns = (): any[] => {
  const cols: any[] = [
    { type: 'checkbox', width: 44, fixed: 'left', align: 'center', className: 'dt-chk' },
    { type: 'seq', width: 52, fixed: 'left', title: '#', align: 'center' },
  ];
  for (const d of columnDefs.value) {
    if (!d.visible) continue;
    const col: any = {
      field: d.field,
      title: d.label,
      minWidth: 110,
      width: d.width,
      resizable: true,
      sortable: true,
      fixed: d.frozen ? 'left' : undefined,
      className: d.required ? 'dt-col-req' : '',
    };
    if (d.type === 'select' && d.options?.length) {
      col.filters = d.options.map((o) => ({ label: o, value: o, checked: false }));
    }
    col.editRender = makeEditRender(d);
    cols.push(col);
  }
  return cols;
};
const columns = computed(() => buildColumns());

const editConfig = reactive({ trigger: 'dblclick', mode: 'cell' });
const keyboardConfig = reactive({
  isArrow: true, isTab: true, isEnter: true, isDel: true, isBack: true, isEdit: true, isChecked: true, enterToTab: false,
});

// ===================== 搜索 / 筛选 / 排序 / 视图 =====================
const searchText = ref('');
const columnFilters = reactive<Record<string, string[]>>({});
const sortList = ref<{ field: string; order: 'asc' | 'desc' }[]>([]);
const viewMode = ref<'virtual' | 'paged'>('virtual');
const pager = reactive({ currentPage: 1, pageSize: 100 });

const searchFiltered = computed<Row[]>(() => {
  const kw = searchText.value.trim().toLowerCase();
  if (!kw) return allRows.value;
  return allRows.value.filter((r) => visibleDefs.value.some((d) => String(r[d.field] ?? '').toLowerCase().includes(kw)));
});

const filteredRows = computed<Row[]>(() => {
  const keys = Object.keys(columnFilters).filter((k) => columnFilters[k]?.length);
  if (!keys.length) return searchFiltered.value;
  return searchFiltered.value.filter((r) => keys.every((k) => columnFilters[k].includes(String(r[k] ?? ''))));
});

const processedRows = computed<Row[]>(() => {
  const rows = filteredRows.value;
  if (!sortList.value.length) return rows;
  const sl = sortList.value;
  return [...rows].sort((a, b) => {
    for (const s of sl) {
      const av = a[s.field];
      const bv = b[s.field];
      let cmp = 0;
      if (av === bv) cmp = 0;
      else if (av === null || av === undefined || av === '') cmp = 1;
      else if (bv === null || bv === undefined || bv === '') cmp = -1;
      else if (!isNaN(Number(av)) && !isNaN(Number(bv))) cmp = Number(av) - Number(bv);
      else cmp = String(av).localeCompare(String(bv), 'zh-CN');
      if (cmp !== 0) return s.order === 'asc' ? cmp : -cmp;
    }
    return 0;
  });
});

const pagedRows = computed<Row[]>(() => {
  if (viewMode.value === 'paged') {
    const start = (pager.currentPage - 1) * pager.pageSize;
    return processedRows.value.slice(start, start + pager.pageSize);
  }
  return processedRows.value;
});

watch(
  () => [processedRows.value.length, pager.pageSize, viewMode.value],
  () => {
    const maxPage = Math.max(1, Math.ceil(processedRows.value.length / pager.pageSize));
    if (pager.currentPage > maxPage) pager.currentPage = maxPage;
  },
  { immediate: true },
);

const onSortChange = (params: any) => {
  if (params?.sortList?.length) {
    sortList.value = params.sortList
      .map((s: any) => ({ field: s.field, order: s.order }))
      .filter((s: any) => s.order);
  } else {
    const field = params?.field ?? params?.property;
    const order = params?.order;
    if (!field) { sortList.value = []; return; }
    const list = sortList.value.slice();
    const i = list.findIndex((s) => s.field === field);
    if (!order) { sortList.value = list.filter((s) => s.field !== field); return; }
    if (i >= 0) list[i].order = order;
    else list.push({ field, order });
    sortList.value = list;
  }
};

const onFilterChange = (params: any) => {
  const col = params?.column;
  const field = col?.field ?? params?.field ?? params?.property;
  if (!field) return;
  let values: string[] = params?.values ?? col?.filteredValue ?? [];
  if ((!values || !values.length) && col?.filters) values = col.filters.filter((f: any) => f.checked).map((f: any) => f.value);
  columnFilters[field] = values ?? [];
};

// ===================== 选中 / 当前单元格 =====================
const tableRef = ref<any>(null);
// vxe-table 的 <vxe-table> 无 columns prop（那是 vxe-grid 的用法），列须用 loadColumn 动态加载
const applyColumns = () => { tableRef.value?.loadColumn?.(columns.value); };
watch(columns, () => nextTick(applyColumns));
const gridWrapper = ref<HTMLElement>();
const gridBox = ref<HTMLElement>();
// 实测网格容器像素高度，作为虚拟滚动的确定高度（百分比在虚拟滚动下易解析为 0 行）
const gridHeight = ref(560);
let gridRO: ResizeObserver | null = null;
const syncGridHeight = () => {
  const h = gridBox.value?.clientHeight ?? 0;
  if (h > 0) gridHeight.value = h;
};
const fileInputRef = ref<HTMLInputElement>();
const submitting = ref(false);
const currentCell = ref<{ row: Row; field: string } | null>(null);

const selectedCount = computed(() => tableRef.value?.getCheckboxRecords?.()?.length ?? 0);
const onCellClick = (params: any) => {
  if (params?.row && params?.column?.field) currentCell.value = { row: params.row, field: params.column.field };
};

const cellClassName = ({ row, column }: any) => {
  const field = column?.field;
  if (!field) return '';
  const cls: string[] = [];
  if (cellErrors[errKey(row.__id, field)]) cls.push('cell-error');
  if (findMatchKeys.value.has(errKey(row.__id, field))) cls.push('cell-found');
  return cls.join(' ');
};
const rowClassName = ({ row }: any) => (row?.__dirty ? 'row-dirty' : '');

// ===================== 历史（撤销/重做） =====================
interface Snap { rows: Row[]; defs: ColDef[] }
const history = { undo: [] as Snap[], redo: [] as Snap[] };
const canUndo = ref(false);
const canRedo = ref(false);
const syncHistoryFlags = () => { canUndo.value = history.undo.length > 0; canRedo.value = history.redo.length > 0; };

const cloneRows = (rows: Row[]) => rows.map((r) => ({ ...r }));
const cloneDefs = () => JSON.parse(JSON.stringify(columnDefs.value)) as ColDef[];

const pushSnapshot = (snap: Snap) => { history.undo.push(snap); if (history.undo.length > 40) history.undo.shift(); history.redo.length = 0; syncHistoryFlags(); };
// 在编辑提交时，记录“编辑前”的整库快照（仅当该格真正变化时）
const pushHistoryWithRevert = (rowId: string, field: string, oldVal: any) => {
  const snap = { rows: cloneRows(allRows.value), defs: cloneDefs() };
  const snapRow = snap.rows.find((r) => r.__id === rowId);
  if (snapRow) snapRow[field] = oldVal;
  pushSnapshot(snap);
};
const undo = () => {
  if (!history.undo.length) return;
  const cur = { rows: cloneRows(allRows.value), defs: cloneDefs() };
  const prev = history.undo.pop()!;
  history.redo.push(cur);
  allRows.value = prev.rows.map((r) => ({ ...r }));
  columnDefs.value = prev.defs;
  revalidateAll();
  syncHistoryFlags();
  ElMessage.success('已撤销');
};
const redo = () => {
  if (!history.redo.length) return;
  const cur = { rows: cloneRows(allRows.value), defs: cloneDefs() };
  const next = history.redo.pop()!;
  history.undo.push(cur);
  allRows.value = next.rows.map((r) => ({ ...r }));
  columnDefs.value = next.defs;
  revalidateAll();
  syncHistoryFlags();
  ElMessage.success('已重做');
};

// ===================== 行操作 =====================
const addRow = () => {
  pushSnapshot({ rows: cloneRows(allRows.value), defs: cloneDefs() });
  const row = makeRow();
  row.__dirty = true;
  allRows.value.push(row);
  nextTick(() => tableRef.value?.scrollToRow?.(row));
};
const insertRow = () => {
  pushSnapshot({ rows: cloneRows(allRows.value), defs: cloneDefs() });
  const row = makeRow();
  row.__dirty = true;
  const idx = currentCell.value ? allRows.value.findIndex((r) => r.__id === currentCell.value!.row.__id) : -1;
  if (idx >= 0) allRows.value.splice(idx + 1, 0, row);
  else allRows.value.push(row);
};
const deleteSelected = () => {
  const selected = tableRef.value?.getCheckboxRecords?.() ?? [];
  if (!selected.length) return;
  pushSnapshot({ rows: cloneRows(allRows.value), defs: cloneDefs() });
  const ids = new Set(selected.map((r: Row) => r.__id));
  allRows.value = allRows.value.filter((r) => !ids.has(r.__id));
  for (const k of Object.keys(cellErrors)) if (ids.has(k.split('__')[0])) delete cellErrors[k];
  ElMessage.success(`已删除 ${selected.length} 行`);
};
const duplicateSelected = () => {
  const selected = tableRef.value?.getCheckboxRecords?.() ?? [];
  if (!selected.length) return;
  pushSnapshot({ rows: cloneRows(allRows.value), defs: cloneDefs() });
  const copies = selected.map((r: Row) => { const c = makeRow({ ...r }); c.__dirty = true; return c; });
  const idx = allRows.value.findIndex((r) => r.__id === selected[selected.length - 1].__id);
  allRows.value.splice(idx + 1, 0, ...copies);
  ElMessage.success(`已复制 ${copies.length} 行`);
};
const clearAll = () => {
  pushSnapshot({ rows: cloneRows(allRows.value), defs: cloneDefs() });
  allRows.value = [];
  for (const k of Object.keys(cellErrors)) delete cellErrors[k];
};

// ===================== 列操作 =====================
const colDialogVisible = ref(false);
const colDrawer = ref(false);
const colSeq = { n: 0 };
const colForm = reactive({ name: '', type: 'text' as ColType, options: '', required: false });

const openAddCol = () => { colForm.name = ''; colForm.type = 'text'; colForm.options = ''; colForm.required = false; colDialogVisible.value = true; };
const confirmAddCol = () => {
  const name = colForm.name.trim();
  if (!name) { ElMessage.warning('请输入列名'); return; }
  pushSnapshot({ rows: cloneRows(allRows.value), defs: cloneDefs() });
  const field = `col_${++colSeq.n}_${Date.now()}`;
  const options = colForm.type === 'select' ? colForm.options.split(/[,，]/).map((s) => s.trim()).filter(Boolean) : undefined;
  columnDefs.value.push({ field, label: name, type: colForm.type, options, required: colForm.required, visible: true });
  for (const r of allRows.value) r[field] = colForm.type === 'number' ? null : colForm.type === 'select' ? (options?.[0] ?? '') : '';
  colDialogVisible.value = false;
  ElMessage.success(`已新增列「${name}」`);
};
const removeCol = (field: string) => {
  pushSnapshot({ rows: cloneRows(allRows.value), defs: cloneDefs() });
  columnDefs.value = columnDefs.value.filter((c) => c.field !== field);
  for (const r of allRows.value) delete r[field];
  for (const k of Object.keys(cellErrors)) if (k.endsWith(`__${field}`)) delete cellErrors[k];
  delete columnFilters[field];
};
const moveCol = (i: number, dir: number) => {
  const j = i + dir;
  if (j < 0 || j >= columnDefs.value.length) return;
  const arr = columnDefs.value;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  columnDefs.value = [...arr];
};

// ===================== 批量填充 =====================
const fillVisible = ref(false);
const fillField = ref('');
const fillValue = ref('');
const fillScope = ref<'selected' | 'result' | 'all'>('selected');
const fillDef = computed(() => columnDefs.value.find((d) => d.field === fillField.value));

const batchFill = () => {
  const def = fillDef.value;
  if (!def) { ElMessage.warning('请选择列'); return; }
  pushSnapshot({ rows: cloneRows(allRows.value), defs: cloneDefs() });
  let targets: Row[];
  if (fillScope.value === 'selected') targets = tableRef.value?.getCheckboxRecords?.() ?? [];
  else if (fillScope.value === 'result') targets = processedRows.value;
  else targets = allRows.value;
  if (!targets.length) { ElMessage.warning('没有可填充的数据'); return; }
  const v = def.type === 'number' ? (fillValue.value === '' ? null : Number(fillValue.value)) : fillValue.value;
  for (const r of targets) { r[def.field] = v; r.__dirty = true; validateCell(r, def.field); }
  ElMessage.success(`已填充 ${targets.length} 行`);
};
const batchClearCol = () => {
  const def = fillDef.value;
  if (!def) return;
  pushSnapshot({ rows: cloneRows(allRows.value), defs: cloneDefs() });
  let targets: Row[] = fillScope.value === 'selected' ? (tableRef.value?.getCheckboxRecords?.() ?? []) : fillScope.value === 'result' ? processedRows.value : allRows.value;
  for (const r of targets) { r[def.field] = def.type === 'number' ? null : def.type === 'select' ? (def.options?.[0] ?? '') : ''; r.__dirty = true; validateCell(r, def.field); }
  ElMessage.success('已清空该列');
};

// ===================== 导入 / 导出 =====================
const importExcel = () => fileInputRef.value?.click();
const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
    const labelField: Record<string, string> = {};
    for (const d of columnDefs.value) labelField[d.label] = d.field;
    pushSnapshot({ rows: cloneRows(allRows.value), defs: cloneDefs() });
    const rows = json.map((r) => {
      const row = makeRow();
      row.__dirty = true;
      for (const cn of Object.keys(r)) { const f = labelField[cn]; if (f) row[f] = r[cn]; }
      return row;
    });
    allRows.value = rows;
    for (const k of Object.keys(cellErrors)) delete cellErrors[k];
    revalidateAll();
    ElMessage.success(`已导入 ${rows.length} 行`);
  } catch (err) {
    ElMessage.error('导入失败：' + (err as Error).message);
  } finally {
    input.value = '';
  }
};

const buildExportRows = (source: Row[]) =>
  source.map((r) => {
    const o: Record<string, any> = {};
    for (const d of visibleDefs.value) o[d.label] = r[d.field];
    return o;
  });

const exportExcel = (scope: 'all' | 'result') => {
  const source = scope === 'all' ? allRows.value : processedRows.value;
  const ws = XLSX.utils.json_to_sheet(buildExportRows(source));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '录入数据');
  XLSX.writeFile(wb, scope === 'all' ? '数据录入_全部.xlsx' : '数据录入_结果.xlsx');
  ElMessage.success(`已导出 ${source.length} 行`);
};
const exportCsv = () => {
  const source = processedRows.value;
  const header = visibleDefs.value.map((d) => d.label);
  const rows = source.map((r) => visibleDefs.value.map((d) => `"${String(r[d.field] ?? '').replace(/"/g, '""')}"`).join(','));
  const csv = '﻿' + [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = '数据录入_结果.csv'; a.click();
  URL.revokeObjectURL(url);
  ElMessage.success(`已导出 ${source.length} 行`);
};
const onExportCommand = (cmd: string) => {
  if (cmd === 'excelAll') exportExcel('all');
  else if (cmd === 'excelResult') exportExcel('result');
  else if (cmd === 'csv') exportCsv();
};

// ===================== 查找 / 替换 =====================
const findVisible = ref(false);
const findText = ref('');
const replaceText = ref('');
const findScope = ref<'all' | 'col'>('all');
const findCase = ref(false);
const findWhole = ref(false);
const findMatches = ref<{ rowId: string; field: string }[]>([]);
const findMatchKeys = ref<Set<string>>(new Set());
const findIdx = ref(0);

const computeFindMatches = () => {
  const q = findCase.value ? findText.value : findText.value.toLowerCase();
  if (!q) { findMatches.value = []; findMatchKeys.value = new Set(); return; }
  const fields = findScope.value === 'col' && currentCell.value ? [currentCell.value.field] : visibleDefs.value.map((d) => d.field);
  const list: { rowId: string; field: string }[] = [];
  for (const r of processedRows.value) {
    for (const f of fields) {
      const raw = String(r[f] ?? '');
      const tgt = findCase.value ? raw : raw.toLowerCase();
      const hit = findWhole.value ? tgt === q : tgt.includes(q);
      if (hit) list.push({ rowId: r.__id, field: f });
    }
  }
  findMatches.value = list;
  findMatchKeys.value = new Set(list.map((m) => errKey(m.rowId, m.field)));
  findIdx.value = 0;
};
watch([findText, findScope, findCase, findWhole], computeFindMatches, { immediate: true });

const jumpToMatch = (m: { rowId: string; field: string }) => {
  const row = allRows.value.find((r) => r.__id === m.rowId);
  if (!row) return;
  nextTick(() => {
    tableRef.value?.scrollToRow?.(row);
    tableRef.value?.scrollToColumn?.(m.field);
    tableRef.value?.setActiveCell?.(row, m.field);
    currentCell.value = { row, field: m.field };
  });
};
const findNext = () => {
  if (!findMatches.value.length) { ElMessage.info('未找到匹配项'); return; }
  findIdx.value = (findIdx.value + 1) % findMatches.value.length;
  jumpToMatch(findMatches.value[findIdx.value]);
};
const replaceOne = () => {
  if (!findMatches.value.length) return;
  const m = findMatches.value[findIdx.value];
  const row = allRows.value.find((r) => r.__id === m.rowId);
  if (!row) return;
  pushSnapshot({ rows: cloneRows(allRows.value), defs: cloneDefs() });
  row[m.field] = replaceText.value;
  row.__dirty = true;
  validateCell(row, m.field);
  // 重新计算匹配（替换后当前项可能不再命中）
  computeFindMatches();
  ElMessage.success('已替换 1 处');
};
const replaceAll = () => {
  if (!findMatches.value.length) { ElMessage.info('未找到匹配项'); return; }
  pushSnapshot({ rows: cloneRows(allRows.value), defs: cloneDefs() });
  const map = new Map(findMatches.value.map((m) => [m.rowId, m.field]));
  let n = 0;
  for (const r of allRows.value) {
    const f = map.get(r.__id);
    if (f) { r[f] = replaceText.value; r.__dirty = true; validateCell(r, f); n++; }
  }
  computeFindMatches();
  ElMessage.success(`已替换 ${n} 处`);
};

// ===================== 校验面板跳转 =====================
const errDrawer = ref(false);
const errorList = computed(() =>
  Object.entries(cellErrors).map(([k, msg]) => {
    const [rowId, field] = k.split('__');
    const row = allRows.value.find((r) => r.__id === rowId);
    return { rowId, field, msg, rowLabel: row ? String(row[visibleDefs.value[0]?.field ?? 'name'] ?? '') : '?', colLabel: labelOf(field) };
  }),
);
const jumpToError = (e: { rowId: string; field: string }) => {
  const row = allRows.value.find((r) => r.__id === e.rowId);
  if (!row) return;
  errDrawer.value = false;
  nextTick(() => {
    tableRef.value?.scrollToRow?.(row);
    tableRef.value?.scrollToColumn?.(e.field);
    tableRef.value?.setActiveCell?.(row, e.field);
    currentCell.value = { row, field: e.field };
  });
};

// ===================== 压测数据生成 =====================
const lastGen = ref('');
// 预制真实感示例数据
const presetData = (n = 500) => {
  pushSnapshot({ rows: cloneRows(allRows.value), defs: cloneDefs() });
  allRows.value = genSampleRows(n);
  searchText.value = '';
  Object.keys(columnFilters).forEach((k) => delete columnFilters[k]);
  sortList.value = [];
  for (const k of Object.keys(cellErrors)) delete cellErrors[k];
  lastGen.value = `预制 ${n.toLocaleString()} 行示例数据`;
  ElMessage.success(lastGen.value);
};
const genData = (n: number) => {
  pushSnapshot({ rows: cloneRows(allRows.value), defs: cloneDefs() });
  const t0 = performance.now();
  const FIRST = ['张', '李', '王', '赵', '钱', '孙', '周', '吴', '郑', '冯'];
  const LAST = ['伟', '芳', '娜', '敏', '静', '强', '磊', '军', '洋', '勇'];
  const arr: Row[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const row: any = { __id: uid(), __dirty: false };
    for (const d of columnDefs.value) {
      switch (d.field) {
        case 'name': row.name = FIRST[i % 10] + LAST[(i * 7) % 10]; break;
        case 'age': row.age = 18 + (i % 48); break;
        case 'department': row.department = DEPARTMENTS[i % DEPARTMENTS.length]; break;
        case 'joinDate': row.joinDate = `20${20 + (i % 6)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`; break;
        case 'email': row.email = `user${i}@example.com`; break;
        case 'status': row.status = STATUSES[i % STATUSES.length]; break;
        case 'remark': row.remark = ''; break;
        default: row[d.field] = d.type === 'number' ? null : d.type === 'select' ? (d.options?.[0] ?? '') : '';
      }
    }
    arr[i] = row;
  }
  allRows.value = arr;
  searchText.value = '';
  Object.keys(columnFilters).forEach((k) => delete columnFilters[k]);
  sortList.value = [];
  for (const k of Object.keys(cellErrors)) delete cellErrors[k];
  const dt = (performance.now() - t0).toFixed(0);
  lastGen.value = `生成 ${n.toLocaleString()} 行 · ${dt}ms`;
  ElMessage.success(lastGen.value);
};

// ===================== 提交 =====================
const submit = async () => {
  revalidateAll();
  if (errorCount.value > 0) { ElMessage.error(`有 ${errorCount.value} 处校验未通过，请先修正标红单元格`); errDrawer.value = true; return; }
  if (!allRows.value.length) { ElMessage.warning('没有可提交的数据'); return; }
  submitting.value = true;
  try {
    const payload = allRows.value.map((r) => {
      const o: Record<string, any> = {};
      for (const d of columnDefs.value) o[d.field] = r[d.field];
      return o;
    });
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    allRows.value.forEach((r) => (r.__dirty = false));
    ElMessage.success(`已提交 ${payload.length} 条记录（mock）`);
  } finally {
    submitting.value = false;
  }
};

// ===================== 复制 / 粘贴（原生监听） =====================
const cellToStr = (v: any) => (v === null || v === undefined ? '' : String(v));
const onGridCopy = (e: ClipboardEvent) => {
  let tsv = '';
  try {
    const areas = tableRef.value?.getCellAreas?.() ?? [];
    if (areas?.length && areas[0].rows?.length) {
      const area = areas[0];
      const cols = (area.cols ?? []).map((c: any) => c.field).filter(Boolean);
      tsv = area.rows.map((r: any) => cols.map((f: string) => cellToStr(r[f])).join('\t')).join('\n');
    }
  } catch { /* 区域读取失败则走下方兜底 */ }
  if (!tsv) {
    const checked = tableRef.value?.getCheckboxRecords?.() ?? [];
    const visFields = visibleDefs.value.map((d) => d.field);
    if (checked.length) tsv = checked.map((r: Row) => visFields.map((f) => cellToStr(r[f])).join('\t')).join('\n');
    else if (currentCell.value) tsv = cellToStr(currentCell.value.row[currentCell.value.field]);
  }
  if (tsv) { e.preventDefault(); e.clipboardData?.setData('text/plain', tsv); ElMessage.success('已复制到剪贴板'); }
};
const onGridPaste = (e: ClipboardEvent) => {
  const text = e.clipboardData?.getData('text') ?? '';
  if (!text) return;
  e.preventDefault();
  const rowsText = text.replace(/\r/g, '').split('\n').filter((l) => l.length);
  if (!rowsText.length) return;
  const grid = rowsText.map((r) => r.split('\t'));
  const visFields = visibleDefs.value.map((d) => d.field);
  let startIdx = currentCell.value ? processedRows.value.findIndex((r) => r.__id === currentCell.value!.row.__id) : 0;
  if (startIdx < 0) startIdx = 0;
  let startCol = currentCell.value ? visFields.indexOf(currentCell.value.field) : 0;
  if (startCol < 0) startCol = 0;
  pushSnapshot({ rows: cloneRows(allRows.value), defs: cloneDefs() });
  const targets: Row[] = [];
  for (let i = 0; i < grid.length; i++) {
    let r = processedRows.value[startIdx + i];
    if (!r) { r = makeRow(); allRows.value.push(r); }
    targets.push(r);
    for (let j = 0; j < grid[i].length; j++) {
      const f = visFields[startCol + j];
      if (!f) break;
      const def = columnDefs.value.find((d) => d.field === f);
      let val: any = grid[i][j];
      if (def?.type === 'number') val = val === '' ? null : Number(val);
      r[f] = val;
      r.__dirty = true;
      validateCell(r, f);
    }
  }
  ElMessage.success(`已粘贴 ${grid.length} 行 × ${grid[0].length} 列`);
};

// ===================== 快捷键 =====================
const onKeydown = (e: KeyboardEvent) => {
  const ae = document.activeElement;
  const tag = (ae?.tagName || '').toLowerCase();
  const inField = tag === 'input' || tag === 'textarea' || tag === 'select';
  const inGrid = gridWrapper.value?.contains(ae as Node) ?? false;
  if (!inGrid) return;
  const mod = e.ctrlKey || e.metaKey;
  const key = e.key.toLowerCase();
  if (mod && key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
  else if (mod && key === 'y') { e.preventDefault(); redo(); }
  else if (mod && key === 'f') { e.preventDefault(); findVisible.value = true; }
  else if (mod && key === 'd') { e.preventDefault(); duplicateSelected(); }
};

onMounted(() => {
  revalidateAll();
  nextTick(applyColumns);
  nextTick(syncGridHeight);
  if (typeof ResizeObserver !== 'undefined' && gridBox.value) {
    gridRO = new ResizeObserver(() => syncGridHeight());
    gridRO.observe(gridBox.value);
  }
  gridWrapper.value?.addEventListener('copy', onGridCopy as any);
  gridWrapper.value?.addEventListener('paste', onGridPaste as any);
  window.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
  gridRO?.disconnect();
  gridRO = null;
  gridWrapper.value?.removeEventListener('copy', onGridCopy as any);
  gridWrapper.value?.removeEventListener('paste', onGridPaste as any);
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style lang="less" scoped>
.dt-page {
  --dt-primary: #3b5bdb;
  --dt-primary-soft: #edf0ff;
  --dt-border: #e6e8ee;
  --dt-header-bg: #f7f8fb;
  --dt-text: #1f2329;
  --dt-sub: #8a909c;
  --dt-danger: #f53f3f;
  --dt-warn: #ff9a2e;
  --dt-ok: #00b42a;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 14px 16px 16px;
  box-sizing: border-box;
  background: #f2f3f5;
  font-family: -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
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

.dt-stats { display: flex; gap: 8px; flex-wrap: wrap; }
.stat-pill {
  background: #fff; border: 1px solid var(--dt-border); border-radius: 999px;
  padding: 4px 12px; font-size: 12px; color: var(--dt-sub);
}
.stat-pill b { color: var(--dt-text); margin-right: 2px; }
.stat-pill.warn b { color: var(--dt-warn); }
.stat-pill.danger b { color: var(--dt-danger); }
.stat-pill.ok b { color: var(--dt-ok); }
.stat-pill.info { color: var(--dt-primary); border-color: #c5cdf7; background: var(--dt-primary-soft); }

.dt-toolbar, .dt-findbar, .dt-fillbar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  background: #fff; border: 1px solid var(--dt-border); border-radius: 10px;
  padding: 8px 10px; margin-bottom: 10px;
}
.dt-toolbar { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); }
.tb-group { display: flex; align-items: center; gap: 6px; }
.gen-label { font-size: 12px; color: var(--dt-sub); }

.dt-findbar, .dt-fillbar { font-size: 13px; color: var(--dt-sub); }
.find-count { margin-left: auto; font-size: 12px; color: var(--dt-primary); }

.dt-grid {
  flex: 1;
  min-height: 320px;
  border: 1px solid var(--dt-border);
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.dt-pager { margin-top: 10px; display: flex; justify-content: flex-end; }

/* 表格视觉美化 */
:deep(.vxe-table) {
  font-size: 13px;
  color: var(--dt-text);
}
:deep(.vxe-table .vxe-header--column) {
  background: var(--dt-header-bg);
  font-weight: 600;
  color: #4e5969;
}
:deep(.vxe-table .vxe-body--row:hover) { background: #fafbff; }
:deep(.vxe-table .vxe-body--row.row-dirty) { box-shadow: inset 3px 0 0 var(--dt-warn); }
:deep(.vxe-table .vxe-body--column.cell-error) { background-color: #ffece8 !important; }
:deep(.vxe-table .vxe-body--column.cell-error .vxe-cell) { color: var(--dt-danger); }
:deep(.vxe-table .vxe-body--column.cell-found) { background-color: #fff7d6 !important; }
:deep(.vxe-table .vxe-cell--checkbox), :deep(.vxe-table .vxe-cell--radio) { display: flex; }
/* 当前单元格描边 */
:deep(.vxe-table .vxe-body--column.col--current) { box-shadow: inset 0 0 0 2px var(--dt-primary); }
/* 冻结列阴影 */
:deep(.vxe-table .fixed-left--wrapper) { box-shadow: 4px 0 8px -4px rgba(0, 0, 0, 0.12); }
:deep(.dt-col-req .vxe-header--column, .vxe-table .vxe-header--column.dt-col-req) { position: relative; }
:deep(.vxe-table .vxe-header--column.dt-col-req .vxe-cell::after) {
  content: '*'; color: var(--dt-danger); margin-left: 2px;
}
.dt-edit-native { font-size: 13px; }

/* 列设置 */
.col-set-tip { font-size: 12px; color: var(--dt-sub); margin-bottom: 10px; }
.col-set-list { display: flex; flex-direction: column; gap: 8px; }
.col-set-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px; border: 1px solid var(--dt-border); border-radius: 8px; background: #fafbfc;
}
.col-order { display: flex; flex-direction: column; }
.col-label { flex: 1; }

/* 校验面板 */
.err-list { display: flex; flex-direction: column; gap: 8px; }
.err-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px; border: 1px solid #ffd6d6; border-radius: 8px;
  background: #fff5f5; cursor: pointer; transition: all .15s;
}
.err-item:hover { border-color: var(--dt-danger); background: #ffece8; }
.err-idx { font-weight: 700; color: var(--dt-danger); }
.err-field { font-size: 13px; color: var(--dt-text); font-weight: 600; }
.err-msg { font-size: 12px; color: #d4380d; }
</style>
