import DepartmentIdQd from './DepartmentIdQd';
import OrgQd from './OrgQd';
import PageQd from './PageQd';
export default class EmployeeComponentPageQd extends PageQd {
  // 组织查询条件，和其他组织查询条件取交集
  orgQd: Nullable<OrgQd>;
  // 部门id查询
  departmentIdQd: Nullable<DepartmentIdQd>;
  // 关键字搜索
  keyword: Nullable<string>;
}
