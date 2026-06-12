import IdName from './IdName';
export default class JobGroupComponentListItemDTO extends IdName {
  // 机构id
  organizationId: Nullable<string>;
  // 组织名称
  organizationName: Nullable<string>;
  // 岗位分组名称全路径
  fullName: Nullable<string>;
  // 是否有子岗位分组
  hasChildren: Nullable<boolean>;
  // 是否有岗位
  hasJob: Nullable<boolean>;
}
