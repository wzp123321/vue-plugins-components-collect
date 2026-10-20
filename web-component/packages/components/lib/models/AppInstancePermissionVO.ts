import DataPermissionTypeVO from './DataPermissionTypeVO';
import PrivilegeGroupVO from './PrivilegeGroupVO';
export default class AppInstancePermissionVO {
  // 应用实例id
  appInstanceId: Nullable<string>;
  // 操作权限组
  permissionGroups: Nullable<PrivilegeGroupVO[]>;
  // 数据权限类型
  dataPermissionTypes: Nullable<DataPermissionTypeVO[]>;
}
