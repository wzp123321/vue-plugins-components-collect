<template>
  <div class="excel-entry-page">
    <h5>网页端 Excel 数据录入（AG Grid Community）</h5>
    <el-alert type="info" :closable="false" style="margin-bottom: 10px">
      <template #title>
        类 Excel 录入：单击单元格即编辑、回车进入下一行、Tab 右移（方向键也可移动）；点单元格不再选中整行，行选择用左侧勾选框；顶部搜索框可按任意列快速过滤；列支持排序 / 筛选 / 浮动筛选 / 拖拽 / 调整宽度 / 固定；可新增自定义列、导入导出 Excel / CSV、分页浏览、批量提交（mock）。
        标红单元格为校验未通过，悬停看原因；左侧橙条表示已改动（脏）行。
        <br /><span style="color:#e6a23c">提示：AG Grid 社区版不支持单元格区域框选 / 拖拽填充（需企业版）；如需真正的 Excel 单元格交互，请使用 vxe-table 版录入台。</span>
      </template>
    </el-alert>

    <div class="toolbar">
      <el-button-group>
        <el-button type="primary" size="small" @click="addRow">＋ 新增</el-button>
        <el-button type="success" size="small" @click="submit" :loading="submitting">💾 提交</el-button>
      </el-button-group>
      <el-input v-model="quickFilterText" size="small" placeholder="搜索…" clearable style="width: 160px">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-dropdown trigger="click" @command="onToolbarCommand">
        <el-button size="small">更多 ▾</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="delete" :disabled="!hasSelection">－ 删除选中</el-dropdown-item>
            <el-dropdown-item command="import">⬆ 导入Excel</el-dropdown-item>
            <el-dropdown-item command="exportExcel">⬇ 导出Excel</el-dropdown-item>
            <el-dropdown-item command="exportCsv">⬇ 导出 CSV</el-dropdown-item>
            <el-dropdown-item command="addCol" divided>＋ 新增列</el-dropdown-item>
            <el-dropdown-item command="manageCol" :disabled="!customColumns.length">管理自定义列</el-dropdown-item>
            <el-dropdown-item command="clear" divided>清空数据</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <input ref="fileInputRef" type="file" accept=".xlsx,.xls" style="display: none" @change="onFileChange" />
      <span class="stat">共 {{ rowData.length }} 行 · 脏 {{ dirtyCount }} · 错 {{ errorCount }}</span>
    </div>

    <!-- 主题类必须挂在网格的祖先元素上：AG Grid 会从网格根元素向上遍历读取 ag-theme-*，
         并把主题类复制到弹层（下拉编辑器 / 筛选面板）。挂在组件标签上不会被透传，主题会整块失效。 -->
    <div class="grid-wrap ag-theme-quartz">
      <AgGridVue
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :rowData="rowData"
        :getRowId="getRowId"
        :rowSelection="rowSelection"
        :rowClassRules="rowClassRules"
        :quickFilterText="quickFilterText"
        :enableCellTextSelection="true"
        :stopEditingWhenCellsLoseFocus="true"
        :singleClickEdit="true"
        :enterNavigatesVertically="true"
        :enterNavigatesVerticallyAfterEdit="true"
        :animateRows="true"
        :pagination="true"
        :paginationPageSize="20"
        @grid-ready="onGridReady"
        @cell-value-changed="onCellValueChanged"
      />
    </div>

    <!-- 新增自定义列 -->
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

    <!-- 管理自定义列 -->
    <el-dialog v-model="colManageVisible" title="管理自定义列" width="420px">
      <el-empty v-if="!customColumns.length" description="暂无自定义列" />
      <el-table v-else :data="customColumns" border>
        <el-table-column prop="label" label="列名" />
        <el-table-column label="类型" width="90">
          <template #default="{ row }">{{ ({ text: '文本', number: '数字', select: '下拉', date: '日期' } as Record<string, string>)[row.type] }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button type="danger" link @click="removeCol(row.field)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { AgGridVue } from 'ag-grid-vue3';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  CellValueChangedEvent,
  CellClassParams,
  ValueGetterParams,
  RowClassParams,
} from 'ag-grid-community';
import * as XLSX from 'xlsx';

defineOptions({ name: 'ExcelDataEntry' });

// ---------- 基础业务字段 ----------
type Row = {
  __id: string;
  __dirty: boolean;
  [key: string]: any;
};

const BASE_FIELDS = ['name', 'age', 'department', 'joinDate', 'email', 'status', 'remark'] as const;
type BaseField = (typeof BASE_FIELDS)[number];

