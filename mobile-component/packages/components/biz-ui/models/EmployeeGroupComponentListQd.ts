import EmployeeGroupCategoryIdQd from './EmployeeGroupCategoryIdQd';
import FuzzyQd from './FuzzyQd';
import OrgQd from './OrgQd';
export default class EmployeeGroupComponentListQd {
  // 组织查询条件，和其他组织查询条件取交集
  orgQd: Nullable<OrgQd>;
  // 群组id in
  idIn: Nullable<string[]>;
  // 群组类别id查询
  categoryIdQd: Nullable<EmployeeGroupCategoryIdQd>;
  // 模糊搜索组合条件,fields允许值:name
  fuzzyQd: Nullable<FuzzyQd>;
  // 数量限制
  limit: number = 0;
}
