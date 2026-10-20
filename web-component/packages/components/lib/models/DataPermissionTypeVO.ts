import IdName from './IdName';
export default class DataPermissionTypeVO {
  // 类型编码
  code: Nullable<string>;
  /**
   * 类型名称
   * 部门、院区...
   */
  name: Nullable<string>;
  /**
   * 内容类型
   * json:由后端返回数据,html:表示由前端请求页面
   */
  contentType: Nullable<string>;
  /**
   * 页面url
   * 前端请求页面url,当contentType为html时有效
   */
  pageUrl: Nullable<string>;
  /**
   * 数据类型
   * list:列表,tree:树
   */
  dataType: Nullable<string>;
  // 数据权限项
  dataPermissionItems: Nullable<IdName[]>;
}