const FIELD_LABEL: Record<string, string> = {
  name: '姓名',
  age: '年龄',
  department: '部门',
  joinDate: '入职日期',
  email: '邮箱',
  status: '状态',
  remark: '备注',
};

// ---------- 自定义列元信息 ----------
type ColType = 'text' | 'number' | 'select' | 'date';
interface CustomColMeta {
  field: string;
  label: string;
  type: ColType;
  options?: string[];
  required?: boolean;
}
const customColumns = ref<CustomColMeta[]>([]);
const colSeq = { n: 0 };

const allFields = computed<string[]>(() => [
  ...(BASE_FIELDS as readonly string[]),
  ...customColumns.value.map((c) => c.field),
]);

// ---------- 行工厂 ----------
let seq = 0;
const uid = () => `row_${Date.now()}_${seq++}`;
const makeRow = (init: Record<string, any> = {}): Row => {
  const row: Row = { __id: uid(), __dirty: false, ...init };
  for (const f of BASE_FIELDS) {
    if (!(f in row)) row[f] = f === 'age' ? null : f === 'status' ? '在职' : f === 'department' ? null : '';
  }
  for (const c of customColumns.value) {
    if (!(c.field in row)) row[c.field] = c.type === 'number' ? null : c.type === 'select' ? (c.options?.[0] ?? '') : '';
  }
  return row;
};

// 内置示例数据（开箱即有内容）
const rowData = ref<Row[]>([
  makeRow({ name: '张三', age: 28, department: '研发', joinDate: '2023-04-01', email: 'zhangsan@example.com', status: '在职' }),
  makeRow({ name: '李四', age: 32, department: '市场', joinDate: '2022-09-15', email: 'lisi@example.com', status: '试用期' }),
  makeRow({ name: '王五', age: 25, department: '财务', joinDate: '2024-01-10', email: 'wangwu@example.com', status: '在职' }),
  makeRow({ name: '赵六', age: 41, department: '人事', joinDate: '2020-03-22', email: 'zhaoliu@example.com', status: '在职' }),
  makeRow({ name: '钱七', age: 22, department: '运营', joinDate: '2025-07-01', email: 'qianqi@example.com', status: '试用期' }),
]);

// ---------- 校验 ----------
const cellErrors = reactive<Record<string, string>>({});
const errKey = (rowId: string, field: string) => `${rowId}__${field}`;

const validateCell = (row: Row, field: string) => {
  const key = errKey(row.__id, field);
  const value = row[field];
  let msg = '';
  const baseMsg: Partial<Record<BaseField, string>> = {
    name: !value || !String(value).trim() ? '姓名必填' : '',
    age:
      value === null || value === '' || value === undefined
        ? '年龄必填'
        : Number(value) < 18 || Number(value) > 65
          ? '年龄需在 18-65'
          : '',
    department: !value ? '请选择部门' : '',
    joinDate: !value ? '请选择入职日期' : '',
    email: value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value)) ? '邮箱格式不正确' : '',
    status: !value ? '请选择状态' : '',
  };
  if (field in baseMsg) {
    msg = baseMsg[field as BaseField] ?? '';
  } else if (customColumns.value.some((c) => c.field === field)) {
    const meta = customColumns.value.find((c) => c.field === field)!;
    if (meta.required && (value === null || value === undefined || value === '')) msg = `${meta.label}必填`;
  }
  if (msg) cellErrors[key] = msg;
  else delete cellErrors[key];
};

const validateAll = () => {
  for (const k of Object.keys(cellErrors)) delete cellErrors[k];
  for (const row of rowData.value) for (const f of allFields.value) validateCell(row, f);
};

const validateRow = (row: Row) => {
  for (const f of allFields.value) validateCell(row, f);
};

const errorCount = computed(() => Object.keys(cellErrors).length);
const dirtyCount = computed(() => rowData.value.filter((r) => r.__dirty).length);
const hasSelection = computed(() => (gridApi?.getSelectedRows().length ?? 0) > 0);

const makeErrorRules = (field: string) => ({
  'cell-error': (p: CellClassParams) => !!(p.data && cellErrors[errKey((p.data as Row).__id, field)]),
});

// ---------- 列定义 ----------
const baseColDef = (field: string, headerName: string, editor: Partial<ColDef>, extra: Partial<ColDef> = {}): ColDef<Row> => ({
  headerName,
  field,
  editable: true,
  cellClassRules: makeErrorRules(field),
  tooltipValueGetter: (p: any) => (p.data ? cellErrors[errKey(p.data.__id, field)] || null : null),
  ...editor,
  ...extra,
});

