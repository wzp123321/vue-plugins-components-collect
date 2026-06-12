import PageParam from './PageParam';
export default class LabelPageRequest extends PageParam {
  // 标签分组id
  groupId: string = '';
  // 关键词（标签名称/编码）
  keyword: Nullable<string>;
}
