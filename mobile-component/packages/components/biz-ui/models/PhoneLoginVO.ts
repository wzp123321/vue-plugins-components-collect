export default class PhoneLoginVO {
	// 登录手机号（+86开头的密文手机号）
	loginMobile: Nullable<string>;
	// 短信验证码
	smsCode: Nullable<string>;
	// 密码（密文）
	password: Nullable<string>;
	// 图形验证码
	captchaCode: Nullable<string>;
	// 图形验证码文本键
	captchaKey: Nullable<string>;
}