const buildColumnDefs = (): ColDef<Row>[] => {
  const cols: ColDef<Row>[] = [
    {
      headerName: '#',
      width: 56,
      pinned: 'left',
      editable: false,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      valueGetter: (p: ValueGetterParams) => (p.node?.rowIndex != null ? p.node.rowIndex + 1 : ''),
    },
    baseColDef('name', '姓名', { cellEditor: 'agTextCellEditor' }),
    baseColDef('age', '年龄', { cellEditor: 'agNumberCellEditor' }),
    baseColDef('department', '部门', {
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['研发', '市场', '财务', '人事', '运营'] },
    }),
    baseColDef('joinDate', '入职日期', {
      cellEditor: 'agDateStringCellEditor',
      cellEditorParams: { min: '2000-01-01' },
    }),
    baseColDef('email', '邮箱', { cellEditor: 'agTextCellEditor' }),
    baseColDef('status', '状态', {
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['在职', '试用期', '离职'] },
    }),
    baseColDef('remark', '备注', { cellEditor: 'agTextCellEditor' }),
  ];
  for (const c of customColumns.value) {
    const editor: Partial<ColDef> =
      c.type === 'number'
        ? { cellEditor: 'agNumberCellEditor' }
        : c.type === 'select'
          ? { cellEditor: 'agSelectCellEditor', cellEditorParams: { values: c.options ?? [] } }
          : c.type === 'date'
            ? { cellEditor: 'agDateStringCellEditor' }
            : { cellEditor: 'agTextCellEditor' };
    cols.push(baseColDef(c.field, c.label, editor));
  }
  return cols;
};

const columnDefs = ref<ColDef<Row>[]>(buildColumnDefs());

const defaultColDef: ColDef = {
  flex: 1,
  minWidth: 110,
  resizable: true,
  sortable: true,
  filter: true,
  floatingFilter: true,
};

// v32.2 新对象式选行 API：multiRow 多选 + 关闭「点单元格即选中整行」（修复点击整行高亮）
const rowSelection = {
  mode: 'multiRow' as const,
  enableClickSelection: false,
};
const rowClassRules = {
  'row-dirty': (p: RowClassParams) => !!(p.data as Row | undefined)?.__dirty,
};

const getRowId = (params: any) => params.data.__id;

const quickFilterText = ref('');

// ---------- 表格实例 ----------
let gridApi: GridApi<Row> | null = null;
const fileInputRef = ref<HTMLInputElement>();
const importing = ref(false);
const submitting = ref(false);

const onGridReady = (e: GridReadyEvent) => {
  gridApi = e.api;
};

const onCellValueChanged = (e: CellValueChangedEvent<Row>) => {
  const row = e.data;
  if (!row) return;
  row.__dirty = true;
  if (e.colDef.field) validateCell(row, e.colDef.field);
  gridApi?.refreshCells({ force: true });
};

// ---------- 工具栏：行增删（事务 API，最稳） ----------
const addRow = () => {
  const row = makeRow();
  row.__dirty = true;
  rowData.value.push(row); // 更新数据源（统计 / 提交用）
  gridApi?.applyTransaction({ add: [row] }); // 显式推给网格，避免 immutable 模式下的响应式盲区
  gridApi?.ensureIndexVisible(rowData.value.length - 1, 'bottom');
};

const deleteSelected = () => {
  const selected = gridApi?.getSelectedRows() ?? [];
  if (!selected.length) return;
  const ids = new Set(selected.map((r) => r.__id));
  rowData.value = rowData.value.filter((r) => !ids.has(r.__id));
  gridApi?.applyTransaction({ remove: selected });
  ElMessage.success(`已删除 ${selected.length} 行`);
};

const clearAll = () => {
  const all = [...rowData.value];
  rowData.value = [];
  gridApi?.applyTransaction({ remove: all });
  for (const k of Object.keys(cellErrors)) delete cellErrors[k];
};

// 工具栏「更多」下拉分发
const onToolbarCommand = (cmd: string) => {
  if (cmd === 'addCol') openAddCol();
  else if (cmd === 'manageCol') colManageVisible.value = true;
  else if (cmd === 'exportCsv') exportCsv();
  else if (cmd === 'clear') clearAll();
  else if (cmd === 'delete') deleteSelected();
  else if (cmd === 'import') importExcel();
  else if (cmd === 'exportExcel') exportExcel();
};

// ---------- 工具栏：自定义列 ----------
const colDialogVisible = ref(false);
const colManageVisible = ref(false);
const colForm = reactive({ name: '', type: 'text' as ColType, options: '', required: false });

const openAddCol = () => {
  colForm.name = '';
  colForm.type = 'text';
  colForm.options = '';
  colForm.required = false;
  colDialogVisible.value = true;
};

