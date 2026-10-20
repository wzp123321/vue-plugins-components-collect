import AuthSubjectTypeForUpdateVO from './AuthSubjectTypeForUpdateVO';
export default class UpdateRoleAuthSubjectVORequest {
  // 角色id
  roleId: string = '';
  // 授权对象类型
  authorizedSubjectType: Nullable<AuthSubjectTypeForUpdateVO[]>;
}
