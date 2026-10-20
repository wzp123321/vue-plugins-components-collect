import CodeName from './CodeName';
import IdName from './IdName';
import StandardEntity from './StandardEntity';
import { ProcessDefinitionStatusEnum } from './ProcessDefinitionStatusEnum';
export default class ProcessDefinitionListVO extends StandardEntity {
	// 流程定义id
	processDefinitionId: Nullable<string>;
	// 流程定义key
	processDefinitionKey: Nullable<string>;
	// 流程定义名称
	processDefinitionName: Nullable<string>;
	// 流程定义描述
	processDefinitionDesc: Nullable<string>;
	// 业务应用
	appInstance: Nullable<IdName>;
	// 业务分类
	businessCategory: Nullable<CodeName>;
	// 流程定义版本
	version: Nullable<string>;
	// 流程定义状态
	status: Nullable<ProcessDefinitionStatusEnum>;
}