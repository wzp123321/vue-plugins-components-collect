export default class CheckPermissionRequest {
	// 应用实例ID等于
	appInstanceIdEq: Nullable<string>;
	// 员工ID等于
	employeeIdEq: Nullable<string>;
	// 待鉴权的操作权限ID列表
	permissionIdIn: Nullable<string[]>;
}