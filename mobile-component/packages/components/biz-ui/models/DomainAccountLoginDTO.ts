export default class DomainAccountLoginDTO {
	// 登录域账号
	domainAccount: Nullable<string>;
	// 密码（密文）
	password: Nullable<string>;
	// 图形验证码
	captchaCode: Nullable<string>;
	// 图形验证码文本键
	captchaKey: Nullable<string>;
}