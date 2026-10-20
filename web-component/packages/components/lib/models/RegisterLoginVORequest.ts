export default class RegisterLoginVORequest {
	// 
	tenantId: Nullable<string>;
	// 微信、钉钉等第三方的临时授权码
	authCode: Nullable<string>;
	// 登录终端类型: wxworkH5-企业微信、wechatH5-微信公众号、dingtalkH5-钉钉H5应用、pcWeb-天溯后勤运维平台、app-天溯APP
	terminalType: Nullable<string>;
	// 登录身份id:登录手机号/登录账号/域账号
	identityId: Nullable<string>;
	// 登录方式，0-普通账号密码登录、1-手机号验证码登录、2-域账号登录、3-微信小程序静默登录
	isPhone: Nullable<number>;
	// 终端id，企业微信、钉钉等平台是第三方应用id，workbenchWeb-天溯工作台，opWeb-天溯系统管理中心，workbenchApp-天溯医溯通APP
	terminalId: Nullable<string>;
	// 登录密码，密码登录时不能为空
	password: Nullable<string>;
	// 短信验证码，验证码登录时不能为空
	smsCode: Nullable<string>;
	// 微信公众号未绑定时，输入注册手机号
	bindId: Nullable<string>;
	// 图片验证码文本,使用图片验证码时不能为空
	captchaCode: Nullable<string>;
	// 图片验证码文本键,使用图片验证码时不能为空
	captchaKey: Nullable<string>;
}