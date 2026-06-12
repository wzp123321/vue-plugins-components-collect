import PrivilegeVO from './PrivilegeVO';
export default class PrivilegeGroupVO {
  // 名称
  name: Nullable<string>;
  /**
   * 全选
   * 这是一项特殊的功能权限
   */
  all: Nullable<PrivilegeVO>;
  // 访问菜单权限
  access: Nullable<PrivilegeVO>;
  /**
   * 其他操作权限
   * 权限组下的多个操作权限
   */
  permission: Nullable<PrivilegeVO[]>;
}
