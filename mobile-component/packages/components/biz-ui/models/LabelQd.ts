import PageQd from './PageQd';
export default class LabelQd extends PageQd {
  // 组织id等于
  orgIdEq: Nullable<string>;
  // 标签ID in
  idIn: Nullable<string[]>;
  // 标签编码 in
  codeIn: Nullable<string[]>;
  // 标签编码等于
  codeEq: Nullable<string>;
  // 标签分组id等于
  groupIdEq: Nullable<string>;
  // 模糊搜索标签名称或编码
  keywordLike: Nullable<string>;
}
