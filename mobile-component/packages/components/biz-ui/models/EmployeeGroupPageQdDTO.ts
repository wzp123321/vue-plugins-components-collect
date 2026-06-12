import EmployeeGroupCategoryIdQd from './EmployeeGroupCategoryIdQd';
import FuzzyQd from './FuzzyQd';
import PageQd from './PageQd';
export default class EmployeeGroupPageQdDTO extends PageQd {
  // 模糊查询
  fuzzyQd: Nullable<FuzzyQd>;
  // 群组所属分组查询
  categoryIdQd: Nullable<EmployeeGroupCategoryIdQd>;
}
