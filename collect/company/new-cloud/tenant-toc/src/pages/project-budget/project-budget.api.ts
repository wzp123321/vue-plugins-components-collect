/*
 * @Author: yut
 * @Date: 2023-08-30 16:44:16
 * @LastEditors: yut
 * @LastEditTime: 2023-12-11 17:25:25
 * @Descripttion:
 */
import type { TableColumnCtx } from '@tiansu/element-plus';
export enum EPath {
  查询托管周期 = '/baseHead/queryHostingPeriods',
  成本预算查询 = '/projectBudget/query',
  成本预算编辑 = '/projectBudget/update/cost',
  能耗数据项目收入不含税数据编辑 = '/projectBudget/update/energyAndIncome',
  下拉列表 = '/projectBudget/query/choiceList',
}

export enum EDate_Type {
  自然年 = '1',
  全周期 = '2',
}

export enum EPBLevel {
  一级节点 = '1',
  二级节点 = '2',
  三级节点 = '3',
}

export const PB_FULL_CYCLE = 0;

export interface PB_IEditParams {
  costType: string;
  moduleIndex: string;
  originRow: PB_ITableDataItem | null;
  dataIndex: number;
  typeIndex: number;
}

//列表行数据
export interface PB_ITableDataItem {
  index?: number;
  parentIndex?: number;
  nodeId?: number;
  costType: string; //类目
  predictTotalCost: number | string; //预算累计
  values: {
    [key: string]: {
      predictCost: number | string | null; //税前
      predictCostAfterTax: number | string | null; //税后
    };
  };
  num: number | string | null; //序号
  editableFlag: boolean; //是否能编辑
  taxTypeShowFlag: boolean | null; //是否能编辑
  taxRate?: string; //税点
  taxRatePercentage?: string; //税率
  sonVOList?: PB_ITableDataItem[];
  rateFlag: boolean; //是否百分比
}

//接口返回每个表格数据
export interface Pbt_IBudgetTypeVO<T> {
  moduleIndex: string;
  titleList: string[];
  moduleVOList: T;
}

export interface PB_TitleItem {
  code: string;
  name: string;
}

//项目预算返回结果
export interface Pb_IBudgetRes {
  /**
   * 能耗数据
   */
  energyTable?: PB_ITableDataItem[] | null;
  /**
   * 项目收入(不含税)
   */
  incomeTable?: PB_ITableDataItem[] | null;
  /**
   * 项目成本(不含税)
   */
  costTable?: PB_ITableDataItem[] | null;
  /**
   * 基础表格
   */
  totalTable?: PB_ITableDataItem | null;
  /**
   * 税差收益
   */
  taxIncomeTable?: PB_ITableDataItem[] | null;
  titleList?: PB_TitleItem[] | null;
}

// 能耗预算类型
export enum PBudgetType {
  能耗数据 = '1',
  项目收入 = '2',
  项目成本 = '3',
  基础数据 = '4',
  税差收益计算表 = '5',
}

//表格类别最小宽度
export const PB_TABLE_CATEGORY_MIN_WIDTH: { [key: string]: number } = {
  能耗数据: 228,
  '一、项目收入(不含税)': 196,
  '二、项目成本(不含税)': 226,
  基础数据: 168,
  税差收益计算表: 196,
};

//表格最小列宽
export const enum PB_TABLE_COLUMN_MIN_WIDTH {
  PB_INDEX_MIN_WIDTH = 61,
  PB_CATEGORY_MIN_WIDTH = 220,
  PB_TOTAL_MIN_WIDTH = 148,
  PB_DATA_MIN_WIDTH = 120,
  PB_OPERATE_MIN_WIDTH = 108,
}
//基础表格
export interface PB_IBasicData {
  hasOperateBtn: boolean;
  typeName: string;
  type: string;
  moduleIndex: string;
  moduleVOList: any[];
}

//表格属性
export interface PB_ITableColumnProps {
  row: PB_ITableDataItem;
  column: TableColumnCtx<PB_ITableDataItem>;
  rowIndex: number;
  columnIndex: number;
}
