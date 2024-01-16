export enum RadioDataObject {
  区域 = 1,
  业态,
  支路,
}

export enum RG_ESelectType {
  平铺 = 'flat',
  树状 = 'tree',
}

/**
 * 树状数据
 */
export interface RG_ITreeItem {
  id: number;
  lockFlag: boolean | null;
  parentId: number;
  treeLeaf: string;
  treeLevel: number;
  treeName: string;
  childTree: RG_ITreeItem[];
}
