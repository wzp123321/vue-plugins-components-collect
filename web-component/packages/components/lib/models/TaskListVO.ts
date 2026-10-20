import CodeName from './CodeName';
import IdName from './IdName';
import UiActionDefinition from './UiActionDefinition';
export default class TaskListVO {
	// 任务实例id
	taskInstanceId: Nullable<string>;
	// 流程实例id
	processInstanceId: Nullable<string>;
	// 任务标题
	summary: Nullable<string>;
	// 任务描述
	description: Nullable<string>;
	// 业务应用
	appInstance: Nullable<IdName>;
	// 业务分类
	businessCategory: Nullable<CodeName>;
	// 截止时间时间戳
	dueDate: Nullable<number>;
	// 基于业务分类注册的PC端任务详情页面界面动作
	taskDetailUiAction: Nullable<UiActionDefinition>;
	// 创建人id
	creatorId: Nullable<string>;
	// 创建人名称
	creatorName: Nullable<string>;
	// 创建时间时间戳
	createTime: Nullable<number>;
}