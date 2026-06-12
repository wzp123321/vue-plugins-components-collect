import ApplicationPermissionVO from './ApplicationPermissionVO';
import RoleBasicInfoVO from './RoleBasicInfoVO';
import RoleSettingVO from './RoleSettingVO';
// 角色详情
export default class RoleDetailVO {
  // 角色基本信息
  roleBasicInfo: Nullable<RoleBasicInfoVO>;
  // 授权对象
  groupMemberRoleAssignment: any;
  // 应用权限
  applicationPermission: Nullable<ApplicationPermissionVO[]>;
  // 其他设置
  roleSetting: Nullable<RoleSettingVO>;
}
