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
export interface ITCheckListItem {
  [key: string]: any;
}

/**
 * 不同类型--状态存储
 */
export interface Ct_IStatusMap {
  // 关联状态
  strictlyFlag: boolean;
  // 选中列表
  checkedList: number[];
  // 展开列表
  expandedKeys: number[];
}

export interface TransferTabsItem {
  title: string;
  data: [];
}
