export default class ProcessDiagramDTO {
	// 流程图绘制json
	diagramDrawingJson: Nullable<string>;
	// 当前已执行过的节点id列表，当fetchParts里传了instanceProgress才返回
	executedNodeIds: Nullable<string[]>;
}