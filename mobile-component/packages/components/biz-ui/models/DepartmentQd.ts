import DataPermissionCheck from './DataPermissionCheck';
import PageQd from './PageQd';
export default class DepartmentQd extends PageQd {
  // 组织id等于
  orgIdEq: Nullable<string>;
  // 部门ID in
  idIn: Nullable<string[]>;
  // 主管(员工)id 等于
  managerIdEq: Nullable<string>;
  /**
   * 部门编码 in
   * 兼容旧工作流，不推荐使用
   * @deprecated 已废弃
   */
  codeIn: Nullable<string[]>;
  /**
   * 院区编码 in
   * 不推荐使用部门的关联院区字段查询
   * @deprecated 已废弃
   */
  campusIn: Nullable<string[]>;
  // 父部门ID等于
  parentIdEq: Nullable<string>;
  // 部门名称模糊匹配
  nameLike: Nullable<string>;
  /**
   * 部门属性,等于,使用部门属性字段名称
   * @deprecated 已废弃
   */
  typeNameEq: Nullable<string>;
  // 业务类型id in
  businessTypeIdIn: Nullable<string[]>;
  // 父级部门id in
  parentIdIn: Nullable<string[]>;
  // 数据权限检查参数
  dataPermissionCheck: Nullable<DataPermissionCheck>;
  // 限定内的部门id等于
  restrictiveIdEq: Nullable<string>;
}
