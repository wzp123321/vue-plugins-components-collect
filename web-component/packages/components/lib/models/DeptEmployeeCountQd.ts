import { DeptEmpCntQueryStrategy } from './DeptEmpCntQueryStrategy';
export default class DeptEmployeeCountQd {
  // 查询策略
  queryStrategy: Nullable<DeptEmpCntQueryStrategy>;
  /**
   * 在职时间
   * yyyy-MM-dd时，该员工已在职（且未离职）。可以传入当前时间，表示查询当日在职员工。
   */
  onBoardWhen: Nullable<string>;
  /**
   * 是否禁用
   * 0-已启用,1-已禁用,用此字段表示筛选可以登录平台的人员
   */
  disabledEq: Nullable<boolean>;
}
