export default class DepartmentForSyncDTO {
	// 部门ID
	id: Nullable<string>;
	// 上级部门ID
	parentId: Nullable<string>;
	// 部门名称
	name: Nullable<string>;
	/**
	 * 部门编码
	 * 用于Excel导入，请勿滥用
	 */
	code: Nullable<string>;
	// 关联院区编码
	campus: Nullable<string>;
	/**
	 * 类型编码
	 * 例如 集团(旧):syndicate、项目(旧):project、班组:team、部门:department
	 */
	typeCode: Nullable<string>;
	// 所属租户ID
	tenantId: Nullable<string>;
	// 所属组织ID
	organizationId: Nullable<string>;
	/**
	 * 删除标记
	 * 是否删除,0-未删除,1-已删除
	 */
	deleted: Nullable<boolean>;
}