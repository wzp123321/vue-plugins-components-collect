export default class TitleGroupTreeNodeDTO {
	// 职务分组id
	id: Nullable<string>;
	// 职务分组名称
	name: Nullable<string>;
	// 父级职务分组id
	parentId: Nullable<string>;
	// 是否有下属职务分组
	hasChildren: Nullable<boolean>;
	// 直属下级职务分组
	children: Nullable<TitleGroupTreeNodeDTO[]>;
}