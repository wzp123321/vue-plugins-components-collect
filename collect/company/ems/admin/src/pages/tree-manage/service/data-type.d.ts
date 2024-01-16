declare namespace TreeManageModule {
  /** 列表请求入参 start */
  interface GetTreeListParam {
    keyword: string;
    treeType: number | null;
    nodeType?: String;
  }
  /** 列表请求入参 end */

  /** 列表返回数据 start */
  interface TreeList {
    airConditionedArea: number;
    area: number;
    childTree: TreeList[];
    createTime: any;
    hospitalCode: string;
    id: number;
    parentId: number;
    parentIds: string;
    peopleNumber: number;
    treeLeaf: number;
    treeLevel: number;
    treeName: string;
    treeNames: string;
    treeSort: number;
    treeType: number;
    updateTime: any;
  }
  /** 列表返回数据 end */

  /** 详情返回数据 start */
  interface TreeDetail {
    id: string | null;
    treeName: string;
    parentId: number | null;
    hospitalCode: any;
    peopleNumber: number | null;
    airConditionedArea: number | null;
    area: number | null;
    treeType: number | null;
    treeSort: number | null;
    createTime: any;
    updateTime: any;
  }
  /** 详情返回数据 end */

  /** 新增/编辑入参 start */
  interface TreeAddOrEditParam {
    id?: string | null;
    treeName: string;
    hospitalCode: string;
    parentId?: number | null;
    // airConditionedArea: number | null;
    // area: number | null;
    // peopleNumber: number | null;
    treeLeaf: number | null;
    treeSort: number | null;
    treeType?: number | null;
    treeLevel?: number | null;
    nodeType?: string;
  }
  /** 新增/编辑入参 end */
}
