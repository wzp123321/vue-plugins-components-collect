export default class DepartmentManagerDetailDTO {
	// 作为部门主管的员工ID
	id: Nullable<string>;
	// 作为部门主管的员工姓名
	name: Nullable<string>;
	/**
	 * 是否禁用
	 * false:启用的, true:禁用的
	 */
	disabled: Nullable<boolean>;
}