const confirmAddCol = () => {
  const name = colForm.name.trim();
  if (!name) {
    ElMessage.warning('请输入列名');
    return;
  }
  const field = `col_${++colSeq.n}_${Date.now()}`;
  const options =
    colForm.type === 'select' ? colForm.options.split(/[,，]/).map((s) => s.trim()).filter(Boolean) : undefined;
  const meta: CustomColMeta = { field, label: name, type: colForm.type, options, required: colForm.required };
  customColumns.value.push(meta);
  // 已有行补默认值（不标记脏）
  for (const r of rowData.value) {
    r[field] = colForm.type === 'number' ? null : colForm.type === 'select' ? (options?.[0] ?? '') : '';
  }
  columnDefs.value = buildColumnDefs();
  gridApi?.setGridOption('columnDefs', columnDefs.value);
  colDialogVisible.value = false;
  ElMessage.success(`已新增列「${name}」`);
};

const removeCol = (field: string) => {
  customColumns.value = customColumns.value.filter((c) => c.field !== field);
  for (const r of rowData.value) delete r[field];
  for (const k of Object.keys(cellErrors)) if (k.endsWith(`__${field}`)) delete cellErrors[k];
  columnDefs.value = buildColumnDefs();
  gridApi?.setGridOption('columnDefs', columnDefs.value);
  ElMessage.success('已删除该列');
};

// ---------- 导出 / 导入 ----------
const labelOf = (f: string) => FIELD_LABEL[f] ?? customColumns.value.find((c) => c.field === f)?.label ?? f;

const exportExcel = () => {
  const exportRows = rowData.value.map((r) => {
    const o: Record<string, any> = {};
    for (const f of allFields.value) o[labelOf(f)] = r[f];
    return o;
  });
  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '录入数据');
  XLSX.writeFile(wb, '数据录入.xlsx');
};

const exportCsv = () => gridApi?.exportDataAsCsv({ fileName: '数据录入.csv' });

const importExcel = () => fileInputRef.value?.click();

const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  importing.value = true;
  try {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
    const labelField: Record<string, string> = {};
    for (const f of allFields.value) {
      const lbl = labelOf(f);
      labelField[lbl] = f;
    }
    const rows = json.map((r) => {
      const row = makeRow();
      row.__dirty = true;
      for (const cn of Object.keys(r)) {
        const f = labelField[cn];
        if (f) row[f] = r[cn];
      }
      validateRow(row);
      return row;
    });
    rowData.value = rows;
    gridApi?.setGridOption('rowData', rows);
    ElMessage.success(`已导入 ${rows.length} 行`);
  } catch (err) {
    ElMessage.error('导入失败：' + (err as Error).message);
  } finally {
    importing.value = false;
    input.value = '';
  }
};

// ---------- 批量提交（mock 后端） ----------
const cleanRows = () =>
  rowData.value.map((r) => {
    const o: Record<string, any> = {};
    for (const f of allFields.value) o[f] = r[f];
    return o;
  });

const mockSave = (_rows: Record<string, any>[]) => new Promise<void>((resolve) => setTimeout(() => resolve(), 800));

const submit = async () => {
  validateAll();
  gridApi?.refreshCells({ force: true });
  if (errorCount.value > 0) {
    ElMessage.error(`有 ${errorCount.value} 处校验未通过，请修正标红单元格后再提交`);
    return;
  }
  if (!rowData.value.length) {
    ElMessage.warning('没有可提交的数据');
    return;
  }
  submitting.value = true;
  try {
    const payload = cleanRows();
    await mockSave(payload);
    // 生产：await axios.post('/api/rows/batch', payload)
    rowData.value.forEach((r) => (r.__dirty = false));
    gridApi?.refreshCells({ force: true });
    ElMessage.success(`已提交 ${payload.length} 条记录（mock）`);
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="less" scoped>
.excel-entry-page {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  // 单行排布，空间不够时横向滚动，避免换行吃掉表格纵向空间
  flex-wrap: nowrap;
  overflow-x: auto;

  .stat {
    margin-left: auto;
    font-size: 12px;
    color: #909399;
    white-space: nowrap;
  }
}

.grid-wrap {
  // 关键：ag-grid-vue3 会在网格外再套一层 div（高度 auto），
  // 用单格 grid 让这层中间 div 默认被拉伸，百分比高度链才接得上；
  // 同时靠 flex:1 占满工具栏/提示以外的全部剩余高度（不再写死 calc）。
  flex: 1 1 auto;
  min-height: 320px;
  display: grid;
}

:deep(.cell-error) {
  background-color: #fde2e2 !important;
}

:deep(.row-dirty) {
  box-shadow: inset 3px 0 0 #e6a23c;
}
</style>
