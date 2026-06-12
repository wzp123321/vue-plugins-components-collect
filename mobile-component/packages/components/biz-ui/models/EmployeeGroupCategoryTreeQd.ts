import FuzzyQd from './FuzzyQd';
import TreeQd from './TreeQd';
export default class EmployeeGroupCategoryTreeQd extends TreeQd {
  // 模糊查询参数
  fuzzyQd: Nullable<FuzzyQd>;
  // 返回值是否包含自身
  includeSelf: Nullable<boolean>;
}
