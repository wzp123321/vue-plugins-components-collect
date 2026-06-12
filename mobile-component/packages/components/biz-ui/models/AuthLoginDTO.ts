export default class AuthLoginDTO {
	// 登录时，获取的第三方登录授权码
	authCode: Nullable<string>;
	// 微信小程序手机号获取凭证
	code: Nullable<string>;
}