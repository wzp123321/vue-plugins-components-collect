/*
 * @Author: yut
 * @Date: 2023-08-10 09:47:05
 * @LastEditors: yut
 * @LastEditTime: 2023-11-09 19:42:53
 * @Descripttion:
 */
export enum EUrlPath {
  维护项目信息 = '/tenant-toc/projectManage/view',
  维护户号 = '/tenant-toc/householdNumberManagement',
  完成能耗预算全期表 = '/tenant-toc/maAnnualDetails',
  录入户号数据 = '/tenant-toc/householdNumberManagement',
  完成能耗预算表 = '/tenant-toc/energyConsumptionBudget',
  跟踪能耗管控看板 = '/tenant-toc/energyConsumptionControl',

  能耗预算表 = '/tenant-toc/energyConsumptionBudget',
  户号管理 = '/tenant-toc/householdNumberManagement',
  节能量管理 = '/tenant-toc/energySavingManagement',
  边界管理 = '/tenant-toc/boundaryManagement',
  能耗预核算偏差 = '/tenant-toc/energyAccountingDeviation',
  能耗核算 = '/tenant-toc/energyConsumptionAccounting',

  项目预算表 = '/tenant-toc/projectBudget',
  项目预核算偏差 = '/tenant-toc/costPreAccountingDeviation',
  经营分析 = '/tenant-toc/maHome',
  项目核算表 = '/tenant-toc/projectAccounting',
  项目信息 = '/tenant-toc/projectManage/view',
}
export enum EUrlName {
  维护项目信息 = '项目信息',
  维护户号 = '户号管理',
  完成能耗预算全期表 = '能耗预算全期表',
  录入户号数据 = '户号管理',
  完成能耗预算表 = '能耗预算表',
  跟踪能耗管控看板 = '能耗总览',

  能耗预算表 = '能耗预算表',
  户号管理 = '户号管理',
  节能量管理 = '节能量管理',
  边界管理 = '边界管理',
  能耗预核算偏差 = '能耗预核算偏差',
  能耗核算 = '能耗核算',

  项目预算表 = '项目预算表',
  项目预核算偏差 = '项目预核算偏差',
  经营分析 = '经营总览',
  项目核算表 = '项目核算表',
  项目信息 = '项目信息',
}

export interface IWiContentData {
  subTitle: string; //标题
  description: string; //描述
  img: string; //图片
  url: string; //url
  showTag?: boolean;
  id: string;
}
/**
 * 项目信息
 */
export interface IProjectInfo {
  timeRange: string; //托管周期
  energyRange: string; //能源类型
  hostingTypeName: string; //托管类型
  riskRatingName: string; //项目风险评级
  benchmarkType: string; //基准类型
  profit: string; //收益分享
  accessed: boolean; //是否有权限
}

export interface CC_MENU_IMenuItem {
  id: number;
  name: string;
  url: string;
  iframeFlag: number;
  accessed: boolean;
  children: Array<CC_MENU_IMenuItem>;
}

export enum EPath {
  获取项目信息 = '/projectManagement/queryNavigationProjectInfo',
  用户最近访问菜单 = '/menu/queryUserRecentlyAccessedMenu',
  获取导航菜单 = '/menu/navigationMenu',
}

export enum WI_MENU_ID {
  能耗分析3x = '31',
  能耗分析2x = '47',
  节能考核 = '53',
  能源事件2x = '22',
  能源事件3x = '46',
  能源助手2x = '32',
  能源助手3x = '48',
  工作计划 = '33',
  工作记录 = '23',
  告警管理2x = '20',
  告警管理3x = '45',
  经营分析 = '21',
  月度明细表 = '28',
  成本补录 = '51',
  能耗预核算偏差 = '59',
  成本预核算偏差 = '56',
  能耗管控 = '57',
  户号管理 = '24',
  节能量管理 = '62',
  边界管理 = '61',
  节能项目管理 = '29',
  用户数据录入 = '25',
  能耗预算 = '58',
  能耗预算表 = '55',
  能耗预算全期表 = '26',
  文件管理 = '60',
  工单分析 = '40',
  项目信息 = '19',
  能耗核算表 = '102',
  快捷访问 = '101',
  工作指引 = '100',
  项目预算表 = '63',
  项目核算表 = '64',
}

export const enum WI_EJumpType {
  cloud, // 云端本地跳转
  terminal, // 端侧跳转
}

export interface WI_INavigationMenu {
  prepareWork: WI_IMenuItem[];
  energyCheck: WI_IMenuItem[];
  energyControl: WI_IMenuItem[];
  projectCheck: WI_IMenuItem[];
}

export interface WI_IMenuItem {
  id: number;
  name: string;
  url: string;
  iframeFlag: number;
  accessed: boolean;
  showName: string;
  description: string;
  img?: string;
  showTag?: boolean;
}
