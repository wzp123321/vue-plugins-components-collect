/*
 * @Author: yut
 * @Date: 2024-01-02 10:42:59
 * @LastEditors: yut
 * @LastEditTime: 2024-01-04 09:15:32
 * @Descripttion:
 */
export enum Common_ERadioData {
  区域 = 1,
  业态,
  支路,
}

export enum Common_ETransferType {
  列表 = 'list',
  树状 = 'tree',
}

export enum Common_EStrictlyStatus {
  联选 = '1',
  任选 = '2',
}

/**
 * 树状数据
 */
export interface Common_ITreeItem {
  id: number;
  lockFlag: boolean | null;
  parentId: number;
  treeLeaf: string;
  treeLevel: number;
  treeName: string;
  childTree: Common_ITreeItem[];
}

export interface Common_IListDataType {
  label: string;
  id: number;
  value: string;
  concentratorId: number;
  concentratorName: string | null;
  deviceTypeCode: string;
  logicNumber: number;
  address: number;
  location: string;
  serialNo: string;
  comStatus: string;
  parentId: number;
  parentName: string | null;
  level: number;
  systemCategory: string;
  systemCategoryName: string;
}

/**
 * 已选的列表
 */
export interface Common_ICheckListItem {
  label: string;
  value: string | number;
  id: number;
}
