export default class EmployeeOrgDTO {
	// 员工ID
	employeeId: Nullable<string>;
	// 组织ID
	organizationId: Nullable<string>;
	// 组织名称
	organizationName: Nullable<string>;
	// 组织类型名称
	organizationTypeName: string = '';
}