import IdName from './IdName';
export default class CreateProcessInstanceRequestDTO {
	// 流程定义key
	processDefinitionKey: Nullable<string>;
	// 请求幂等性标识，requestId不变代表是同一次请求的重试
	requestId: Nullable<string>;
	// 业务键值
	businessKey: Nullable<string>;
	// 表单控件内容
	formMap: any;
	// 发起流程需要传入的业务字段/流程引擎预留字段参数
	paramMap: any;
	// 流程发起人（用户），当无Authorization时必填，用于系统自动发起流程的场景
	starter: Nullable<IdName>;
	// 任务标题，会在待办列表展示，需基于业务分类合理填写
	taskSummary: Nullable<string>;
	// 任务描述，会在待办列表展示，需基于业务分类合理填写
	taskDescription: Nullable<string>;
}