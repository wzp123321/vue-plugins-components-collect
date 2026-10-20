export default class SendSmsVORequest {
	// 验证码类型：login-登录, register-注册， resetPwd-修改密码
	type: Nullable<string>;
	// 租户id
	tenantId: Nullable<string>;
	// 终端id，企业微信、钉钉等平台是第三方应用id，workbench-天溯工作台，smc-天溯系统管理中心，yst-天溯医溯通APP
	terminalId: Nullable<string>;
	// 手机号
	mobile: Nullable<string>;
	// 登录账号，工作台账号登录时不能为空
	loginAccount: Nullable<string>;
}