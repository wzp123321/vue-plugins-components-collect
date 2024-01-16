/*
 * @Author: yut
 * @Date: 2023-10-26 10:04:15
 * @LastEditors: yut
 * @LastEditTime: 2024-01-09 21:11:40
 * @Descripttion:
 */
/**
 * 时间类型
 */
export enum QM_EDateType {
  本月 = '1',
  本年 = '2',
}
/**
 * 树节点类型
 */
export enum QM_EAreaType {
  区域 = '1',
  业态 = '2',
}
/**
 * 树节点等级
 */
export enum QM_ELevelType {
  一级 = '1',
  二级 = '2',
  三级 = '3',
}

/**
 * url
 */
export enum EPath {
  获取KPI列表 = '/app/saveEnergy/querySaveEnergyCardList',
}

/**
 * 查询参数
 */
export interface QM_ISearchParams {
  quotaType: string;
  treeType: string;
  treeLevel: string;
  pageNum: number;
  pageSize: number;
  searchCount: boolean;
  orders: {
    column: string;
    asc: boolean;
  }[];
}

/**
 * 列表
 */
export interface QM_IEnergyType {
  energyName: string;
  energyCode: string;
  energyValue: number;
  quotaValue: number;
  percentValue: number | null;
  waringCode: string;
}

// 卡片数据
export interface QM_IDataListItem {
  treeId: number;
  treeName: string;
  energyInfoList: {
    energyName: string;
    energyCode: string;
    energyValue: number;
    quotaValue: number;
    percentValue: number | null;
    waringCode: string;
  }[];
}
