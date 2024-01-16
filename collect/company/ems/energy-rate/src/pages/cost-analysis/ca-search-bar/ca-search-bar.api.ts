import { Common_IHospital } from '../../../services/api';

export interface CA_SB_ISearchForm {
  treeIdList: number[];
  date: Date[];
}
//  查询树列表入参
export interface CA_SB_IQueryTreeParams extends Common_IHospital {
  energyCode: string;
  expandLevel: number;
  treeType: number;
}
// 树模型列表
export interface CA_SB_ITreeRes {
  expandTreeIds: number[];
  data: CA_SB_ITreeVO[];
}
// 树模型
export interface CA_SB_ITreeVO {
  id: number;
  nodeType: string;
  parentId: number;
  selectable: boolean;
  treeLeaf: string;
  treeLevel: number;
  treeName: string;
  treeSort: number;
  treeType: string;
  lockFlag: boolean;
  childTree: CA_SB_ITreeVO[];
}
// 树节点最大选中数
export const CA_SB_MAX_TREE_CHECKED = 20;
