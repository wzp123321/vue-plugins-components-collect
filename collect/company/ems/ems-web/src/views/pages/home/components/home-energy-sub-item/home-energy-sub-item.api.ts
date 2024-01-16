/*
 * @Author: yut
 * @Date: 2023-11-18 15:51:03
 * @LastEditors: yut
 * @LastEditTime: 2023-11-27 10:05:41
 * @Descripttion:
 */

import { number } from 'echarts';

/**
 * 请求url
 */
export enum EPath {
  获取能源类型列表 = '/admin/energy/code/listEnergyParentCodeExcludeTotal',
  获取饼图数据 = '/energyPortal/getEnergyItemRatioVO',
}

/**
 * 能源类型
 */
export interface HESI_IEnergyItem {
  code: string;
  name: string;
}

/**
 * 饼图数据
 */
export interface HESI_IEnergyItemRatio {
  energyName: string;
  pieChartDataList: {
    id: number;
    name: string;
    percent: number;
    value: number;
  }[];
  pieChartName: string;
  unit: string;
  treeType: string;
  treeId: number | null;
}

export interface HESI_IGenData {
  legendData: string[];
  seriesData: {
    id: number;
    name: string;
    percent: number;
    value: number;
  }[];
  pieChartName: string;
  energyName: string;
  unit: string;
}

/**
 * 用能分项组件参数
 */
export interface HESI_CompParams {
  componentId: string | number;
  energyCode: string;
  treeId: number | null;
}
/**
 * 查询参数
 */
export interface HESI_IQueryParams extends HESI_CompParams {
  hospitalCodeList: string[];
  wholeHospitalFlag: boolean;
}

export interface HESI_IFlag {
  flag: boolean;
  msg: string;
}
