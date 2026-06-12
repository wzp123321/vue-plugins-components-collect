import ActionInfo from './ActionInfo';
import CodeName from './CodeName';
import FormExtraInfo from './FormExtraInfo';
import IdName from './IdName';
import WriteBackFieldInfo from './WriteBackFieldInfo';
export default class TaskDetailDTO {
	// 任务实例id
	taskInstanceId: Nullable<string>;
	// 任务标题
	summary: Nullable<string>;
	// 任务描述
	description: Nullable<string>;
	// 备注
	comment: Nullable<string>;
	// 业务应用
	appInstance: Nullable<IdName>;
	// 业务分类
	businessCategory: Nullable<CodeName>;
	// 业务键值
	businessKey: Nullable<string>;
	// 截止时间
	dueDate: Nullable<Date>;
	// 执行人
	assignee: Nullable<IdName>;
	// 抄送人
	ccs: Nullable<IdName[]>;
	// 是否是平台流程引擎创建的任务
	workflowTask: Nullable<boolean>;
	// 是否由当前节点执行人去指定下一个节点的操作人
	appointNextOperator: Nullable<boolean>;
	// 流程实例
	processInstance: Nullable<IdName>;
	// 流程定义key
	processDefinitionKey: Nullable<string>;
	// 任务动作信息
	actionInfo: Nullable<ActionInfo>;
	// 表单附加信息
	formExtraInfo: Nullable<FormExtraInfo>;
	// 回写字段信息
	writeBackFields: Nullable<WriteBackFieldInfo[]>;
}