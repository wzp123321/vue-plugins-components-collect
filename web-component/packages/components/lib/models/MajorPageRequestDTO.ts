import PageQd from './PageQd';
export default class MajorPageRequestDTO extends PageQd {
  // 专业id
  majorIdIn: Nullable<string[]>;
  // 专业id
  majorCodeIn: Nullable<string[]>;
  // 专业名称模糊查询
  majorNameLike: Nullable<string>;
  // 租户id
  tenantId: Nullable<string>;
}
