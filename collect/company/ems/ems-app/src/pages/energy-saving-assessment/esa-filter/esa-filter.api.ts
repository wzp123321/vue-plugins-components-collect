/*
 * @Author: yut
 * @Date: 2023-12-07 09:58:55
 * @LastEditors: yut
 * @LastEditTime: 2023-12-11 17:36:08
 * @Descripttion:
 */
export enum Esa_FilterEPath {
  节能考核根据树节点ID查询子节点列表 = '/app/common/energyCheck/queryChildrenNodeList',
}

/**
 * 定额类型
 */
export enum ESA_EQuotaType {
  月 = '1',
  年 = '2',
}

/**
 * 查询参数
 */
export interface Esa_IQueryChildTreeParams {
  hospitalCodeList: string[]; //院区
  wholeHospitalFlag: boolean; //是否全院标志位
  energyCode: string; //能源类型
  treeType: string; //树类型
  quotaType: string; //定额类型
  quotaDate: string; //定额时间
  treeId?: number | null; //父节点id 顶级节点parentId=0
  keyword: string; //模糊查询关键字
  menuId: number; //菜单id 存储模糊查询关键字时使用
  userId: number | null; //菜单id 存储模糊查询关键字时使用
}

export interface Esa_TreeList {
  /**
   * 树节点ID
   */
  id: number;
  /**
   * 树节点名字
   */
  treeName: string;
  /**
   * 全节点名
   */
  treeLevel: string;
  /**
   * 是否可点击
   */
  clickStatus: boolean;
  /**
   * 子节点
   */
  childTree: Esa_TreeList[];
}
