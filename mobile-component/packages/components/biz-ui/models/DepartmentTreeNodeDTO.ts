export default class DepartmentTreeNodeDTO {
	// 部门id
	id: Nullable<string>;
	// 部门名称
	name: Nullable<string>;
	// 上级部门id
	parentId: Nullable<string>;
	// 是否有下属部门
	hasChildren: Nullable<boolean>;
	// 直属下级部门
	children: Nullable<DepartmentTreeNodeDTO[]>;
}