/*
 * @Author: yut
 * @Date: 2023-08-14 19:29:15
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2023-11-16 10:06:57
 * @Descripttion:
 */
//表单
export interface IFormType {
  houseNumber: string;
  energyType: undefined | string;
  associatedNode: number[];
  hostingArea?: string;
  radioValue: string;
  hostingAreaName: string;
  id?: number;
  hostingFlag: string;
}

export enum EPath {
  获取关联节点树 = '/tenant/tree/listTreeByEnergyCode',
  获取所属托管区域 = '/tenantAccount/hostingAreaListByEnergyCode',
  新增户号 = '/tenantAccount/add',
  编辑户号 = '/tenantAccount/update',
  查询项目是否配置过平托 = '/projectManagement/queryHostingFlag',
}

// 是否平托
export enum HLU_EHostingType {
  是 = '1',
  否 = '2',
}

// 分析对象-treetype
export const treeTypeList = [
  { value: '1', label: '区域' },
  { value: '2', label: '业态' },
];

/**
 * 编辑或新增
 */
export enum EType {
  新增 = 'add',
  编辑 = 'edit',
}
