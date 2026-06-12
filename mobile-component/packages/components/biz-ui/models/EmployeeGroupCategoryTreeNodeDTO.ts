export default class EmployeeGroupCategoryTreeNodeDTO {
	// 类别ID
	id: string = '';
	// 类别名称
	name: string = '';
	// 是否有下属类别
	hasChildren: Nullable<boolean>;
	// 直属下级类别树节点
	children: Nullable<EmployeeGroupCategoryTreeNodeDTO[]>;
	// 能否能删除
	deletable: Nullable<boolean>;
}