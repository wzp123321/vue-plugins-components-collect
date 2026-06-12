export default class EmployeeWorkInfoVO {
	// 员工类型，0:外包,1:正式,2:劳务(编制外),3:实习,4:顾问
	staffType: number = 0;
	// 部门
	deptId: string = '';
	// 工号
	workId: Nullable<string>;
	// 固定电话
	officeCall: Nullable<string>;
	// 短号
	cornet: Nullable<string>;
	// 工作邮箱
	email: Nullable<string>;
	// 岗位
	jobId: Nullable<string>;
	// 职务
	titleId: Nullable<string>;
	// 直属上级
	superiorId: Nullable<string>;
	// 标签
	tagIds: Nullable<string[]>;
	// 绑定的标签id列表
	labelIds: Nullable<string[]>;
	// 入职日期，格式YYYY-mm-dd
	hireDate: Nullable<string>;
	// 域账号
	domainAccount: Nullable<string>;
}