import PageQd from './PageQd';
export default class TitleQd extends PageQd {
  // 组织id等于
  orgIdEq: Nullable<string>;
  // 职务id in
  idIn: Nullable<string[]>;
  // 职务名称 like
  nameLike: Nullable<string>;
  // 职务分组id等于
  groupIdEq: Nullable<string>;
  // 模糊搜索职务名称或编码
  keywordLike: Nullable<string>;
}
