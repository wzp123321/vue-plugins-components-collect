import PageParam from './PageParam';
export default class TitlePageRequest extends PageParam {
  // 职务分组id
  groupId: string = '';
  // 关键词（职务名称/编码）
  keyword: Nullable<string>;
}
