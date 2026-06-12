import PermissionGroupDTO from './PermissionGroupDTO';
export default class PermissionDefinitionDTO {
  /**
   * 权限组
   * 先定义权限组，再定义权限组内的操作权限
   */
  permissionGroup: Nullable<PermissionGroupDTO[]>;
}
