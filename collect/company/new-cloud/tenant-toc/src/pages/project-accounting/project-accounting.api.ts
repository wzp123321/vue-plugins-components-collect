/*
 * @Author: yut
 * @Date: 2023-08-30 16:44:16
 * @LastEditors: yut
 * @LastEditTime: 2023-12-11 17:06:51
 * @Descripttion:
 */
import type { TableColumnCtx } from '@tiansu/element-plus';
export enum EPath {
  查询托管周期 = '/baseHead/queryHostingPeriods',
  查询项目核算数据 = '/projectAccount/query',
  下拉列表 = '/projectAccount/query/choiceList ',
  编辑备注 = '/projectAccount/editRemark',
  编辑行数据 = '/projectAccount/updateNodeData',
  导出 = '/projectAccountDownload/downloadProjectAccountData',
}

export enum EPALevel {
  一级节点 = '1',
  二级节点 = '2',
  三级节点 = '3',
}

export enum EDate_Type {
  自然年 = '1',
  运营期汇总 = '3',
}

//全周期
export const PA_FULL_CYCLE = 0;

export interface PA_IEditParams {
  costType: string;
  moduleIndex: string;
  originRow: PA_ITableDataItem | null;
  dataIndex: number;
  typeIndex: number;
}

export interface PA_ITableDataItem {
  index?: number;
  parentIndex?: number;
  nodeId: number;
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
  remark: string | null;
  sonVOList?: PA_ITableDataItem[];
  nodeType: string;
  rateFlag: boolean; //是否百分比显示
}

//接口返回每个表格数据
export interface PA_ITypeVO<T> {
  moduleIndex: string;
  titleList: string[];
  moduleVOList: T;
}

//项目预算返回结果
export interface PA_IBudgetRes {
  /**
   * 能耗数据
   */
  energyTable?: PA_ITableDataItem[] | null;
  /**
   * 项目收入(不含税)
   */
  incomeTable?: PA_ITableDataItem[] | null;
  /**
   * 项目成本(不含税)
   */
  costTable?: PA_ITableDataItem[] | null;
  /**
   * 基础表格
   */
  totalTable?: PA_ITableDataItem | null;
  /**
   * 税差收益
   */
  taxIncomeTable?: PA_ITableDataItem[] | null;
  titleList?: PA_TitleItem[] | null;
}

export interface PA_TitleItem {
  code: string;
  name: string;
}

// 能耗预算类型
// export enum EPAccountingType {
//   能耗数据 = '1',
//   '项目收入(不含税)' = '2',
//   '项目成本(不含税)' = '3',
//   基础数据 = '4',
//   税差收益计算表 = '5',
//   '项目本年收入(含能源费流水)' = '6',
//   '项目合计收入(含能源费流水)' = '7',
//   '项目本年收入(含能源费流水和建设期成本)' = '8',
//   '项目合计收入(含能源费流水和建设期成本)' = '9',
// }

// 能耗预算类型
export enum EPAccountingTypeKey {
  能耗数据 = 'energyTable',
  '项目收入(不含税)' = 'incomeTable',
  '项目成本(不含税)' = 'costTable',
  基础数据 = 'totalTable',
  税差收益计算表 = 'taxIncomeTable',
  '项目本年收入(含能源费流水)' = 'incomeFlowTable',
  '项目合计收入(含能源费流水)' = 'incomeWithPlateSumTable',
  '项目本年收入(含能源费流水和建设期成本)' = 'incomeNoPlateTable',
  '项目合计收入(含能源费流水和建设期成本)' = 'incomeNoPlateSumTable',
}

//表格最小列宽
export const enum PA_TABLE_COLUMN_MIN_WIDTH {
  PA_INDEX_MIN_WIDTH = 61,
  PA_CATEGORY_MIN_WIDTH = 220,
  PA_TOTAL_MIN_WIDTH = 148,
  PA_DATA_MIN_WIDTH = 120,
  PA_REMARK_MIN_WIDTH = 160,
  PA_OPERATE_MIN_WIDTH = 108,
}
//基础表格
export interface PA_IBasicData {
  hasOperateBtn: boolean;
  typeName: string;
  type: string;
  moduleIndex: string;
  moduleVOList: PA_ITableDataItem[];
}

//表格属性
export interface PA_ITableColumnProps {
  row: PA_ITableDataItem;
  column: TableColumnCtx<PA_ITableDataItem>;
  rowIndex: number;
  columnIndex: number;
}

/**
 * 编辑备注
 */
export interface PA_IEditRemarkParams {
  tenantId: number;
  nodeId: number;
  year: number;
  nodeType: string;
  remark: string | null;
}

/**
 * 编辑行数据
 */
export interface PA_IEditRowDataParams {
  tenantId: number;
  tenantCode: string;
  nodeId: number;
  year: number;
  nodeType: string;
  remark?: string | null;
  dataList: {
    valueTime: string;
    value: number | null;
    originValue: number | null;
  }[];
}
