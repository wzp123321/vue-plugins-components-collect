export enum ProcessNodeTypeEnum {
	// 开始节点
	START_EVENT = 'START_EVENT',
	// 任务节点
	USER_TASK = 'USER_TASK',
	// 互斥网关（条件分支节点）
	EXCLUSIVE_GATEWAY = 'EXCLUSIVE_GATEWAY',
	// 并行网关（并行分支节点）
	PARALLEL_GATEWAY = 'PARALLEL_GATEWAY',
	// 指定分支节点
	APPOINT_GATEWAY = 'APPOINT_GATEWAY',
	// 分支（线）
	SEQUENCE_FLOW = 'SEQUENCE_FLOW',
	// 结束节点
	END_EVENT = 'END_EVENT',
	// 外部流程节点
	OUTER_FLOW = 'OUTER_FLOW',
}