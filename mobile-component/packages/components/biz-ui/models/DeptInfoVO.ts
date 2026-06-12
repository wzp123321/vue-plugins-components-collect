// 部门列表分页对象
export default class DeptInfoVO {
	// 部门ID
	id: string = '';
	// 部门名称
	name: string = '';
	// 部门编码
	deptNo: string = '';
	// 部门简称
	shortName: Nullable<string>;
	// 部门属性名称
	typeName: string = '';
	// 部门负责人
	managerName: Nullable<string>;
	// 部门人数
	employeeCount: string = '';
	// 部门描述
	description: Nullable<string>;
}