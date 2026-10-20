import WriteBackFieldInfo from './WriteBackFieldInfo';
export default class TaskBriefDTO {
	// 任务实例id
	taskInstanceId: Nullable<string>;
	// 任务标题
	summary: Nullable<string>;
	// 任务描述
	description: Nullable<string>;
	// 回写字段信息
	writeBackFields: Nullable<WriteBackFieldInfo[]>;
}