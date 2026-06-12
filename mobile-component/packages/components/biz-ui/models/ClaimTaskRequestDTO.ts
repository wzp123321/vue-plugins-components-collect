export default class ClaimTaskRequestDTO {
	// 任务实例id
	taskInstanceId: Nullable<string>;
	// 领取任务的员工id（无Authorization时必填）
	employeeId: Nullable<string>;
	// 请求幂等性标识，requestId不变代表是同一次请求的重试
	requestId: Nullable<string>;
	// 需要传入的参数
	paramMap: any;
}