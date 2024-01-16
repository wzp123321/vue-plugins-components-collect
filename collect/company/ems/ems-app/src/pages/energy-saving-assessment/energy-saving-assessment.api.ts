/*
 * @Author: yut
 * @Date: 2023-10-26 10:04:15
 * @LastEditors: yut
 * @LastEditTime: 2023-12-25 17:09:12
 * @Descripttion:
 */
export enum ESA_EDateType {
  本月 = '1',
  本年 = '2',
}

/**
 * 状态对应的颜色
 */
export enum ESA_EStatusColor {
  盈余 = 'rgb(82, 196, 26)',
  警告 = 'rgb(250, 140, 22)',
  超支 = 'rgb(245, 34, 45)',
}

/**
 * 状态
 */
export enum ESA_EStatus {
  盈余 = '1',
  警告 = '2',
  超支 = '3',
}

/**
 * 日期格式
 */
export enum ESA_EFieldType {
  本月 = 'month',
  本年 = 'year',
}

/**
 * url
 */
export enum EPath {
  获取KPI列表 = '/app/saveEnergy/querySaveEnergyCardList',
  查询详细信息 = '/app/saveEnergy/querySaveEnergyDetailVO',
}

export interface ESA_IEnergyType {
  energyName: string;
  parent: number;
  status: string;
}

export interface ESA_INavigatorStyle {
  color: string;
  backgroundColor: string;
}

/**
 * 页面跳转所带参数
 */
export interface ESA_IDetailParam {
  treeId: number | null;
  treeType: string;
  quotaDate: string;
  energyCode: string;
  quotaType: string;
}

/**
 * 详细信息查询参数
 */
export interface ESA_ISearchParam {
  quotaType: string; //时间类型：本月:1、本年:2
  quotaTime: string; //时间
  treeId: string; //树节点类型 1区域、2业态
  energyCode: string; //分类分项编码
}

/**
 * 详细信息
 */
export interface ESA_IDetailInfo {
  treeName: string; //树节点名称
  treePath: string; //树节点路径
  energyName: string; //分类分项名称
  energyCode: string; //分类分项code
  unit: string; //单位
  waringInfo: string; //盈余，警告，超标
  waringCode: string; //盈余，警告，超标
  suggest: string; //建议
  percentValue: number; //百分比
  quotaValue: number; //定额值
  energyValue: number; //能耗值
  savingValue: number; //节能量
  savingCost: number; //节约成本
}
