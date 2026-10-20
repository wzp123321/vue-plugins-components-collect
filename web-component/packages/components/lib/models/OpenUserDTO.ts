export default class OpenUserDTO {
	// 微信/钉钉的第三方id
	openId: Nullable<string>;
	// 用户id
	userId: Nullable<string>;
	// 终端类型
	terminalType: Nullable<string>;
	// 终端id
	terminalId: Nullable<string>;
}