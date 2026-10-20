export default class EmployeeListItemVO {
	// 员工id
	employeeId: string = '';
	// 员工编码
	workNo: string = '';
	// 员工姓名
	name: string = '';
	// 联系方式（手机号）
	phone: string = '';
	// 工号
	workId: Nullable<string>;
	// 员工类型
	staffTypeName: Nullable<string>;
	// 部门名称
	deptName: string = '';
	// 岗位名称
	jobName: Nullable<string>;
	// 职务名称
	titleName: Nullable<string>;
	// 状态
	state: Nullable<string>;
	// 上级姓名
	superiorName: Nullable<string>;
	// 创建时间
	createTime: Nullable<string>;
	// 是否离职：true-离职，false-在职
	resigned: Nullable<boolean>;
}