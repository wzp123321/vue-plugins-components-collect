export default class AuthorizationRuleGroupTreeNodeVO {
	// 权限规则分组id
	ruleGroupId: Nullable<string>;
	// 权限规则分组名称
	ruleGroupName: Nullable<string>;
	// 父权限规则分组孩子结点
	childNodes: Nullable<AuthorizationRuleGroupTreeNodeVO[]>;
}