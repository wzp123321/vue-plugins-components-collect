import DepartmentIdQd from './DepartmentIdQd';
import OrgQd from './OrgQd';
export default class EmployeeComponentListQd {
  // 组织查询条件，和其他组织查询条件取交集
  orgQd: Nullable<OrgQd>;
  // 员工id in
  idIn: Nullable<string[]>;
  // 部门id查询
  departmentIdQd: Nullable<DepartmentIdQd>;
  // 关键字搜索
  keyword: Nullable<string>;
  // 数量限制
  limit: number = 0;
}
