export default class PermissionDTO {
	/**
	 * 权限ID
	 * 保证业务系统内唯一性，该值是可以用于checkPermission接口入参的
	 */
	permissionId: Nullable<string>;
	/**
	 * 权限名称
	 * 需要保证名称在组内的唯一性
	 */
	name: Nullable<string>;
}