import PageParam from './PageParam';
export default class RoleQueryVO {
  /**
   * 角色名称LIKE
   * 模糊搜索角色名称
   */
  nameLike: Nullable<string>;
  // 禁用状态
  disabledEq: Nullable<boolean>;
  /**
   * 角色分组id等于
   * 角色分组id
   */
  groupIdEq: Nullable<string>;
  // 有效状态等于
  validEq: Nullable<boolean>;
  // 分页查询条件
  page: Nullable<PageParam>;
}
