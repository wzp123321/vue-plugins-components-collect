import FuzzyQd from './FuzzyQd';
import JobGroupIdQd from './JobGroupIdQd';
import OrgQd from './OrgQd';
import PageQd from './PageQd';
export default class JobComponentPageQd extends PageQd {
  // 组织查询条件，和其他组织查询条件取交集
  orgQd: Nullable<OrgQd>;
  // 岗位分组id查询
  groupIdQd: Nullable<JobGroupIdQd>;
  // 模糊搜索组合条件,fields允许值:name
  fuzzyQd: Nullable<FuzzyQd>;
}
