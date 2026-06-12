import DeptEmployeeCountQd from './DeptEmployeeCountQd';
export default class DepartmentDetailQd {
  // 部门ID
  idEq: Nullable<string>;
  // 部门员工查询条件，用于计数
  employeeCountQd: Nullable<DeptEmployeeCountQd>;
  // 子部件查询
  fetchParts: Nullable<string[]>;
}
