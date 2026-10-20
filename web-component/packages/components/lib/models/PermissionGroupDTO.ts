import PermissionDTO from './PermissionDTO';
export default class PermissionGroupDTO {
  // 名称
  name: Nullable<string>;
  /**
   * 编码
   * 命名为code的原因，就是告诉你该编码不能直接用于checkPermission接口入参，但是平台会根据这个编码会生成{code}.all和{code}.access之类的保留操作权限
   */
  code: Nullable<string>;
  /**
   * 操作权限
   * 权限组下的多个操作权限
   */
  permission: Nullable<PermissionDTO[]>;
}
