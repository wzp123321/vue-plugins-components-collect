export default class UserInfoRoleDto {
	// 租户id
	tenantId: Nullable<string>;
	// 用户id
	userId: Nullable<string>;
	// 登录账号
	loginAccount: Nullable<string>;
	// 姓名
	name: Nullable<string>;
	// 通讯手机号
	contactPhone: Nullable<string>;
	// 用户头像
	picUrl: Nullable<string>;
	// 部门id
	deptId: Nullable<string>;
	// 部门名称
	deptName: Nullable<string>;
	// 部门编码
	deptCode: Nullable<string>;
	// 角色编码
	roleCodes: Nullable<string>;
	// 院区编码
	campusCodes: Nullable<string>;
	// 客服电话
	serviceMobile: Nullable<string>;
	// 扩展属性
	extattr: Nullable<string>;
}