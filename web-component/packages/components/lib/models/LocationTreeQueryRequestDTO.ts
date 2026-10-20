import DataPermissionCheck from './DataPermissionCheck';
export default class LocationTreeQueryRequestDTO {
  // 选中节点id
  idEq: Nullable<string>;
  // 向下查询层级数
  levels: Nullable<string>;
  // 返回模糊查询后的整棵树
  nameLike: Nullable<string>;
  // 院区ids
  projectIdIn: Nullable<string[]>;
  // 数据权限request
  dataPermissionCheck: Nullable<DataPermissionCheck>;
}
