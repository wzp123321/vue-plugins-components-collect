export default class UpdateRoleGroupVORequest {
	/**
	 * 角色分组id等于
	 * 要重命名的角色分组id等于
	 */
	idEq: string = '';
	// 新角色分组名称等于
	roleGroupNameEq: string = '';
	// 最终放入的角色分组id
	parentRoleGroupIdEq: string = '';
}