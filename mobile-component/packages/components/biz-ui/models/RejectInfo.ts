import { RejectTypeEnum } from './RejectTypeEnum';
export default class RejectInfo {
	// 驳回节点类型
	type: Nullable<RejectTypeEnum>;
	// 驳回节点id
	nodeId: Nullable<string>;
}