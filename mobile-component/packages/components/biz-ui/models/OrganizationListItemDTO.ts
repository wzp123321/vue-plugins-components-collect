import IdName from './IdName';
export default class OrganizationListItemDTO extends IdName {
  // 全路径名称
  fullName: Nullable<string>;
  // 是否有子节点
  hasChildren: Nullable<boolean>;
}
