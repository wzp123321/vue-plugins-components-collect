import DataPermissionCheck from './DataPermissionCheck';
import TreeQd from './TreeQd';
export default class DepartmentTreeQuery extends TreeQd {
  // 组织id等于
  orgIdEq: Nullable<string>;
  /**
   * 部门名称 like
   * 部门名称模糊查询，传入此值，idEq和levels将失效
   */
  nameLike: Nullable<string>;
  // 数据权限校验
  dataPermissionCheck: Nullable<DataPermissionCheck>;
  // 限定内的部门id等于
  restrictiveIdEq: Nullable<string>;
}
