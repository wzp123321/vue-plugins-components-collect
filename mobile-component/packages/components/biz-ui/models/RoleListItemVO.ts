export default class RoleListItemVO {
	// 角色id
	id: Nullable<string>;
	// 角色分组id
	groupId: Nullable<string>;
	// 角色名称
	name: Nullable<string>;
	// 关联应用名称
	applicationNames: Nullable<string[]>;
	/**
	 * 生效日期
	 * 时间戳
	 */
	effectiveDate: Nullable<number>;
	/**
	 * 到期日期
	 * 时间戳
	 */
	expiryDate: Nullable<number>;
	// 禁用状态
	disabled: Nullable<boolean>;
	// 描述
	description: Nullable<string>;
}