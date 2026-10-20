// 操作权限
export default class PermissionVO {
	/**
	 * 操作权限名称
	 * 标签
	 */
	label: Nullable<string>;
	/**
	 * 操作权限值
	 * 标识值
	 */
	value: Nullable<string>;
	/**
	 * 是否选中
	 * 1选中，0未选中
	 */
	checked: Nullable<number>;
}