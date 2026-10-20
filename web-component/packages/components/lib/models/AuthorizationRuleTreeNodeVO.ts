export default class AuthorizationRuleTreeNodeVO {
	// 权限规则名称/权限规则组名称
	nodeName: Nullable<string>;
	// 权限规则id,为空则该结点为权限规则组
	ruleId: Nullable<string>;
	// 权限规则分组id,为空则该结点为权限规则
	ruleGroupId: Nullable<string>;
	// 权限规则树-子结点
	childNodes: Nullable<AuthorizationRuleTreeNodeVO[]>;
}