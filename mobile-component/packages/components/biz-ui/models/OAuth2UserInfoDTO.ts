export default class OAuth2UserInfoDTO {
	// 用户id
	userId: Nullable<string>;
	// 用户账号
	account: Nullable<string>;
	// 用户姓名
	name: Nullable<string>;
	// 用户绑定的员工工号
	staffId: Nullable<string>;
	// 用户token
	token: Nullable<string>;
}