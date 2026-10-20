export default class DisableBatchEmployeeVORequest {
	// 员工id列表
	employeeIds: Nullable<string[]>;
	// 是否禁用不能为空
	disabled: Nullable<boolean>;
}