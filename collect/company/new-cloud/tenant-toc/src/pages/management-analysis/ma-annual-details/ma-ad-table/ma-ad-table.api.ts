export const WIDTH_OF_ITEM_NAME = 100;
export const WIDTH_OF_NAME = 200;
export const WIDTH_OF_UNIT = 100;

export const WIDTH_OF_ENERGY_CODE = 120;
export const WIDTH_OF_NODE_NAME = 120;
export const WIDTH_OF_AREA = 120;
export const MIN_WIDTH_OF_YEAR = 120;
export const WIDTH_OF_TOTAL = 126;
export const WIDTH_OF_OPERATE = 96;

export interface MaAd_ISearchVO {
  dateCode: number | null;
}

export interface IBaseSearchRef extends MaAd_ISearchVO {
  clickTriggle: boolean;
}

export type MaAd_IBaseHeadQueryEnergyTypeResponse = {
  unit: string;
  code: string;
  name: string;
};

export type MaAd_IBaseHeadQueryHostingPeriodsResponse = {
  code: number;
  name: string;
  start: string;
  end: string;
};
export interface MaAd_ISearchVO {
  dateCode: number | null;
}

export interface IBaseSearchRef extends MaAd_ISearchVO {
  clickTriggle: boolean;
}

// 单个能源类型下数据类型
export enum EEnergyConsumption {
  能耗量 = '1',
  '单价（元）' = '2',
  '单项能耗费用（元）/总费用（元）' = '3',
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
export interface MaAd_IBudgetRes<T> {
  /**
   * 能耗基准
   */
  energyConBenchmark: MaAd_IBudgetTypeVO<T> | null;
  /**
   * 改造前能耗
   */
  energyConBeforeRetrofit: MaAd_IBudgetTypeVO<T> | null;
  /**
   * 节能量
   */
  energySaving: MaAd_IBudgetTypeVO<T> | null;
  /**
   * 改造后能耗
   */
  energyConAfterRetrofit: MaAd_IBudgetTypeVO<T> | null;
  /**
   * 调差项
   */
  adjustmentTerm: MaAd_IBudgetTypeVO<T> | null;
}

export interface MaAd_IBudgetTypeVO<T> {
  headerColSpan: number;
  moduleIndex: string;
  titleList: string[];
  moduleVOList: T;
}

export interface MaAd_IConvertBudgetTypeVO<T> extends MaAd_IBudgetTypeVO<T> {
  headerColSpan: number;
  type: EBudgetType;
  typeName: string;
}

// 行数据
export interface MaAd_IBudgetRow {
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
export interface MaAd_IConvertRow extends MaAd_IBudgetRow {
  isStripe: boolean;
  hasAreaFlag: boolean;
  [key: string]: string | boolean | number[] | number | string[];
}
