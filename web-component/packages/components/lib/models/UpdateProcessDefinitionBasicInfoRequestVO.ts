export default class UpdateProcessDefinitionBasicInfoRequestVO {
	// 流程定义id
	processDefinitionId: Nullable<string>;
	// 流程定义名称（最大字符≤100）
	processDefinitionName: Nullable<string>;
	// 流程定义描述（最大字符≤200）
	processDefinitionDesc: Nullable<string>;
	// 关联表单定义id列表（关联表单数≤10）
	formDefinitionIds: Nullable<string[]>;
}