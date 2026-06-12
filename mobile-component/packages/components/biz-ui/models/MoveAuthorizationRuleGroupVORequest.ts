export default class MoveAuthorizationRuleGroupVORequest {
	// 权限规则分组id
	ruleGroupId: Nullable<string>;
	// 目标位置（父权限规则分组id）
	parentRuleGroupId: Nullable<string>;
}