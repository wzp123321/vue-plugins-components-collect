import ProjectQd from './ProjectQd';
export default class OrgQd {
  // 组织id等于
  orgIdEq: Nullable<string>;
  // 授权院区对应的组织，和其他组织查询条件取交集
  projectQd: Nullable<ProjectQd>;
  // 默认false，是否包含共享机构，对OrgQd内所有组织查询对象生效
  includeSharedOrg: Nullable<boolean>;
}
