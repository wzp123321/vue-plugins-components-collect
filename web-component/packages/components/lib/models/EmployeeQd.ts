import DepartmentIdQd from './DepartmentIdQd';
import FuzzyQd from './FuzzyQd';
import PageQd from './PageQd';
export default class EmployeeQd extends PageQd {
  // 组织id等于
  orgIdEq: Nullable<string>;
  // 员工ID in
  idIn: Nullable<string[]>;
  /**
   * 用户ID in
   * 在组织内用户只能认证一个员工
   */
  userIdIn: Nullable<string[]>;
  // 工号 in
  staffIdIn: Nullable<string[]>;
  // 工号 两端模糊匹配
  staffIdLike: Nullable<string>;
  // 部门ID in
  departmentIdIn: Nullable<string[]>;
  /**
   * 部门编码 in
   * 兼容旧工作流，不推荐使用
   * @deprecated 已废弃
   */
  departmentCodeIn: Nullable<string[]>;
  // 部门ID 查询
  departmentIdQd: Nullable<DepartmentIdQd>;
  // 岗位ID in
  jobIdIn: Nullable<string[]>;
  /**
   * 岗位编码 in
   * 兼容旧工作流，不推荐使用
   * @deprecated 已废弃
   */
  jobCodeIn: Nullable<string[]>;
  /**
   * 花名册员工联系手机号等于
   * 花名册员工联系手机号不一定等于登录名
   */
  phoneEq: Nullable<string>;
  // 岗位ID等于
  jobIdEq: Nullable<string>;
  /**
   * 岗位所需资质在yyyy-MM-dd有效
   * 设置该值时，必须传jobEq参数，限定岗位
   */
  qualifiedWhen: Nullable<string>;
  // 职务ID in
  titleIdIn: Nullable<string[]>;
  // 标签ID in
  labelIdIn: Nullable<string[]>;
  // 标签编码 in
  labelCodeIn: Nullable<string[]>;
  // 姓名模糊匹配
  nameLike: Nullable<string>;
  // 模糊匹配
  fuzzyQd: Nullable<FuzzyQd>;
  /**
   * 院区ID in
   * @deprecated 已废弃
   */
  campusIdIn: Nullable<string[]>;
  /**
   * 员工状态等于
   * 是否禁用,0-启用,1-禁用,只有启用的员工可以登录平台
   */
  disabledEq: Nullable<boolean>;
  /**
   * yyyy-MM-dd时，该员工已在职（且未离职）
   * 条件等同于 (入职日期 IS NULL OR 入职日期大于等于该日期) AND (离职日期 IS NULL OR 离职日期小于等于该日期)；如果传当前系统时间，表示查询当前在职员工
   */
  onBoardWhen: Nullable<string>;
  /**
   * 是否只查询总数
   * true-只查询总数，false-查询分页数据
   */
  onlyTotal: Nullable<boolean>;
  /**
   * 考勤方式编码 in
   * 考勤机考勤:machine,手机GPS定位考勤:gps
   */
  attendanceMethodCodeIn: Nullable<string[]>;
  // 主管专业编码 in
  directorSpecialtyCodeIn: Nullable<string[]>;
  // 所属专业编码 in
  specialtyCodeIn: Nullable<string[]>;
}
