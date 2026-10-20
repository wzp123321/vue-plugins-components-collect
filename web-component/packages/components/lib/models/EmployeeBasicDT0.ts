export default class EmployeeBasicDT0 {
	// 员工id
	employeeId: string = '';
	// 租户id
	tenantId: string = '';
	// 组织ID
	organizationId: string = '';
	// 用户Id
	userId: Nullable<string>;
	// 是否组织管理员 0:否 1:是
	isOrgAdmin: boolean = false;
	// 员工姓名
	name: string = '';
	// 联系方式（手机号）
	phone: string = '';
	// 工号
	workId: Nullable<string>;
	// 员工类型
	staffType: Nullable<number>;
	// 部门ID
	deptId: string = '';
	// 岗位ID
	jobId: Nullable<string>;
	// 职务ID
	titleId: Nullable<string>;
	// 直属上级
	superiorId: Nullable<string>;
	// 办公固话
	officeCall: Nullable<string>;
	// 短号
	cornet: Nullable<string>;
}