import CodeName from './CodeName';
import FormDefinitionSimpleInfo from './FormDefinitionSimpleInfo';
import IdName from './IdName';
export default class ProcessDefinitionBasicInfoVO {
	// 流程定义id
	processDefinitionId: Nullable<string>;
	// 流程定义key
	processDefinitionKey: Nullable<string>;
	// 流程定义名称
	processDefinitionName: Nullable<string>;
	// 流程定义描述
	processDefinitionDesc: Nullable<string>;
	// 产品模块id
	productId: Nullable<string>;
	// 业务应用
	appInstance: Nullable<IdName>;
	// 业务分类
	businessCategory: Nullable<CodeName>;
	// 关联表单列表（关联表单数≤10）
	formDefinitions: Nullable<FormDefinitionSimpleInfo[]>;
}