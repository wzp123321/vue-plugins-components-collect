import DataPermissionDefinitionDTO from './DataPermissionDefinitionDTO';
import MenuDefinitionDTO from './MenuDefinitionDTO';
import PermissionDefinitionDTO from './PermissionDefinitionDTO';
export default class SavePermissionRequest {
  /**
   * 产品模块id
   * 由产品经理定义的编码就等于产品模块id
   */
  productId: Nullable<string>;
  // 操作权限定义
  permissionDefinition: Nullable<PermissionDefinitionDTO>;
  // 菜单定义
  menuDefinition: Nullable<MenuDefinitionDTO>;
  // 数据权限定义
  dataPermissionDefinition: Nullable<DataPermissionDefinitionDTO>;
}
