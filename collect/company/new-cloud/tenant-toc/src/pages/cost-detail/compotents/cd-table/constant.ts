import { CD_Column_Render, CD_CostDetailConvertVO, ESplitFlag } from './cd-table.api';

// 单元格高度
export const CELL_HEIGHT = 48;
export const CELL_HEIGHT_MINI = 36;

// 输入框默认高度
export const INUPUT_HEIGHT = 32;

// 单元格内边距
export const CELL_PADDING = 15;

// 菜单宽度
export const MENU_WIDTH = 208;

// 顶部高度
export const HEADER_HEIGHT = 56;

// 固定列的列宽度
export const FIXED_COLUMN_WIDTH = 211;

// 分页器高度
export const PAGINATION_HEIGHT = 37;

// 分页器外边距高度
export const PAGINATION_MARGIN_TOP = 12;

/**
 * 插入方式
 */
export enum INSERT_TYPE {
  上方 = 1, // 上方
  下方 = 2, // 下方
}

// 单元格类型
export enum COLUMN_TYPE {
  只读文本 = 'readonly_text',
  文本输入框 = 'text',
  正数输入框 = 'positive_number',
  负数输入框 = 'negative_number',
  一般下拉框 = 'select',
  可新增下拉框 = 'add_select',
  日期选择器 = 'date',
}

// 表格操作类型
export enum TABLE_OPERATE_TYPE {
  复制行 = 'copy',
  单元格编辑 = 'cell_edit',
  联动下拉框整行保存 = 'linkage-select-edit',
  整行保存 = 'row_save',
}

// 可单独编辑的单元格
export const EDITABLE_COLUMN_KEYS = [
  'costNode',
  'ledgerName',
  'employeeDepartment',
  'employeeType',
  'billTitleContent',
  'billProjectContent',
  'balance',
  'costType',
];

// 可单独编辑的输入框单元格
export const EDITABLE_INPUT_KEYS = ['billTitleContent', 'billProjectContent', 'balance'];

// 后台接口地址
export enum EPath {
  查询年度详情表格数据 = 'financialData/query/queryPage',
  查询筛选列表 = 'tenantamount/queryTenantamountPage',
  复制行 = 'financialData/addLine',
  页面修改 = 'financialData/modify',
  删除数据 = 'financialData/delLine',
  获取行中某个字段可选选项 = 'financialData/query/getListForContent',
  根据成本类别获取成本明细 = '/financialData/query/getNodeByType',
  根据人员部门获取人员类别 = '/financialData/query/getTypeByDepartment',
  根据总账科目名称获取总账科目编号 = '/financialData/query/getLedgerCodeByName',
  是否拥有财务专家权限 = 'financialData/isFinancialExpert',
  查询成本类型 = '/financialData/query/getCostType',
}

// 初始数据
export const initailRow: CD_CostDetailConvertVO = {
  id: null,
  projectNumber: '',
  projectTaskName: '',
  ledgerCode: '',
  ledgerName: '',
  costNode: '',
  employeeCode: '',
  employeeName: '',
  employeeDepartment: '',
  employeeType: '',
  productCode: '',
  productName: '',
  productType: '',
  productTypeName: '',
  billDate: '',
  billYear: '',
  billMonth: '',
  billCode: '',
  billTypeName: '',
  billTitleContent: '',
  billProjectContent: '',
  recordTime: '',
  balance: '',
  amount: '',
  costType: '',
  listOrder: null,
  addUpFlag: null,
  actualBillDate: '',
  hasLog: false,
  splitFlag: ESplitFlag.未拆分,

  formatBillDate: '',
  formatRecordTime: '',
  editing: false,
};

// 列初始数据
export const COLUMN_KEYS: { [key: string]: CD_Column_Render } = {
  projectNumber: {
    title: '项目（项目任务（MD））',
    minWidth: '211',
    type: COLUMN_TYPE.文本输入框,
    hasBackground: false,
  },
  projectTaskName: {
    title: '',
    minWidth: '245',
    type: COLUMN_TYPE.文本输入框,
    hasBackground: false,
  },
  ledgerName: {
    title: '',
    minWidth: '161',
    type: COLUMN_TYPE.一般下拉框,
    hasBackground: false,
  },
  ledgerCode: {
    title: '总账科目（来源）',
    minWidth: '169',
    type: COLUMN_TYPE.文本输入框,
    hasBackground: false,
  },
  costNode: {
    title: '成本明细',
    minWidth: '143',
    type: COLUMN_TYPE.可新增下拉框,
    hasBackground: true,
  },
  employeeCode: {
    title: '对应客户/供应商编号',
    minWidth: '199',
    type: COLUMN_TYPE.文本输入框,
    hasBackground: false,
  },
  employeeName: {
    title: '',
    minWidth: '189',
    type: COLUMN_TYPE.文本输入框,
    hasBackground: false,
  },
  employeeDepartment: {
    title: '人员部门',
    minWidth: '144',
    type: COLUMN_TYPE.一般下拉框,
    hasBackground: true,
  },
  employeeType: {
    title: '人员类别',
    minWidth: '141',
    type: COLUMN_TYPE.一般下拉框,
    hasBackground: true,
  },
  productCode: {
    title: '产品',
    minWidth: '120',
    type: COLUMN_TYPE.文本输入框,
    hasBackground: false,
  },
  productName: {
    title: '',
    minWidth: '91',
    type: COLUMN_TYPE.文本输入框,
    hasBackground: false,
  },
  productType: {
    title: '产品类别',
    minWidth: '120',
    type: COLUMN_TYPE.文本输入框,
    hasBackground: false,
  },
  productTypeName: {
    title: '',
    minWidth: '91',
    type: COLUMN_TYPE.文本输入框,
    hasBackground: false,
  },
  billDate: {
    title: '过账日期',
    minWidth: '126',
    type: COLUMN_TYPE.日期选择器,
    hasBackground: false,
  },
  billYear: {
    title: '年份',
    minWidth: '116',
    type: COLUMN_TYPE.只读文本,
    hasBackground: true,
  },
  billMonth: {
    title: '月份',
    minWidth: '116',
    type: COLUMN_TYPE.只读文本,
    hasBackground: true,
  },
  billCode: {
    title: '日记账分录',
    minWidth: '152',
    type: COLUMN_TYPE.文本输入框,
    hasBackground: false,
  },
  billTypeName: {
    title: '日记账分录类',
    minWidth: '150',
    type: COLUMN_TYPE.文本输入框,
    hasBackground: false,
  },
  billTitleContent: {
    title: '日记账分录抬头文本',
    minWidth: '205',
    type: COLUMN_TYPE.文本输入框,
    hasBackground: false,
  },
  billProjectContent: {
    title: '日记账分录项目文本',
    minWidth: '244',
    type: COLUMN_TYPE.文本输入框,
    hasBackground: false,
  },
  recordTime: {
    title: '创建时间',
    minWidth: '136',
    type: COLUMN_TYPE.日期选择器,
    hasBackground: false,
  },
  balance: {
    title: '公司货币余额',
    minWidth: '157',
    type: COLUMN_TYPE.负数输入框,
    hasBackground: false,
  },
  amount: {
    title: '评估数量',
    minWidth: '122',
    type: COLUMN_TYPE.正数输入框,
    hasBackground: false,
  },
  costType: {
    title: '成本类型',
    minWidth: '131',
    type: COLUMN_TYPE.一般下拉框,
    hasBackground: true,
  },
};

// 加载条数
export const PAGES = [50, 100, 200, 300];
