export default class TaskProgressVO {
	// 任务ID
	taskId: string = '';
	// 任务类型
	taskType: Nullable<string>;
	// 总数量
	total: Nullable<number>;
	// 成功的数量
	success: Nullable<number>;
	// 忽略的数量
	ignored: Nullable<number>;
	// 失败的数量
	failed: Nullable<number>;
	// 进度百分比（单位：%）
	percent: Nullable<string>;
	// 是否已执行完成：true-已完成、false-未完成
	complete: Nullable<boolean>;
	// 任务执行失败原因
	errorMessage: Nullable<string>;
}