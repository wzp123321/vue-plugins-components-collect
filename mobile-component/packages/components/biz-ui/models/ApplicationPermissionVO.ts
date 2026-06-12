import DataPermissionTypeVO from './DataPermissionTypeVO';
import PermissionGroupVO from './PermissionGroupVO';
// 应用权限
export default class ApplicationPermissionVO {
  // 应用ID
  applicationId: Nullable<string>;
  /**
   * 数据范围
   * 数据权限
   */
  dataPermission: Nullable<DataPermissionTypeVO[]>;
  // 功能权限组
  permissionGroup: Nullable<PermissionGroupVO[]>;
}
