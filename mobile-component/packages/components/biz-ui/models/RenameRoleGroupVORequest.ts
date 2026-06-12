// 重命名角色分组请求
export default class RenameRoleGroupVORequest {
	/**
	 * 角色分组id等于
	 * 要重命名的角色分组id等于
	 */
	idEq: Nullable<string>;
	// 新角色分组名称等于
	newNameEq: Nullable<string>;
}