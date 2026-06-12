export default class AddAuthorizationRuleVORequest {
	// 位置（父权限规则分组id）
	parentRuleGroupId: Nullable<string>;
	// 关联应用（应用实例id）
	appInstanceId: Nullable<string>;
	// 权限规则名称
	ruleName: Nullable<string>;
}