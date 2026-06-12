import RejectInfo from './RejectInfo';
import { ProcessActionCodeEnum } from './ProcessActionCodeEnum';
export default class ProcessAction {
	// 流程动作编码
	processActionCode: Nullable<ProcessActionCodeEnum>;
	// 驳回节点（当processActionCode为reject时必填）
	rejectInfo: Nullable<RejectInfo>;
}