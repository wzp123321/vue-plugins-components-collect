export default class RegisterVORequest {
	// 
	tenantId: Nullable<string>;
	// 注册手机号(加密)
	mobile: Nullable<string>;
	// 密码（加密）
	passwordOne: Nullable<string>;
	// 重复密码（加密）
	passwordTwo: Nullable<string>;
	// 终端id
	terminalId: Nullable<string>;
	// 短信验证码
	smsCode: Nullable<string>;
}