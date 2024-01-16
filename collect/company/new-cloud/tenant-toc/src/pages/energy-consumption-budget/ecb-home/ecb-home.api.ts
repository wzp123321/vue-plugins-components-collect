export const WIDTH_OF_ENERGY_CODE = 102;
export const WIDTH_OF_NODE_NAME = 148;
export const WIDTH_OF_AREA = 120;
export const MIN_WIDTH_OF_YEAR = 144;
export const WIDTH_OF_TOTAL = 142;
export const WIDTH_OF_OPERATE = 96;

// 单个能源类型下数据类型
export enum EEnergyConsumption {
  能耗量 = '1',
  '单价（元）' = '2',
  '单项能耗费用（元）/总费用（元）' = '3',
}

export interface Ebt_IQueryVO {
  hostingPeriodIndex: number | null;
  startTime: string;
  endTime: string;
  months: string;
}

// 能耗预算类型
export enum EBudgetType {
  能耗基准 = '1',
  改造前能耗 = '2',
  节能量 = '3',
  改造后能耗 = '4',
  调差项 = '5',
}

// 响应结果
export interface Ebt_IBudgetRes<T> {
  /**
   * 能耗基准
   */
  energyConBenchmark: Ebt_IBudgetTypeVO<T> | null;
  /**
   * 改造前能耗
   */
  energyConBeforeRetrofit: Ebt_IBudgetTypeVO<T> | null;
  /**
   * 节能量
   */
  energySaving: Ebt_IBudgetTypeVO<T> | null;
  /**
   * 改造后能耗
   */
  energyConAfterRetrofit: Ebt_IBudgetTypeVO<T> | null;
  /**
   * 调差项
   */
  adjustmentTerm: Ebt_IBudgetTypeVO<T> | null;
}

export interface Ebt_IBudgetTypeVO<T> {
  headerColSpan: number;
  moduleIndex: string;
  titleList: string[];
  moduleVOList: T;
}

export interface Ebt_IConvertBudgetTypeVO<T> extends Ebt_IBudgetTypeVO<T> {
  hasOperateBtn: boolean;
  headerColSpan: number;
  type: EBudgetType;
  typeName: string;
}

// 行数据
export interface Ebt_IBudgetRow {
  /**
   * 是否是合计
   */
  totalFlag: boolean;
  /**
   * 能源编码
   */
  energyCode: string;
  /**
   * 能源名称
   */
  energyName: string;
  /**
   * 能源单位
   */
  energyUnit: string;
  /**
   * 是否是小计
   */
  summaryFlag: boolean;
  /**
   * 托管区域Id
   */
  areaId: string;
  /**
   * 托管区域名称
   */
  areaName: string;
  /**
   * 数据类型（1能耗量 2单价(元) 3单项能耗费用(元)）
   */
  itemCode: string;
  /**
   * 数据类型名称
   */
  itemName: string;
  /**
   * 平铺数据集合
   */
  dataList: number[];
  /**
   * 行合计
   */
  lineTotal: number;
  /**
   * 是否可以编辑
   */
  editable: boolean;
}

// 转换后的行数据
export interface Ebt_IConvertRow extends Ebt_IBudgetRow {
  isStripe: boolean;
  hasAreaFlag: boolean;
  [key: string]: string | boolean | number[] | number | string[];
}

export interface Ebt_IEditRowParams {
  hostingPeriodIndex: number | null;
  moduleIndex: string;
  energyCode: string;
  hostingAreaId: number;
  itemCode: string;
  valueList: string[];
}

// 编辑行
export interface Ebt_IEditStore {
  typeIndex: number;
  moduleIndex: string;
  dataIndex: number;

  energyCode: string;
  areaId: string;
  itemCode: string;

  originRow: Ebt_IConvertRow | null;
}

export interface Ebt_ISearchVO {
  dateCode: number | null;
  startTime: string;
  endTime: string;
  months: string;
}

export type Ebt_IBaseHeadQueryHostingPeriodsResponse = {
  code: number;
  name: string;
  status: boolean;
  start: any;
  months: string;
  end: any;
};
