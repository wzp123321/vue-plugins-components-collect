export default class UpdateRoleBasicInfoVORequest {
	// 角色id
	id: string = '';
	// 角色名
	name: string = '';
	// 角色描述
	description: Nullable<string>;
	// 生效日期,时间戳
	effectiveDate: Nullable<number>;
	// 到期日期,时间戳
	expiryDate: Nullable<number>;
	// 角色分组
	groupId: string = '';
	// 是否禁用
	disabled: boolean = false;
}