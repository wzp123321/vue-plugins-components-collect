import PageQd from '../models/PageQd';
export default class DepartmentManagerQd extends PageQd {
  // 组织ID 等于
  orgIdEq: Nullable<string>;
  /**
   * 院区ID in
   * @deprecated 已废弃
   */
  campusIdIn: Nullable<string[]>;
  // 主管名称以 ... 开头
  nameStartsWith: Nullable<string>;
  // 主管名称模糊匹配
  nameLike: Nullable<string>;
  /**
   * 禁用状态等于
   * false:启用的, true:禁用的, 默认查询全部
   */
  disabledEq: Nullable<boolean>;
}
