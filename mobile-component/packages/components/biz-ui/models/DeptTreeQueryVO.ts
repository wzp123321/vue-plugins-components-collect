export default class DeptTreeQueryVO {
	// 上级节点id
	parentId: Nullable<string>;
	// 关键词（部门名称/编码）
	keyword: Nullable<string>;
	// 是否包含详细信息
	includeDetail: Nullable<boolean>;
}