export default class DepartmentManagerDetailQd {
	/**
	 * 员工ID 等于
	 * 查询该员工的部门主管，注意这个ID不是作为主管的员工ID
	 */
	employeeIdEq: Nullable<string>;
	// 组织ID 等于
	orgIdEq: Nullable<string>;
	/**
	 * 用户ID 等于
	 * 使用该参数时，组织ID不能为空
	 */
	userIdEq: Nullable<string>;
}