import DepartmentManagerDTO from './DepartmentManagerDTO';
import ParentDepartmentDTO from './ParentDepartmentDTO';
export default class DepartmentDTO {
  // 部门ID
  id: Nullable<string>;
  // 部门名称
  name: Nullable<string>;
  /**
   * 部门编码
   * 主要用于导入更新时使用，适用于兼容接口，不建议使用
   * @deprecated 已废弃
   */
  code: Nullable<string>;
  /**
   * 部门全名称
   * 例如 南京天溯/产品研发中心/XXXPBU
   */
  fullName: Nullable<string>;
  /**
   * 部门类型
   * 例如 集团、项目、班组、部门
   */
  type: Nullable<string>;
  /**
   * 脱敏电话
   * 例如 139****3411,139****3412
   */
  desensitizedPhone: Nullable<string>;
  // 部门负责人
  manager: Nullable<DepartmentManagerDTO>;
  // 上级部门
  parent: Nullable<ParentDepartmentDTO>;
}
