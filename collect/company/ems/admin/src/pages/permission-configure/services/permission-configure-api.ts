/**
 * @param areaTree 区域树
 * @param formatTree 业态树
 * @param branchTree 支路树
 * @param choosedTreeIdList4AreaTree 选中的区域树id集合
 * @param choosedTreeIdList4FormatTree 选中的业态树id集合
 * @param choosedTreeIdList4BranchTree 选中的支路树id集合
 */
export interface PermissionConfigureVO {
  areaTree: TreeVO[];
  formatTree: TreeVO[];
  branchTree: TreeVO[];
  choosedTreeIdList4AreaTree: number[];
  choosedTreeIdList4FormatTree: number[];
  choosedTreeIdList4BranchTree: number[];
}

export interface TreeVO {
  id: number;
  treeName: string;
  childTree: TreeVO[];
  autoGenerated: null;
  hospitalCode: string;
  hospitalName: string;
  lockFlag: boolean;
  nodeType: string;
  nodeTypeText: string;
  parentId: number;
  parentIds: string;
  treeLeaf: number;
  treeLevel: number;
  treeNames: string;
  treeSort: number;
  treeType: string;
}

/**
 * 编辑入参
 */
export interface PermissionUpdateParams {
  roleCode: string;
  roleAreaTreeIds: number[];
  roleBusinessTreeIds: number[];
  roleBranchTreeIds: number[];
}
