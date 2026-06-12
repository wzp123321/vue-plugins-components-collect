export default class QueryOrgListRequest {
	/**
	 * 类型等于
	 * OrganizationTypeEnum
	 */
	typeEq: Nullable<string>;
	// 需要额外查询的字段
	fetchParts: Nullable<string[]>;
}