import ApplicationPermissionFormVO from './ApplicationPermissionFormVO';
import RoleBasicInfoVO from './RoleBasicInfoVO';
import RoleSettingVO from './RoleSettingVO';
export default class AddRoleVORequest {
  // 角色基本信息
  roleBasicInfo: Nullable<RoleBasicInfoVO>;
  // 授权对象
  authorization: any;
  // 应用权限
  applicationPermission: Nullable<ApplicationPermissionFormVO[]>;
  // 其他设置
  roleSetting: Nullable<RoleSettingVO>;
}
