export default class UserInfoVOResponse {
	// 用户id
	userId: Nullable<string>;
	// 登录账号
	loginAccount: Nullable<string>;
	// 登录手机号
	loginMobile: Nullable<string>;
	// 姓名
	name: Nullable<string>;
	// 通讯手机号
	contactPhone: Nullable<string>;
	// 0-非管理员，1-安全管理员，2-系统管理员
	isAdmin: Nullable<number>;
	/**
	 * 组织管理员类型
	 * OrganizationAdminTypeEnum
	 */
	orgAdminType: Nullable<string>;
	// 用户头像
	picUrl: Nullable<string>;
	// 上次此端登录时间
	lastLoginTime: Nullable<string>;
}