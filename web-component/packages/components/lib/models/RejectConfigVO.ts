export default class RejectConfigVO {
	// 驳回节点类型：backStep-上一步、appointNode-指定节点
	rejectType: Nullable<string>;
	// 驳回节点选择指定节点时，选中的节点id
	rejectNodeId: Nullable<string>;
}