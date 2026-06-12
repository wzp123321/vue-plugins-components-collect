import DataPermissionCheck from './DataPermissionCheck';
export default class LocationDetailQueryRequestDTO {
  // 数据id
  ids: string[] = [];
  // 数据权限检验
  dataPermissionCheck: Nullable<DataPermissionCheck>;
}
