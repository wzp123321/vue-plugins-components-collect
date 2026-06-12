export default class LabelGroupTreeNodeDTO {
	// 职务分组ID
	id: string = '';
	// 职务分组名称
	name: string = '';
	// 父级职务分组id
	parentId: string = '';
	// 
	hasChildren: Nullable<boolean>;
	children: Nullable<LabelGroupTreeNodeDTO[]>;
}