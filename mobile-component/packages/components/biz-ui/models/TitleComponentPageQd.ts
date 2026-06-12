import FuzzyQd from './FuzzyQd';
import OrgQd from './OrgQd';
import PageQd from './PageQd';
import TitleGroupIdQd from './TitleGroupIdQd';
export default class TitleComponentPageQd extends PageQd {
  // 组织查询条件，和其他组织查询条件取交集
  orgQd: Nullable<OrgQd>;
  // 职务分组id查询
  groupIdQd: Nullable<TitleGroupIdQd>;
  // 模糊搜索组合条件,fields允许值:name
  fuzzyQd: Nullable<FuzzyQd>;
}
