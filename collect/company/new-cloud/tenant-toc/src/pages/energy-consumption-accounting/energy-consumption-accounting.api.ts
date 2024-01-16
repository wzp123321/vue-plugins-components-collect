/*
 * @Author: yut
 * @Date: 2023-08-30 16:44:16
 * @LastEditors: yut
 * @LastEditTime: 2023-12-18 09:52:46
 * @Descripttion:
 */
export enum EPath {
  查询托管周期 = '/baseHead/queryHostingPeriods',
  获取能耗核算数据 = '/energyConsumptionAccounting/queryTable',
  编辑能耗核算数据 = '/energyConsumptionAccounting/edit',
  能耗核算表页面导出 = '/energyConsumptionAccounting/export',
}

//表格最小列宽
export const enum ECA_TABLE_COLUMN_MIN_WIDTH {
  ECA_CATEGORY_MIN_WIDTH = 250,
  ECA_ENERGY_MIN_WIDTH = 102,
  ECA_ITEM_MIN_WIDTH = 148,
  ECA_ITEM_PRICE_MIN_WIDTH = 175,
  ECA_ENERGY_PRICE_MIN_WIDTH = 75,

  ECA_DATA_MIN_WIDTH = 120,
  ECA_TOTAL_MIN_WIDTH = 120,
  ECA_REMARK_MIN_WIDTH = 120,
}

/**
 * 能耗核算类型
 */
export enum EAccountingType {
  能耗基准 = '1',
  '改造前能耗(预算-可研)' = '2',
  '改造后能耗(实缴)' = '3',
  项目总收益 = '4',
  单价调差 = '5',
  已核定能源事件 = '6',
  '项目总收益(调整后)' = '7',
}

export const ECA_TABLE_KEYS = [
  'energyConBenchmark', //能耗基准
  'energyConBeforeRetrofit', //energyConBeforeRetrofit
  'energyConAfterRetrofit', //改造后能耗(实缴)
  'totalIncome', //项目总收益
  'priceAdjustment', //单价调差
  'energyEvent', //已核定能源事件
  'totalIncomeAfter', //项目总收益(调整后)
];

//项目预算返回结果
export interface ECA_IAccountTypeRes<T> {
  /**
   * 能耗基准
   */
  energyConBenchmark?: ECA_IAccountingTypeVO<T> | null;
  /**
   * 改造前能耗
   */
  energyConBeforeRetrofit?: ECA_IAccountingTypeVO<T> | null;
  /**
   * 项目总收益
   */
  totalIncome?: ECA_IAccountingTypeVO<T> | null;
  /**
   * 改造后能耗
   */
  energyConAfterRetrofit?: ECA_IAccountingTypeVO<T> | null;
  /**
   * 调差项
   */
  priceAdjustment?: ECA_IAccountingTypeVO<T> | null;
  /**
   * 已核定边界
   */
  energyEvent?: ECA_IAccountingTypeVO<T> | null;
}

export interface ECA_IAccountingTypeVO<T> {
  moduleIndex: string;
  titleList: string[];
  moduleVOList: T;
}

export interface ECA_IAccountingRow {
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
  areaId: number;
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

  /**
   * 备注
   */
  remark: string;

  id: string;

  children: ECA_IAccountingRow[];
}

export interface ECA_IConvertAccountingTypeVO<T> extends ECA_IAccountingTypeVO<T> {
  type: EAccountingType;
  typeName: string;
}

export interface ECA_IQueryVO {
  hostingPeriodIndex: number | null;
  startTime: string;
  endTime: string;
  months: string;
}

export type ECA_IBaseHeadQueryHostingPeriodsResponse = {
  code: number;
  name: string;
  status: boolean;
  start: any;
  months: string;
  end: any;
};

export interface Eca_IEditParams {
  moduleIndex: string;
  itemCode: string;
  areaId: number;
  id: string;
}

/**
 * 更新接口入参
 */
export interface Eca_IAcountUpdateParams {
  tenantId: number;
  tenantCode: string;
  hostingPeriodIndex: number;
  moduleIndex: string;
  energyCode: string;
  hostingAreaId: number;
  areaName: string;
  itemCode: string;
  remark: string;
}
