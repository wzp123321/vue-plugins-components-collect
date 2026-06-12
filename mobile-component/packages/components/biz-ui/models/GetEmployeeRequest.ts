export default class GetEmployeeRequest {
	/**
	 * 组织id 等于
	 * 如果没有设置，尝试根据token中获取
	 */
	orgIdEq: Nullable<string>;
	// 员工id 等于
	idEq: Nullable<string>;
	/**
	 * 联系手机号 等于
	 * 花名册的员工联系手机号
	 */
	phoneEq: Nullable<string>;
	// 工号 等于
	staffIdEq: Nullable<string>;
	// 短号 等于
	shortCodeEq: Nullable<string>;
	/**
	 * 需要额外查询的字段
	 * EmployeeFetchPartEnum
	 */
	fetchParts: Nullable<string[]>;
}