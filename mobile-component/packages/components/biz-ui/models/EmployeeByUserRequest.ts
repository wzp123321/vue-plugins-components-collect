export default class EmployeeByUserRequest {
	// 组织ID
	organizationId: string = '';
	// 用户Id
	userIdList: Nullable<string[]>;
}