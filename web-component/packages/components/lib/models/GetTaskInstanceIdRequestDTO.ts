export default class GetTaskInstanceIdRequestDTO {
	// 流程实例id
	processInstanceId: Nullable<string>;
	// 员工id（无Authorization时必填）
	employeeId: Nullable<string>;
}