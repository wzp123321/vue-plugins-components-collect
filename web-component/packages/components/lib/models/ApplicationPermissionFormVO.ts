// 应用权限提交表单内容
export default class ApplicationPermissionFormVO {
	// 应用ID
	applicationId: Nullable<string>;
	// 选中的功能权限ID列表
	permissionIds: Nullable<string[]>;
	// 数据范围
	dataPermissionMap: any;
}