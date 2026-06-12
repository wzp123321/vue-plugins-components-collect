export default class GetOrganizationBaseInfoVO {
	// 组织名称
	name: Nullable<string>;
	// 统一信用代码
	code: Nullable<string>;
	// 组织类型: 0-管理方（默认）、1-服务商、2-运营商
	type: Nullable<number>;
}