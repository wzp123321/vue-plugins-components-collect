export default class DataPermissionCheck {
	// 应用实例id
	appInstanceId: Nullable<string>;
	// 员工id，如果header的携带了用户token优先识别token值
	employeeId: Nullable<string>;
	// 数据权限作用域
	scopeCode: Nullable<string>;
}