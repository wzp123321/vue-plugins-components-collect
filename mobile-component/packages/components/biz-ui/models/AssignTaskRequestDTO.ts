export default class AssignTaskRequestDTO {
	// 任务实例id
	taskInstanceId: Nullable<string>;
	// 任务要分配给的员工id
	assigneeId: Nullable<string>;
	// 请求幂等性标识，requestId不变代表是同一次请求的重试
	requestId: Nullable<string>;
	// 需要传入的参数
	paramMap: any;
}