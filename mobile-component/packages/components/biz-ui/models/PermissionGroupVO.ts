import PermissionVO from './PermissionVO';
// 功能权限组
export default class PermissionGroupVO {
  // 名称
  name: Nullable<string>;
  /**
   * 全选
   * 这是一项特殊的功能权限
   */
  all: Nullable<PermissionVO>;
  // 访问菜单权限
  access: Nullable<PermissionVO>;
  /**
   * 其他操作权限
   * 权限组下的多个操作权限
   */
  permission: Nullable<PermissionVO[]>;
}
