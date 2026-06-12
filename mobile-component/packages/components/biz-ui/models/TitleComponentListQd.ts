import FuzzyQd from './FuzzyQd';
import OrgQd from './OrgQd';
import TitleGroupIdQd from './TitleGroupIdQd';
export default class TitleComponentListQd {
  // 组织查询条件，和其他组织查询条件取交集
  orgQd: Nullable<OrgQd>;
  // 职务id in
  idIn: Nullable<string[]>;
  // 职务分组id查询
  groupIdQd: Nullable<TitleGroupIdQd>;
  // 模糊搜索组合条件,fields允许值:name
  fuzzyQd: Nullable<FuzzyQd>;
  // 数量限制
  limit: number = 0;
}
