export default class UserDetailResponseDTO {
	// 用户id
	id: Nullable<string>;
	// 租户id
	tenantId: Nullable<string>;
	// 登录手机号
	loginMobile: Nullable<string>;
	// 登录账号
	loginName: Nullable<string>;
	// 是否禁用，0-启用，1-禁用
	disabled: Nullable<number>;
	// 用户名
	username: Nullable<string>;
	// 头像地址
	avatarUrl: Nullable<string>;
}