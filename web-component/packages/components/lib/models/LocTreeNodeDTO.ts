import TreeNode from './TreeNode';
export default class LocTreeNodeDTO extends TreeNode {
  // 名称
  name: Nullable<string>;
  // 空间类型：PROJECT-项目；BUILDING-建筑；FLOOR-楼层；ROOM-房间
  locType: Nullable<string>;
  /**
   * 是否包含子节点
   * 不能根据children.size判断，因为懒加载查询时children.size为null
   */
  hasChildren: Nullable<boolean>;
}
