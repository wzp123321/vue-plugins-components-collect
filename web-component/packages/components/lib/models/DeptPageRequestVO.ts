// 部门列表请求
export default class DeptPageRequestVO {
	// 父级节点id
	parentId: string = '';
	// 关键词（部门名称/编码）
	keyword: Nullable<string>;
	// 页码
	pageNum: number = 0;
	// 页面容量
	pageSize: number = 0;
}