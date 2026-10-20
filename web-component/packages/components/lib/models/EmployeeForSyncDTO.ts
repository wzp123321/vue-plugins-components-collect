export default class EmployeeForSyncDTO {
	// 员工ID
	employeeId: Nullable<string>;
	// 关联的用户ID
	userId: Nullable<string>;
	/**
	 * 员工编码
	 * 用于Excel导入，请勿滥用
	 */
	code: Nullable<string>;
	// 姓名
	name: Nullable<string>;
	/**
	 * 禁用标记
	 * 是否禁用,0-启用,1-禁用
	 */
	disabled: Nullable<boolean>;
	// 所属租户ID
	tenantId: Nullable<string>;
	// 所属组织ID
	organizationId: Nullable<string>;
	// 所属部门ID
	departmentId: Nullable<string>;
	/**
	 * 删除标记
	 * 是否删除,0-未删除,1-已删除
	 */
	deleted: Nullable<boolean>;
	// 工号
	staffId: Nullable<string>;
	// 短号
	shortCode: Nullable<string>;
	// 手机号
	phone: Nullable<string>;
}