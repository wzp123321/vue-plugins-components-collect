import DataPermissionCheck from './DataPermissionCheck';
import DepartmentIdQd from './DepartmentIdQd';
import FuzzyQd from './FuzzyQd';
import OrgQd from './OrgQd';
import PageQd from './PageQd';
export default class DepartmentComponentPageQd extends PageQd {
  // 数据权限检查参数
  dataPermissionCheck: Nullable<DataPermissionCheck>;
  // 组织查询条件，和其他组织查询条件取交集
  orgQd: Nullable<OrgQd>;
  // 父级部门id等于，查询根节点下部门时，传-
  parentIdEq: Nullable<string>;
  // 部门id查询
  idQd: Nullable<DepartmentIdQd>;
  // 模糊搜索组合条件,fields允许值:name
  fuzzyQd: Nullable<FuzzyQd>;
}
