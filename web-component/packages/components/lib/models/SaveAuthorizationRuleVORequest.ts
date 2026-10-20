export default class SaveAuthorizationRuleVORequest {
	// 规则ID
	ruleId: Nullable<string>;
	// 生效日期,形如 yyyy-MM-dd
	effectiveDate: Nullable<string>;
	// 到期日期,形如 yyyy-MM-dd
	expirationDate: Nullable<string>;
	// 选中部门ID列表
	departmentIds: Nullable<string[]>;
	// 选中职位ID列表
	titleIds: Nullable<string[]>;
	// 选中岗位ID列表
	jobIds: Nullable<string[]>;
	// 选中标签ID列表
	tagIds: Nullable<string[]>;
	// 选中员工ID列表
	employeeIds: Nullable<string[]>;
	// 数据范围ID映射选中数据范围元素ID列表
	dataRangeMap: any;
	// 选中功能权限ID列表
	permissionIds: Nullable<string>;
}