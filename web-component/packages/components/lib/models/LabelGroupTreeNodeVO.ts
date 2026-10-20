export default class LabelGroupTreeNodeVO {
	// 职务分组ID
	id: string = '';
	// 职务分组名称
	name: string = '';
	// 父级职务分组id
	parentId: string = '';
	// 乐观锁
	versionId: string = '';
	// 是否有下属标签
	hasChildren: Nullable<boolean>;
	// 直属下级标签分组
	children: Nullable<LabelGroupTreeNodeVO[]>;
	// 类型：0 标签分组 1 标签
	type: number = 0;
	// 能否修改
	editable: Nullable<boolean>;
	// 能否删除
	deletable: Nullable<boolean>;
}