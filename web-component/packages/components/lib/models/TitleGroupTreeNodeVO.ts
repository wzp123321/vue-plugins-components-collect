export default class TitleGroupTreeNodeVO {
	// 职务分组ID
	id: string = '';
	// 职务分组名称
	name: string = '';
	// 父级职务分组id
	parentId: string = '';
	// 乐观锁
	versionId: string = '';
	// 是否有下属职务分组
	hasChildren: Nullable<boolean>;
	// 直属下级职务分组
	children: Nullable<TitleGroupTreeNodeVO[]>;
	// 类型：0 职务分组 1 职务
	type: number = 0;
}