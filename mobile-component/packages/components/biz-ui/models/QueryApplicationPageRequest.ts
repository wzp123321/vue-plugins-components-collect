import PageParam from './PageParam';

export default class QueryApplicationPageRequest extends PageParam {
  // 模糊查询关键字: 开发者名称/appId
  keyWord: Nullable<string>;
}
