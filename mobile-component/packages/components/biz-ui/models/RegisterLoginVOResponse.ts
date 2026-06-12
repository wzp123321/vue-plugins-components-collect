export default class RegisterLoginVOResponse {
	// 用户token
	token: Nullable<string>;
	// 用户id
	userId: Nullable<string>;
	// 第三方用户的openId
	openId: Nullable<string>;
}