// 岗位分组树对象
export default class JobGroupTreeVO {
	// 岗位分组ID
	groupId: string = '';
	// 岗位分组名称
	typeName: string = '';
	// 岗位分组子节点
	childJobGroup: Nullable<JobGroupTreeVO[]>;
}