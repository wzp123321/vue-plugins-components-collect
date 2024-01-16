/*
 * @Author: yut
 * @Date: 2023-07-11 19:21:58
 * @LastEditors: yut
 * @LastEditTime: 2023-08-21 10:35:35
 * @Descripttion:
 */
/**
 * 表格数据
 */
export interface ITableDataItem {
  /**
   * 指标ID
   */
  treeId: number;
  /**
   * 名字
   */
  treeName: string;
  /**
   * 数据列表
   */
  dataList: any[];
}

/**
 * 能源类型枚举
 */
export enum EEnergyType {
  电 = '1',
  水 = '2',
  燃气 = '3',
}

/**
 * 能源类型
 */
export interface IEnergyTypeItem {
  id: number;
  code: string;
  name: string;
  unit: string;
}

/**
 * 目标值信息列表
 */
export interface ITargetInfoData {
  /**
   * 指标信息
   */
  headList: {
    /**
     * 指标ID
     */
    indexId: number;
    /**
     * 名字
     */
    indexName: string;
    /**
     * 是否百分比
     */
    percent: boolean;
  }[];
  /**
   * 值信息
   */
  bodyList: {
    list: {
      /**
       * 指标ID
       */
      treeId: number;
      /**
       * 名字
       */
      treeName: string;
      /**
       * 数据列表
       */
      dataList: IDataListItem[];
    }[];
    pageNum: number;
    pageSize: number;
    pages: number;
    total: number;
  };
}

/**
 * 指标值
 */
export interface IDataListItem {
  editFlag: boolean;
  value: string | null;
}

/**
 * 表头数据
 */
export interface ITableHeaderData {
  indexId: number;
  indexName: string;
  percent: boolean;
}

export const enum EPath {
  科室考核目标值维护页面查询接口 = '/admin/apportionCheck/getTargetInfo',
  科室考核查询已勾选的分类分项 = '/apportionCheck/querySelectedEnergyCode',
  科室考核目标值维护页面编辑接口 = '/admin/apportionCheck/editTargetInfo',
}
