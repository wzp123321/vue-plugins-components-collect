import PageQd from './PageQd';
export default class JobQd extends PageQd {
  // 组织id等于
  orgIdEq: Nullable<string>;
  // 岗位id in
  idIn: Nullable<string[]>;
  // 岗位名称 like
  nameLike: Nullable<string>;
  // 岗位分组id等于
  groupIdEq: Nullable<string>;
  // 模糊搜索岗位名称或编码
  keywordLike: Nullable<string>;
}
