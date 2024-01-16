// 科室树
export interface DTSD_IDepartmentVO {
  id: number;
  treeName: string;
  treeLevel: number;
  treeLeaf: string;
  treeType: string;
  childTree?: DTSD_IDepartmentVO[];
}
// 选中的树信息
export interface DTSD_ISelectedTreeVO {
  /**
   * 指标ID
   */
  id: number;
  /**
   * 编码
   */
  code: string;
  /**
   * 名字
   */
  name: string;
  /**
   * 单位
   */
  unit: string;
}
// 节点选中事件返回值
export interface DTSD_ICheckedNodeVO {
  checkedKeys: number[];
  checkedNodes: DTSD_IDepartmentVO[];
  halfCheckedKeys: number[];
  halfCheckedNodes: DTSD_IDepartmentVO[];
}
// 树Props
export const DTSD_TREE_PROPS = {
  label: 'treeName',
  children: 'childTree',
};
// 节点唯一标识
export const DTSD_TREE_KEY = 'id';
