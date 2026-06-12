import DataPermissionCheck from './DataPermissionCheck';

export default class ProjectSelectorStyleRequestDTO {
  // 应用实例id
  appInstanceId: Nullable<string>;
  // 数据权限作用域（如需过滤数据权限则必传）
  scopeCode: Nullable<string>;
  dataPermissionCheck: Nullable<DataPermissionCheck>;
}
