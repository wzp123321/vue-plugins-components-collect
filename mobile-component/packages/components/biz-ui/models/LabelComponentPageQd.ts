import FuzzyQd from './FuzzyQd';
import LabelGroupIdQd from './LabelGroupIdQd';
import OrgQd from './OrgQd';
import PageQd from './PageQd';
export default class LabelComponentPageQd extends PageQd {
  // 组织查询条件，和其他组织查询条件取交集
  orgQd: Nullable<OrgQd>;
  // 标签分组id查询
  groupIdQd: Nullable<LabelGroupIdQd>;
  // 模糊搜索组合条件,fields允许值:name
  fuzzyQd: Nullable<FuzzyQd>;
}
