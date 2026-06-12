export default class UpdateSysAdministratorRequest {
	// 用户id
	id: string = '';
	// 登录手机号
	loginMobile: string = '';
	// 姓名
	name: string = '';
	// 备注
	note: Nullable<string>;
}