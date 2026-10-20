import PageParam from './PageParam';
export default class SearchSuperiorVORequest extends PageParam {
  // 关键词（员工姓名/工号 模糊匹配）
  keywordLike: Nullable<string>;
  // 是否禁用 0-已启用,1-已禁用
  disabled: Nullable<number>;
}
