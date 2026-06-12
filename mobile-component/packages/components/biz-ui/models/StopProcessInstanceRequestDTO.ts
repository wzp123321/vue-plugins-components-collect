export default class StopProcessInstanceRequestDTO {
	// 流程实例id
	processInstanceId: Nullable<string>;
	// 请求幂等性标识，requestId不变代表是同一次请求的重试
	requestId: Nullable<string>;
	// 终止流程实例的原因
	reason: Nullable<string>;
}