export default class MyCenterVOResponse {
	// 用户id
	userId: Nullable<string>;
	// 登录账号
	loginAccount: Nullable<string>;
	// 登录手机号
	loginMobile: Nullable<string>;
	// 通讯手机号
	contactPhone: Nullable<string>;
	// 姓名
	name: Nullable<string>;
	// 邮箱
	email: Nullable<string>;
	// 用户状态：0-启用，1-禁用
	disabled: Nullable<string>;
	// 注册时间
	createTime: Nullable<string>;
	// 账户安全
	pwdSecurity: Nullable<string>;
	// 用户头像
	picUrl: Nullable<string>;
}