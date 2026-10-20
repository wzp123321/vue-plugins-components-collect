export default class DeptUpdateRequestVO {
	// 部门id
	id: string = '';
	// 部门名称
	name: string = '';
	// 部门简称
	shortName: Nullable<string>;
	// 上级部门id
	parentId: Nullable<string>;
	// 部门负责人员工id
	managerId: Nullable<string>;
	// 部门属性：9-部门、8-班组、1-集团、7-项目
	typeNo: number = 0;
	// 关联院区编码，多个之间以英文逗号隔开
	campus: Nullable<string>;
	// 部门电话
	phone: Nullable<string>;
	// 部门描述
	description: Nullable<string>;
}