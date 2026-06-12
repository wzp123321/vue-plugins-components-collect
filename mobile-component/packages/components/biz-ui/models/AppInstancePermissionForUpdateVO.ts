import DataPermissionTypeForUpdateVO from './DataPermissionTypeForUpdateVO';
export default class AppInstancePermissionForUpdateVO {
  // 应用实例ID
  appInstanceId: string = '';
  // 是否加载过权限
  loaded: Nullable<boolean>;
  // 权限ID列表
  privilegeIds: Nullable<string[]>;
  // 数据权限
  dataPermissionTypes: Nullable<DataPermissionTypeForUpdateVO[]>;
}
