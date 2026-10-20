import DeptDistribeQueryRequestQd from './DeptDistribeQueryRequestQd';
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
   * 部门类型编码等于
   * 见枚举类DepartmentTypeCodeEnum，填入name()值
   */
  typeEq: Nullable<string>;
  // 根据空间分配方案查询
  deptDistribe: Nullable<DeptDistribeQueryRequestQd>;
}
