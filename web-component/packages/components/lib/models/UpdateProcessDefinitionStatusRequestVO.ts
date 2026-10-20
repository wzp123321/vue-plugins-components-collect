import { ProcessDefinitionStatusEnum } from './ProcessDefinitionStatusEnum';
export default class UpdateProcessDefinitionStatusRequestVO {
	// 流程定义id
	processDefinitionId: Nullable<string>;
	// 流程定义状态
	status: Nullable<ProcessDefinitionStatusEnum>;
}