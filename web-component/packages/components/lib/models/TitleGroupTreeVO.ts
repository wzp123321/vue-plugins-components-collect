// 职务分组树对象
export default class TitleGroupTreeVO {
	// 职务分组ID
	groupId: string = '';
	// 职务分组名称
	groupName: string = '';
	// 职务分组子节点
	childTitleGroup: Nullable<TitleGroupTreeVO[]>;
}