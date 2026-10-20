import RoleGroupIdNameVO from './RoleGroupIdNameVO';
export default class RoleBasicInfoVO {
  // 角色id
  id: Nullable<string>;
  // 角色名称
  name: Nullable<string>;
  // 角色描述
  description: Nullable<string>;
  // 生效日期,时间戳
  effectiveDate: Nullable<number>;
  // 到期日期,时间戳
  expiryDate: Nullable<number>;
  // 角色分组
  roleGroup: Nullable<RoleGroupIdNameVO>;
  // 是否禁用
  disabled: Nullable<boolean>;
}
