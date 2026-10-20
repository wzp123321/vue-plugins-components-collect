import AppInstancePermissionForUpdateVO from './AppInstancePermissionForUpdateVO';
export default class UpdateRoleAppInstancePermissionVORequest {
  // 角色ID 等于
  roleId: string = '';
  // 应用实例权限，用于更新
  appInstancePermissions: Nullable<AppInstancePermissionForUpdateVO[]>;
}
