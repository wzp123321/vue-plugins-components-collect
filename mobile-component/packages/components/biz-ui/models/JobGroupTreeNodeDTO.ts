export default class JobGroupTreeNodeDTO {
	// 岗位分组id
	id: Nullable<string>;
	// 岗位分组名称
	name: Nullable<string>;
	// 父级岗位分组id
	parentId: Nullable<string>;
	// 是否有下属岗位分组
	hasChildren: Nullable<boolean>;
	// 直属下级岗位分组
	children: Nullable<JobGroupTreeNodeDTO[]>;
}