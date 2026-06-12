export default class SaveEmployeePersonalVORequest {
	// 员工id
	employeeIdEq: string = '';
	// 员工姓名
	name: string = '';
	// 联系方式（手机号）
	phone: string = '';
	// 邮箱
	email: Nullable<string>;
	// 性别
	gender: Nullable<number>;
	// 生日
	birthday: Nullable<string>;
	// 民族
	nation: Nullable<string>;
	// 婚姻状况 1:未婚,2:已婚,3:离异,4:丧偶
	maritalStatus: Nullable<number>;
	// 政治面貌 0:群众,1:共青团员,2:共产党员,3:其他
	politicsStatus: Nullable<number>;
	// 毕业院校
	graduation: Nullable<string>;
	// 专业
	graduationMajor: Nullable<string>;
	// 个人地址
	permanentResidence: Nullable<string>;
}