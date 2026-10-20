import { ProcessDefinitionStatusEnum } from './ProcessDefinitionStatusEnum';
export default class ProcessDefinitionListDTO {
	// 流程定义key
	processDefinitionKey: Nullable<string>;
	// 流程定义名称
	processDefinitionName: Nullable<string>;
	// 流程定义状态
	status: Nullable<ProcessDefinitionStatusEnum>;
	// 流程定义版本
	version: Nullable<string>;
}