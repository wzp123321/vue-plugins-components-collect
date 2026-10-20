import PageParam from './PageParam';
export default class QueryOrgPageRequest extends PageParam {
  // 模糊查询关键字:组织名称
  keyWord: Nullable<string>;
  // 组织类型: 0-管理方（默认）、1-服务商、2-运营商
  type: Nullable<number>;
}
