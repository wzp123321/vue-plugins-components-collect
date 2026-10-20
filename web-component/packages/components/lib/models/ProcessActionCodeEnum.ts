export enum ProcessActionCodeEnum {
	// 下一步
	NEXT_STEP = 'NEXT_STEP',
	// 终止
	TERMINATE = 'TERMINATE',
	// 驳回
	REJECT = 'REJECT',
	// 转交
	HAND_OVER = 'HAND_OVER',
	// 撤销
	CANCEL = 'CANCEL',
	// 无流程动作
	DO_NOTHING = 'DO_NOTHING',
	// 抢单
	GRAB_ORDER = 'GRAB_ORDER'
}