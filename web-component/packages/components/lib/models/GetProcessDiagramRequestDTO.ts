export default class GetProcessDiagramRequestDTO {
	// 流程实例id
	processInstanceId: Nullable<string>;
	// 返回值中需要包含的内容模块(instanceProgress)，不传则只返回基础信息
	fetchParts: Nullable<string[]>;
}