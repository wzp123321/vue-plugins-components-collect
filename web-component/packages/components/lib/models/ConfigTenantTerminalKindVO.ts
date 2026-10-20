export default class ConfigTenantTerminalKindVO {
	// 终端编码
	code: Nullable<string>;
	// 终端类别编码
	type: Nullable<string>;
	// 终端名称
	name: Nullable<string>;
	// 终端展示名称
	showName: Nullable<string>;
	// 是否可选, 已存在配置则新增时不可选
	choosable: Nullable<boolean>;
}