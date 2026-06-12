import DataPermissionCheck from './DataPermissionCheck';
export default class LocationV2FuzzyRequestDTO {
  // 模糊查询name
  nameLike: Nullable<string>;
  // 待筛选的院区id
  projectIn: Nullable<string[]>;
  // 数据权限校验
  dataPermissionCheck: Nullable<DataPermissionCheck>;
}
