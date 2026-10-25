<template>
  <div class="jss-page">
    <!-- ===== 顶部 Hero 横幅 ===== -->
    <div class="jss-hero">
      <div class="jss-hero-info">
        <h2 class="jss-hero-title">Jspreadsheet CE 电子表格</h2>
        <p class="jss-hero-desc">
          4 个工作表覆盖列类型 / 嵌套表头 / 合并冻结 / 公式排序 / 分页过滤，配合 5 组 API 演示按钮与实时事件日志
        </p>
        <div class="jss-hero-tags">
          <span class="jss-hero-tag">当前 Sheet：{{ currentSheetName }}</span>
          <span class="jss-hero-tag">共 {{ worksheets.length }} 个 Sheet</span>
        </div>
      </div>
      <div class="jss-hero-actions">
        <el-switch v-model="logEnabled" size="small" active-text="记录事件" inactive-text="暂停记录" />
        <el-button size="small" round @click="clearLog">清空日志</el-button>
      </div>
    </div>

    <!-- ===== 功能操作卡片 ===== -->
    <div class="jss-features">
      <div class="jss-card" v-for="card in featureCards" :key="card.name" :style="{ '--accent': card.color }">
        <div class="jss-card-head">
          <span class="jss-card-icon" :class="'is-' + card.name">
            <el-icon :size="20"><component :is="card.icon" /></el-icon>
          </span>
          <div class="jss-card-title-wrap">
            <h3 class="jss-card-title">{{ card.title }}</h3>
            <p class="jss-card-desc">{{ card.desc }}</p>
          </div>
        </div>
        <div class="jss-btn-group">
          <el-button
            v-for="btn in card.buttons"
            :key="btn.label"
            size="small"
            plain
            :type="btn.type"
            @click="btn.handler"
          >
            {{ btn.label }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- ===== 电子表格卡片 ===== -->
    <div class="jss-sheet-card">
      <div class="jss-sheet-head">
        <div class="jss-sheet-title-wrap">
          <span class="jss-sheet-dot"></span>
          <span class="jss-sheet-title">电子表格演示区</span>
          <span class="jss-sheet-sub">表头可双击重命名、点击页签可切换工作表</span>
        </div>
        <el-tag size="small" effect="plain" type="success">{{ currentSheetName }}</el-tag>
      </div>
      <div class="jss-sheet-body">
        <div ref="spreadRef" class="jss-spreadsheet"></div>
      </div>
    </div>

    <!-- ===== 事件日志终端 ===== -->
    <div class="jss-console">
      <div class="jss-console-head">
        <span class="jss-console-dot is-red"></span>
        <span class="jss-console-dot is-yellow"></span>
        <span class="jss-console-dot is-green"></span>
        <span class="jss-console-title">事件日志</span>
        <span class="jss-console-count">{{ logs.length }} 条</span>
        <span class="jss-console-hint">onchange / onselection / oninsertrow / onmerge / onsort ...</span>
      </div>
      <div ref="logRef" class="jss-console-body">
        <div v-for="(item, index) in logs" :key="index" class="jss-console-line">
          <span class="jss-console-time">{{ item.time }}</span>
          <span class="jss-console-name">{{ item.name }}</span>
          <span class="jss-console-detail">{{ item.detail }}</span>
        </div>
        <div v-if="!logs.length" class="jss-console-empty">▌等待事件触发：点击任意单元格或按钮试试…</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css';
import { saveAs } from 'file-saver';
import { DataAnalysis, Grid, MagicStick, DocumentCopy, Setting } from '@element-plus/icons-vue';

// ============ 数据准备 ============
// Sheet1：列类型大全
const typeColumns = [
  { type: 'text', title: '文本', width: 90 },
  { type: 'numeric', title: '数字(千分位)', width: 130, mask: '#,##0.00', decimal: '.' },
  { type: 'calendar', title: '日期', width: 130, options: { format: 'YYYY-MM-DD' } },
  { type: 'dropdown', title: '下拉单选', width: 100, source: ['前端组', '后端组', '测试组', '产品组'] },
  {
    type: 'dropdown',
    title: '下拉多选',
    width: 150,
    source: ['JavaScript', 'Vue', 'Java', 'Python', 'Go'],
    multiple: true,
  },
  { type: 'checkbox', title: '复选框', width: 80 },
  { type: 'radio', title: '单选框', width: 100, source: ['P1', 'P2', 'P3', 'P4'] },
  { type: 'color', title: '颜色', width: 90, render: 'square' },
  { type: 'image', title: '图片', width: 100 },
  {
    type: 'autocomplete',
    title: '自动完成',
    width: 120,
    source: ['成都', '北京', '上海', '深圳', '杭州'],
    autocomplete: true,
  },
  { type: 'html', title: 'HTML富文本', width: 140 },
  { type: 'hidden', title: '隐藏列(工号)' },
  { type: 'text', title: '只读列', width: 90, readOnly: true },
  {
    title: '自定义渲染',
    width: 110,
    render(cell, value) {
      const colorMap = { 优秀: '#67c23a', 良好: '#409eff', 一般: '#e6a23c' };
      if (colorMap[value]) {
        cell.style.backgroundColor = colorMap[value];
        cell.style.color = '#fff';
        cell.style.fontWeight = 'bold';
      }
    },
  },
];

const typeData = [
  [
    '张三',
    8500,
    '2021-03-15',
    '前端组',
    'JavaScript,Vue',
    true,
    'P3',
    '#409EFF',
    '/src/assets/images/g6/g6-emperor.jpg',
    '成都',
    '<b>前端工程师</b>',
    'JS001',
    '系统账号',
    '优秀',
  ],
  [
    '李四',
    9600,
    '2020-07-01',
    '后端组',
    'Java,Spring',
    true,
    'P4',
    '#67C23A',
    '/src/assets/images/g6/g6-card-background.svg',
    '北京',
    '<i>后端架构师</i>',
    'JS002',
    '系统账号',
    '良好',
  ],
  [
    '王五',
    7200,
    '2022-01-10',
    '测试组',
    'Python',
    false,
    'P2',
    '#E6A23C',
    '/src/assets/images/common/common-menu-action.png',
    '上海',
    '<u>测试工程师</u>',
    'JS003',
    '系统账号',
    '一般',
  ],
  [
    '赵六',
    11000,
    '2019-11-20',
    '产品组',
    'Go',
    true,
    'P4',
    '#F56C6C',
    '/src/assets/images/g6/g6-emperor.jpg',
    '深圳',
    '<b>产品经理</b>',
    'JS004',
    '系统账号',
    '优秀',
  ],
];

// Sheet2：嵌套表头 / 合并 / 冻结 / 批注 / 样式
const styleData = [
  ['王五', '产品组', 88, 92, 85, 90],
  ['赵六', '测试组', 75, 80, 78, 82],
  ['钱七', '前端组', 95, 98, 92, 96],
  ['孙八', '后端组', 60, 65, 70, 68],
  ['周九', '产品组', 82, 79, 84, 88],
];

// Sheet3：公式 / 排序 / 页脚汇总
const formulaData = [
  ['苹果', 5, 10, '=B2*C2'],
  ['香蕉', 3, 20, '=B3*C3'],
  ['橘子', 8, 15, '=B4*C4'],
  ['葡萄', 12, 8, '=B5*C5'],
  ['西瓜', 6, 12, '=B6*C6'],
  ['芒果', 15, 5, '=B7*C7'],
  ['草莓', 20, 6, '=B8*C8'],
  ['蓝莓', 25, 4, '=B9*C9'],
];

// Sheet4：分页 / 过滤 / 搜索 / 懒加载
const deviceData = Array.from({ length: 30 }, (_, i) => [
  `设备-${String(i + 1).padStart(3, '0')}`,
  `2023-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
  ['机房A', '机房B', '机房C'][i % 3],
  i % 4 !== 0,
  ['正常', '告警', '维护'][i % 3],
]);

// ============ 初始化配置 ============
const spreadRef = ref(null);
const logRef = ref(null);
const logs = ref([]);
const logEnabled = ref(true);
let worksheets = [];
const currentSheetName = ref('');

// 事件日志
const addLog = (name, detail = '') => {
  if (!logEnabled.value) return;
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  logs.value.push({ time, name, detail: String(detail) });
  if (logs.value.length > 200) logs.value.shift();
  nextTick(() => {
    if (logRef.value) logRef.value.scrollTop = logRef.value.scrollHeight;
  });
};

const clearLog = () => {
  logs.value = [];
};

// 结果详情格式化：空值/对象/其它分别处理
const formatResult = (result) => {
  if (result === undefined || result === null) return '执行成功';
  if (typeof result === 'object') return JSON.stringify(result);
  return String(result);
};

// 通用操作封装：执行并记录结果
const op = (label, fn) => {
  try {
    const result = fn();
    const detail = formatResult(result);
    addLog('操作', `${label} => ${detail.slice(0, 120)}`);
  } catch (e) {
    addLog('操作', `${label} => 失败：${e.message}`);
  }
};

const getActiveIndex = () => spreadRef.value?.spreadsheet?.getWorksheetActive() ?? 0;
const getActiveSheet = () => worksheets[getActiveIndex()];

const refreshSheetName = () => {
  const active = worksheets[getActiveIndex()];
  currentSheetName.value = active?.options?.worksheetName || `Sheet${getActiveIndex() + 1}`;
};

// 列索引转列名
const colName = (x) => String.fromCharCode(65 + (x % 26));

// ============ 数据操作 ============
const readData = () => getActiveSheet().getData();
const resetData = () => getActiveSheet().setData(typeData);
const writeRow = () =>
  getActiveSheet().setRowData(1, [
    '新行',
    5000,
    '2023-01-01',
    '后端组',
    'Java',
    true,
    'P1',
    '#000000',
    null,
    '杭州',
    '新员工',
    'JS999',
    '系统账号',
    '良好',
  ]);
const writeColumn = () => getActiveSheet().setColumnData(0, ['甲', '乙', '丙', '丁']);

// ============ 样式操作 ============
const applyStyle = () =>
  getActiveSheet().setStyle({ A2: 'background-color: #f56c6c; color: #ffffff; font-weight: bold;' });

// ============ Sheet 操作 ============
const createWorksheet = () =>
  getActiveSheet().createWorksheet({
    worksheetName: '动态新建Sheet',
    minDimensions: [4, 4],
    data: [['动态1', '动态2', '动态3']],
    columns: [
      { type: 'text', title: '动态A' },
      { type: 'text', title: '动态B' },
      { type: 'checkbox', title: '动态C' },
    ],
  });

const switchSheet = (index) => {
  op(`openWorksheet 切换到第${index + 1}个Sheet`, () => {
    getActiveSheet().openWorksheet(index);
    refreshSheetName();
  });
};

const exportJson = () => {
  const data = getActiveSheet().getData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, `${currentSheetName.value || 'sheet'}.json`);
  addLog('操作', `导出JSON成功，共 ${data.length} 行`);
};

const toggleFullscreen = () => {
  spreadRef.value.spreadsheet.fullscreen();
  addLog('操作', '切换全屏模式');
};

// openEditor 演示：进入第2行第1列的编辑态
const openEditorDemo = () => {
  const sheet = getActiveSheet();
  const record = sheet.records.find((r) => r.x === 0 && r.y === 1);
  if (record) {
    sheet.openEditor(record.element);
    addLog('操作', 'openEditor 打开了 A2 的编辑器');
  } else {
    addLog('操作', 'openEditor 未找到目标单元格');
  }
};

// ============ 功能卡片配置 ============
const featureCards = [
  {
    name: 'data',
    icon: DataAnalysis,
    color: '#5b7cfa',
    title: '数据操作 API',
    desc: 'getData / setData / getValue / setRowData / getColumnData 等读写',
    buttons: [
      { label: 'getData', type: 'primary', handler: () => op('getData 读取全部数据', readData) },
      { label: 'setData', type: 'primary', handler: () => op('setData 重置数据', resetData) },
      {
        label: 'getValue(A2)',
        type: 'primary',
        handler: () => op('getValue 读取 A2', () => getActiveSheet().getValue('A2')),
      },
      {
        label: 'setValue(B2)',
        type: 'primary',
        handler: () => op('setValue 修改 B2', () => getActiveSheet().setValue('B2', `新值-${Date.now() % 100}`)),
      },
      {
        label: 'getRowData(1)',
        type: 'primary',
        handler: () => op('getRowData 读取第2行', () => getActiveSheet().getRowData(1)),
      },
      { label: 'setRowData(1)', type: 'primary', handler: () => op('setRowData 重写第2行', writeRow) },
      {
        label: 'getColumnData(0)',
        type: 'primary',
        handler: () => op('getColumnData 读取第1列', () => getActiveSheet().getColumnData(0)),
      },
      { label: 'setColumnData(0)', type: 'primary', handler: () => op('setColumnData 重写第1列', writeColumn) },
      {
        label: 'getDataFromRange',
        type: 'primary',
        handler: () => op('getDataFromRange 读取 A2:B4', () => getActiveSheet().getDataFromRange('A2:B4', true)),
      },
    ],
  },
  {
    name: 'rowcol',
    icon: Grid,
    color: '#f5a623',
    title: '行列操作 API',
    desc: 'insert / delete / move / hide / show 行列，undo / redo 撤销重做',
    buttons: [
      {
        label: 'insertRow',
        type: 'warning',
        handler: () => op('insertRow 末尾插入行', () => getActiveSheet().insertRow()),
      },
      {
        label: 'deleteRow(0)',
        type: 'warning',
        handler: () => op('deleteRow 删除第1行', () => getActiveSheet().deleteRow(0)),
      },
      {
        label: 'moveRow(0,2)',
        type: 'warning',
        handler: () => op('moveRow 第1行移动到第3行', () => getActiveSheet().moveRow(0, 2)),
      },
      {
        label: 'insertColumn',
        type: 'warning',
        handler: () => op('insertColumn 末尾插入列', () => getActiveSheet().insertColumn()),
      },
      {
        label: 'deleteColumn',
        type: 'warning',
        handler: () => op('deleteColumn 删除最后一列', () => getActiveSheet().deleteColumn()),
      },
      {
        label: 'moveColumn(0,2)',
        type: 'warning',
        handler: () => op('moveColumn 第1列移动到第3列', () => getActiveSheet().moveColumn(0, 2)),
      },
      {
        label: 'hideColumn(0)',
        type: 'warning',
        handler: () => op('hideColumn 隐藏第1列', () => getActiveSheet().hideColumn(0)),
      },
      {
        label: 'showColumn(0)',
        type: 'warning',
        handler: () => op('showColumn 显示第1列', () => getActiveSheet().showColumn(0)),
      },
      { label: 'undo', type: 'danger', handler: () => op('undo 撤销', () => getActiveSheet().undo()) },
      { label: 'redo', type: 'danger', handler: () => op('redo 重做', () => getActiveSheet().redo()) },
    ],
  },
  {
    name: 'style',
    icon: MagicStick,
    color: '#34c77b',
    title: '表头 / 样式 / 批注 API',
    desc: 'setHeader / setStyle / setComments / setMerge / setWidth / setHeight',
    buttons: [
      {
        label: 'setHeader(0)',
        type: 'success',
        handler: () => op('setHeader 修改表头', () => getActiveSheet().setHeader(0, `新标题-${Date.now() % 100}`)),
      },
      {
        label: 'getHeaders',
        type: 'success',
        handler: () => op('getHeaders 获取表头', () => getActiveSheet().getHeaders(true)),
      },
      { label: 'setStyle(A2)', type: 'success', handler: () => op('setStyle 设置样式', applyStyle) },
      {
        label: 'getStyle(A2)',
        type: 'success',
        handler: () => op('getStyle 获取样式', () => getActiveSheet().getStyle('A2')),
      },
      {
        label: 'setComments(A3)',
        type: 'success',
        handler: () =>
          op('setComments 设置批注', () => getActiveSheet().setComments('A3', '这是通过 setComments 设置的批注')),
      },
      {
        label: 'getComments(A3)',
        type: 'success',
        handler: () => op('getComments 获取批注', () => getActiveSheet().getComments('A3')),
      },
      {
        label: 'setMerge(选中)',
        type: 'success',
        handler: () => op('setMerge 合并选中单元格', () => getActiveSheet().setMerge()),
      },
      {
        label: 'destroyMerge',
        type: 'success',
        handler: () => op('destroyMerge 取消所有合并', () => getActiveSheet().destroyMerge()),
      },
      {
        label: 'setWidth(0,200)',
        type: 'success',
        handler: () => op('setWidth 设置列宽', () => getActiveSheet().setWidth(0, 200)),
      },
      {
        label: 'setHeight(0,40)',
        type: 'success',
        handler: () => op('setHeight 设置行高', () => getActiveSheet().setHeight(0, 40)),
      },
    ],
  },
  {
    name: 'sheet',
    icon: DocumentCopy,
    color: '#a855f7',
    title: 'Sheet 与导入导出',
    desc: 'createWorksheet / deleteWorksheet / openWorksheet / CSV、JSON 导出 / 全屏',
    buttons: [
      { label: 'createWorksheet', type: 'info', handler: () => op('createWorksheet 新建Sheet', createWorksheet) },
      {
        label: 'deleteWorksheet',
        type: 'info',
        handler: () => op('deleteWorksheet 删除当前Sheet', () => getActiveSheet().deleteWorksheet(getActiveIndex())),
      },
      { label: '切到Sheet1', type: 'info', handler: () => switchSheet(0) },
      { label: '切到Sheet2', type: 'info', handler: () => switchSheet(1) },
      { label: '切到Sheet3', type: 'info', handler: () => switchSheet(2) },
      { label: '切到Sheet4', type: 'info', handler: () => switchSheet(3) },
      { label: '导出CSV', type: 'info', handler: () => op('download 导出CSV', () => getActiveSheet().download(true)) },
      { label: '导出JSON', type: 'info', handler: exportJson },
      { label: '全屏', type: 'info', handler: toggleFullscreen },
    ],
  },
  {
    name: 'other',
    icon: Setting,
    color: '#f56c6c',
    title: '其它 API',
    desc: 'orderBy 排序 / page 翻页 / openFilter / 选区 / executeFormula / openEditor',
    buttons: [
      {
        label: 'orderBy排序',
        type: 'danger',
        handler: () => op('orderBy 按第1列升序排序', () => getActiveSheet().orderBy(0, 0)),
      },
      { label: 'page(1)', type: 'danger', handler: () => op('page 翻到第2页', () => getActiveSheet().page(1)) },
      {
        label: 'openFilter(0)',
        type: 'danger',
        handler: () => op('openFilter 打开第1列过滤', () => getActiveSheet().openFilter(0)),
      },
      {
        label: '选区A1:C4',
        type: 'danger',
        handler: () =>
          op('updateSelectionFromCoords 选中A1:C4', () => getActiveSheet().updateSelectionFromCoords(0, 0, 2, 3)),
      },
      {
        label: 'executeFormula',
        type: 'danger',
        handler: () => op('executeFormula 计算 =SUM(B2:B9)', () => getActiveSheet().executeFormula('=SUM(B2:B9)')),
      },
      { label: 'openEditor', type: 'danger', handler: openEditorDemo },
    ],
  },
];

// ============ 初始化 ============
const initSpreadsheet = () => {
  worksheets = jspreadsheet(spreadRef.value, {
    worksheets: [
      {
        worksheetName: '列类型',
        data: typeData,
        columns: typeColumns,
        minDimensions: [14, 6],
      },
      {
        worksheetName: '表头样式',
        data: styleData,
        minDimensions: [6, 6],
        nestedHeaders: [
          [
            { title: '基本信息', colspan: '2' },
            { title: '季度考核', colspan: '4' },
          ],
          [{ title: '姓名' }, { title: '部门' }, { title: 'Q1' }, { title: 'Q2' }, { title: 'Q3' }, { title: 'Q4' }],
        ],
        mergeCells: {
          C4: [2, 1], // C4 横向合并 2 列
          E4: [1, 2], // E4 纵向合并 2 行
        },
        comments: {
          C4: 'Q1 季度考核成绩',
          B4: '所属部门',
        },
        style: {
          C4: 'background-color: #fff3cd; font-weight: bold;',
          D4: 'background-color: #e1f3d8;',
        },
        freezeColumns: 1, // 冻结第 1 列
        freezeRows: 2, // 冻结前 2 行（含嵌套表头）
        tableOverflow: true,
        tableWidth: '100%',
        tableHeight: '260px',
        columnSorting: false,
      },
      {
        worksheetName: '公式排序',
        data: formulaData,
        columns: [
          { type: 'text', title: '商品', width: 120 },
          { type: 'numeric', title: '单价', width: 100, mask: '#,##0.00' },
          { type: 'numeric', title: '数量', width: 80 },
          { type: 'numeric', title: '小计(=B*C)', width: 130, readOnly: true },
        ],
        footers: [['合计', '=SUM(B2:B9)', '=SUM(C2:C9)', '=SUM(D2:D9)']],
        columnSorting: true,
      },
      {
        worksheetName: '分页过滤',
        data: deviceData,
        columns: [
          { type: 'text', title: '设备名称', width: 150 },
          { type: 'calendar', title: '采购日期', width: 130, options: { format: 'YYYY-MM-DD' } },
          { type: 'dropdown', title: '机房', width: 100, source: ['机房A', '机房B', '机房C'] },
          { type: 'checkbox', title: '在线', width: 80 },
          { type: 'dropdown', title: '状态', width: 100, source: ['正常', '告警', '维护'] },
        ],
        pagination: 10,
        paginationOptions: [5, 10, 20],
        filters: true,
        search: true,
        lazyLoading: true,
        rowDrag: true,
        columnSorting: true,
        tableOverflow: true,
        tableHeight: '280px',
        minDimensions: [5, 0],
        csvFileName: '设备台账',
      },
    ],
    tabs: true, // 多 Sheet 页签
    toolbar: [
      { type: 'i', content: '<span>撤销</span>', tooltip: '撤销操作', onclick: () => getActiveSheet()?.undo() },
      { type: 'i', content: '<span>重做</span>', tooltip: '重做操作', onclick: () => getActiveSheet()?.redo() },
      {
        type: 'i',
        content: '<span>导出CSV</span>',
        tooltip: '导出当前表为 CSV',
        onclick: () => getActiveSheet()?.download(true),
      },
      { type: 'i', content: '<span>插入行</span>', tooltip: '插入新行', onclick: () => getActiveSheet()?.insertRow() },
      {
        type: 'i',
        content: '<span>插入列</span>',
        tooltip: '插入新列',
        onclick: () => getActiveSheet()?.insertColumn(),
      },
      { type: 'separator' },
      {
        type: 'i',
        content: '<span>我的按钮</span>',
        tooltip: '自定义工具栏按钮',
        onclick: () => addLog('工具栏', '点击了自定义按钮'),
      },
    ],
    allowExport: true,
    includeHeadersOnDownload: true,
    about: false,
    autoCasting: true,
    // ===== 事件演示 =====
    onload: (instance) => {
      // onload 传入的是 SpreadsheetInstance，需通过 worksheets 拿到当前激活的工作表
      const activeWs = instance?.worksheets?.[instance.getWorksheetActive?.() ?? 0];
      addLog('onload', `工作表「${activeWs?.options?.worksheetName ?? ''}」加载完成`);
    },
    onbeforechange: (instance, cell, x, y, value) =>
      addLog('onbeforechange', `${instance.options.worksheetName} ${colName(x)}${y + 1} 即将改为 "${value}"`),
    onchange: (instance, cell, x, y, value) =>
      addLog('onchange', `${instance.options.worksheetName} ${colName(x)}${y + 1} 修改为 "${value}"`),
    onafterchanges: (instance, changes) => addLog('onafterchanges', `批量变更完成，共 ${changes?.length ?? 0} 处`),
    onselection: (instance, x1, y1, x2, y2) =>
      addLog('onselection', `选区 ${colName(x1)}${y1 + 1}:${colName(x2)}${y2 + 1}`),
    oninsertrow: (instance, rowNumber) => addLog('oninsertrow', `在第 ${rowNumber} 行插入新行`),
    ondeleterow: (instance, removedRows) => addLog('ondeleterow', `删除行 ${JSON.stringify(removedRows)}`),
    onmoverow: (instance, from, to) => addLog('onmoverow', `行 ${from} 移动到 ${to}`),
    oninsertcolumn: (instance, columns) =>
      addLog('oninsertcolumn', `插入新列 ${JSON.stringify(columns)?.slice(0, 80)}`),
    ondeletecolumn: (instance, columns) => addLog('ondeletecolumn', `删除列 ${JSON.stringify(columns)?.slice(0, 80)}`),
    onmovecolumn: (instance, from, to) => addLog('onmovecolumn', `列 ${from} 移动到 ${to}`),
    onresizerow: (instance, row) => addLog('onresizerow', `调整第 ${row} 行高度`),
    onresizecolumn: (instance, column) => addLog('onresizecolumn', `调整第 ${column} 列宽度`),
    onsort: (instance, column, direction) => addLog('onsort', `第 ${column} 列排序方向 ${direction}`),
    onmerge: (instance, merges) => addLog('onmerge', `合并单元格 ${JSON.stringify(merges)}`),
    onfocus: () => addLog('onfocus', '表格获得焦点'),
    onblur: () => addLog('onblur', '表格失去焦点'),
    onchangeheader: (instance, column, oldValue, newValue) =>
      addLog('onchangeheader', `第 ${column} 列表头由 "${oldValue}" 改为 "${newValue}"`),
    oneditionstart: () => addLog('oneditionstart', '进入单元格编辑状态'),
    oneditionend: () => addLog('oneditionend', '退出单元格编辑状态'),
    onundo: () => addLog('onundo', '执行了撤销'),
    onredo: () => addLog('onredo', '执行了重做'),
    onpaste: () => addLog('onpaste', '执行了粘贴'),
  });

  refreshSheetName();
};

onMounted(() => {
  initSpreadsheet();
});

onBeforeUnmount(() => {
  if (spreadRef.value) {
    jspreadsheet.destroy(spreadRef.value);
  }
});
</script>

<style lang="less" scoped>
.jss-page {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== Hero 横幅 ===== */
.jss-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px 28px;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(120deg, #5b7cfa 0%, #7b5cf0 55%, #9a5cf0 100%);
  box-shadow: 0 8px 24px rgba(91, 124, 250, 0.28);
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }

  &::before {
    width: 180px;
    height: 180px;
    right: -40px;
    top: -70px;
  }

  &::after {
    width: 110px;
    height: 110px;
    right: 160px;
    bottom: -60px;
  }

  .jss-hero-info {
    position: relative;
    z-index: 1;
    min-width: 260px;
  }

  .jss-hero-title {
    margin: 0 0 6px;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .jss-hero-desc {
    margin: 0 0 12px;
    font-size: 13px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.82);
    max-width: 640px;
  }

  .jss-hero-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .jss-hero-tag {
    display: inline-flex;
    align-items: center;
    padding: 3px 12px;
    font-size: 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.28);
    backdrop-filter: blur(4px);
  }

  .jss-hero-actions {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 12px;

    :deep(.el-switch__label) {
      color: rgba(255, 255, 255, 0.85);
    }
  }
}

/* ===== 功能卡片 ===== */
.jss-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .jss-card {
    background: #fff;
    border-radius: 12px;
    padding: 18px 20px;
    box-shadow: 0 2px 10px rgba(31, 41, 55, 0.06);
    border: 1px solid #f1f3f8;
    transition:
      box-shadow 0.25s ease,
      transform 0.25s ease;

    &:hover {
      box-shadow: 0 8px 22px rgba(31, 41, 55, 0.1);
      transform: translateY(-2px);
    }
  }

  .jss-card-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .jss-card-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    color: #fff;
    flex-shrink: 0;
  }

  .jss-card-icon.is-data {
    background: linear-gradient(135deg, #5b7cfa, #7b9bff);
  }

  .jss-card-icon.is-rowcol {
    background: linear-gradient(135deg, #f5a623, #ffc14d);
  }

  .jss-card-icon.is-style {
    background: linear-gradient(135deg, #34c77b, #6fdc9f);
  }

  .jss-card-icon.is-sheet {
    background: linear-gradient(135deg, #a855f7, #c084fc);
  }

  .jss-card-icon.is-other {
    background: linear-gradient(135deg, #f56c6c, #ff8f8f);
  }

  .jss-card-title-wrap {
    min-width: 0;
  }

  .jss-card-title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
  }

  .jss-card-desc {
    margin: 3px 0 0;
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.5;
  }

  .jss-btn-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

/* ===== 电子表格卡片 ===== */
.jss-sheet-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(31, 41, 55, 0.06);
  border: 1px solid #f1f3f8;
  overflow: hidden;

  .jss-sheet-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid #f1f3f8;
    background: #fbfcff;

    .jss-sheet-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .jss-sheet-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #34c77b;
      box-shadow: 0 0 0 3px rgba(52, 199, 123, 0.18);
    }

    .jss-sheet-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }

    .jss-sheet-sub {
      font-size: 12px;
      color: #9ca3af;
    }
  }

  .jss-sheet-body {
    padding: 14px;
    overflow: auto;
    background: #fbfcff;
  }
}

.jss-spreadsheet {
  min-height: 320px;
}

/* ===== 电子表格内部细节优化 ===== */
.jss-sheet-body {
  // 表格外层容器
  :deep(.jss_spreadsheet) {
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #e6e9f4;
    box-shadow: 0 1px 6px rgba(31, 41, 55, 0.06);
  }

  // 单元格统一字号配色
  :deep(.jss_worksheet) {
    font-size: 13px;
    color: #334155;
  }

  // 表头单元格
  :deep(.jss_worksheet > thead > tr > td) {
    background: linear-gradient(180deg, #f7f9ff 0%, #edf1fc 100%);
    color: #4053a8;
    font-weight: 600;
    font-size: 13px;
    border-color: #e3e8f6;
    padding-top: 9px;
    padding-bottom: 9px;
    text-align: center;

    &:hover {
      background: linear-gradient(180deg, #eef2ff 0%, #e4eafc 100%);
    }
  }

  // 数据单元格
  :deep(.jss_worksheet > tbody > tr > td) {
    border-color: #edf0f7;
    font-size: 13px;
    padding: 7px 6px;
    color: #334155;
  }

  // 行号列
  :deep(.jss_worksheet > tbody > tr > td:first-child) {
    background: #f7f8fc;
    color: #9aa3b5;
    text-align: center;
    font-size: 12px;
  }

  // 表头角标格
  :deep(.jss_worksheet > thead > tr > td:first-child) {
    background: #eef1fa;
    color: #8a94ad;
  }

  // 选中 / 选区
  :deep(.jss_worksheet .highlight) {
    background-color: rgba(91, 124, 250, 0.16);
  }

  :deep(.jss_worksheet .selection) {
    background-color: rgba(91, 124, 250, 0.1);
  }

  :deep(.jss_worksheet .highlight-top),
  :deep(.jss_worksheet .highlight-bottom),
  :deep(.jss_worksheet .highlight-left),
  :deep(.jss_worksheet .highlight-right) {
    border-color: #5b7cfa;
  }

  // 冻结列阴影
  :deep(.jss_worksheet thead .jss_freezed),
  :deep(.jss_worksheet tfoot .jss_freezed) {
    box-shadow: 3px 0 4px rgba(31, 41, 55, 0.08) !important;
  }

  :deep(.jss_worksheet tbody .jss_freezed) {
    background-color: #fcfdff !important;
    box-shadow: 2px 2px 6px rgba(31, 41, 55, 0.07) !important;
  }

  // 只读列
  :deep(.jss_worksheet > tbody > tr > td.readonly) {
    background-color: #f7f8fc;
    color: #94a3b8;
  }

  // 工具栏
  :deep(.jss_toolbar) {
    background: #f8f9ff;
    border: 1px solid #e6e9f4;
    border-radius: 8px;
    margin: 0 0 10px;
    padding: 5px;

    > div {
      border-radius: 6px;
      font-size: 12px;
      color: #55608a;
      padding: 4px 10px;
      transition:
        background-color 0.2s,
        color 0.2s;

      &:hover {
        background: #5b7cfa;
        color: #fff;
      }
    }
  }

  // Sheet 页签
  :deep(.jtabs .jtabs-headers) {
    border-bottom: 1px solid #eef0f7;
  }

  :deep(.jtabs .jtabs-headers > div:not(.jtabs-border)) {
    font-size: 13px;
    color: #64748b;
    padding: 8px 18px;
    margin-right: 4px;
    border-radius: 8px 8px 0 0;
    transition:
      color 0.2s,
      background-color 0.2s;

    &:hover {
      color: #5b7cfa;
      background: rgba(91, 124, 250, 0.06);
    }
  }

  :deep(.jtabs .jtabs-headers > div.jtabs-selected) {
    color: #5b7cfa;
    font-weight: 600;
    background: rgba(91, 124, 250, 0.1);
  }

  :deep(.jtabs .jtabs-headers .jtabs-border) {
    height: 2px;
    background: #5b7cfa;
  }

  // 页脚汇总行
  :deep(.jss_worksheet > tfoot > tr > td) {
    background: #f3f6ff;
    color: #4053a8;
    font-weight: 600;
    border-color: #e3e8f6;
  }

  // 过滤行
  :deep(.jss_worksheet > thead > tr.jss_filter > td) {
    background: #fbfcff;
  }

  // 分页
  :deep(.jss_pagination) {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #eef0f7;

    > div > div {
      width: 30px;
      height: 30px;
      line-height: 28px;
      font-size: 13px;
      border-radius: 8px;
      border: 1px solid #e3e8f6;
      color: #55608a;
      transition: all 0.2s;

      &:hover {
        border-color: #5b7cfa;
        color: #5b7cfa;
      }
    }
  }

  :deep(.jss_page_selected) {
    background-color: #5b7cfa !important;
    border-color: #5b7cfa !important;
    color: #fff !important;
  }
}

/* ===== 事件日志终端 ===== */
.jss-console {
  border-radius: 12px;
  background: #1b2233;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.3);
  overflow: hidden;

  .jss-console-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .jss-console-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .jss-console-dot.is-red {
    background: #ff5f57;
  }

  .jss-console-dot.is-yellow {
    background: #febc2e;
  }

  .jss-console-dot.is-green {
    background: #28c840;
  }

  .jss-console-title {
    margin-left: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .jss-console-count {
    font-size: 11px;
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.08);
    padding: 1px 8px;
    border-radius: 999px;
  }

  .jss-console-hint {
    margin-left: auto;
    font-size: 11px;
    color: #64748b;
  }

  .jss-console-body {
    max-height: 240px;
    overflow-y: auto;
    padding: 10px 16px;
    font-family: 'JetBrains Mono', Consolas, Monaco, 'Courier New', monospace;
  }

  .jss-console-line {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 3px 0;
    font-size: 12px;
    line-height: 1.6;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
  }

  .jss-console-time {
    color: #34d399;
    flex-shrink: 0;
  }

  .jss-console-name {
    color: #fbbf24;
    flex-shrink: 0;
    min-width: 90px;
  }

  .jss-console-detail {
    color: #cbd5e1;
    word-break: break-all;
  }

  .jss-console-empty {
    padding: 18px 0;
    color: #475569;
    font-size: 13px;
  }
}

/* 响应式：窄屏单列 */
@media (max-width: 1100px) {
  .jss-features {
    grid-template-columns: 1fr;
  }
}
</style>
