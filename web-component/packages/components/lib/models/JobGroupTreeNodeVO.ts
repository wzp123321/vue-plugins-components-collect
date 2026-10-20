export default class JobGroupTreeNodeVO {
	// 岗位分组ID
	id: string = '';
	// 岗位分组名称
	name: string = '';
	// 父级岗位分组id
	parentId: string = '';
	// 乐观锁
	versionId: string = '';
	// 是否有下属岗位
	hasChildren: Nullable<boolean>;
	// 直属下级岗位分组
	children: Nullable<JobGroupTreeNodeVO[]>;
	// 类型：0 岗位分组 1 岗位
	type: number = 0;
}