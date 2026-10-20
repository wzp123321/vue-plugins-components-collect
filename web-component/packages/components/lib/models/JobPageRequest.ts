import PageParam from './PageParam';
export default class JobPageRequest extends PageParam {
  // 岗位分组id
  groupId: string = '';
  // 关键词（岗位名称/编码）
  keyword: Nullable<string>;
}
