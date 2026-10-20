export default class UserEmployeeForSyncDTO {
	// 登录名
	loginName: Nullable<string>;
	// 用户ID
	userId: Nullable<string>;
	// 组织ID
	orgId: Nullable<string>;
	/**
	 * 组织类型
	 * MANAGER:管理方，SERVICE_PROVIDER:供应商，OPERATOR:运营商
	 */
	orgType: Nullable<string>;
	// 员工ID
	employeeId: Nullable<string>;
}