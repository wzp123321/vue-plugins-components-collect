export enum ESplitFlag {
  未拆分,
  已拆分,
}

export interface CD_QueryParams {
  amount?: string[];
  balance?: number;
  billCode?: string[];
  billDate?: string;
  billMonth?: string[];
  billProjectContent?: string[];
  billTitleContent?: string[];
  billTypeName?: string[];
  billYear?: string[];
  costNode?: string[];
  costType?: string[];
  employeeCode?: string[];
  employeeDepartment?: string[];
  employeeName?: string[];
  employeeType?: string[];
  ledgerCode?: string[];
  ledgerName?: string[];
  orders: {
    asc: boolean;
    column: string;
  }[];
  pageNum: number;
  pageSize: number;
  productCode?: string[];
  productName?: string[];
  productType?: string[];
  productTypeName?: string[];
  projectNumber?: string[];
  projectTaskName?: string[];
  recordTime?: string;
  searchCount: boolean;
  districts: string[];
}

export interface CD_CostDetailRes<T> {
  columnList: {
    enName: string;
    name: string;
  }[];
  financialDataVO: {
    list: T[];
    pageNum: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  totalBalance: string;
}

export interface CD_ColumnVO {
  enName: string;
  name: string;
}

/**
 * 明细详情
 * @param id ID
 * @param projectNumber 项目编码
 * @param projectTaskName 项目名称
 * @param ledgerCode 总帐科目编号
 * @param ledgerName 总帐科目
 * @param costNode 成本明细节点
 * @param employeeCode 客户/供应商编号
 * @param employeeName 客户/供应商名称
 * @param employeeDepartment 人员部门
 * @param employeeType 人员类别
 * @param productCode 产品编码
 * @param productName 产品
 * @param productType 产品类别
 * @param productTypeName 产品类别名称
 * @param billDate 过账日期
 * @param billYear 年
 * @param billMonth 月
 * @param billCode 日记账分录
 * @param billTypeName 日记账分录类
 * @param billTitleContent 日记账分录抬头文本
 * @param billProjectContent 日记账分录项目文本
 * @param recordTime 创建时间
 * @param balance 公司货币余额
 * @param amount 评估数量
 * @param costType 成本类型
 */
export interface CD_CostDetailVO {
  id: number | null;
  projectNumber: string;
  projectTaskName: string;
  ledgerCode: string;
  ledgerName: string;
  costNode: string;
  employeeCode: string;
  employeeName: string;
  employeeDepartment: string;
  employeeType: string;
  productCode: string;
  productName: string;
  productType: string;
  productTypeName: string;
  billDate: string | null;
  billYear: string;
  billMonth: string;
  billCode: string;
  billTypeName: string;
  billTitleContent: string;
  billProjectContent: string;
  recordTime: string | null;
  balance: string;
  amount: string;
  costType: string;
  listOrder: number | null;
  addUpFlag: boolean | null;
  actualBillDate: string;
  hasLog: boolean;
  splitFlag: number;

  changeColumns?: string[];
}

/**
 * @param addUpFlag 是向上添加行---只有插入行时需要赋值
 * @param formatBillDate 根据日期--生成的年月日格式的字段，用于编辑
 * @param formatBillYear 根据年--生成的年月日格式的字段，用于编辑
 * @param formatBillMonth 根据月--生成的年月日格式的字段，用于编辑
 * @param formatRecordTime 根据创建时间--生成的年月日格式的字段，用于编辑
 * @param editing 是否整行处于编辑
 * @param changeColumns 修改列数组
 */
export interface CD_CostDetailConvertVO extends CD_CostDetailVO {
  formatBillDate: string | null;
  formatRecordTime: string | null;
  editing: boolean;

  changeColumns?: string[];
}

export interface CD_Column_Render {
  title: string;
  minWidth: string;
  type: string;
  hasBackground: boolean;
}

/**
 * 遍历列
 */
export interface CD_DynamicColumnVO {
  key: string;
  type: string;
  title: string;
  secrrStyle: string;
  firstHh: boolean;
  fixed: boolean;
  minWidth: string;
  unit: string;
  backupValue: number | string;
  screenBg: boolean;
  hasFilter: boolean;
}

/**
 * @param selectedRowIndex 选中行索引
 * @param copyedRowIndex 复制行索引
 * @param editRowIndex 编辑行索引
 * @param editColumnKey 编辑键值数组
 * @param editableColumnKeys 可编辑单元格键值
 * @param originValue 编辑行旧值
 * @param insertedRowStartIndex 复制起始索引
 * @param insertedRowEndIndex 复制结束索引
 * @param operateType 操作类型 复制，单个编辑，整行保存
 */
export interface CD_Table_Store {
  selectedRowIndex: number;
  copyedRowIndex: number;

  editRowIndex: number;
  editColumnKey: string;
  editableColumnKeys: string[];
  originValueMap: Map<string, string | number>;
  currentRow: CD_CostDetailConvertVO;

  insertedRowStartIndex: number;
  insertedRowEndIndex: number;

  operateType: string;
}
