import IdName from './IdName';
export default class EmployeeJobDTO extends IdName {
  /**
   * 部门编码
   * 主要用于导入更新时使用，适用于兼容接口，不建议使用
   * @deprecated 已废弃
   */
  code: Nullable<string>;
}
