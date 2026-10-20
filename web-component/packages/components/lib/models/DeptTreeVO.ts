// 部门树对象
export default class DeptTreeVO {
	// 部门ID
	deptId: string = '';
	// 部门名称
	deptName: string = '';
	// 子部门
	childDept: Nullable<DeptTreeVO[]>;
}