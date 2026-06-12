import IdName from './IdName';
export default class TitleGroupComponentListItemDTO extends IdName {
  // 机构id
  organizationId: Nullable<string>;
  // 组织名称
  organizationName: Nullable<string>;
  // 职务分组名称全路径
  fullName: Nullable<string>;
  // 是否有子职务分组
  hasChildren: Nullable<boolean>;
  // 是否有职务
  hasTitle: Nullable<boolean>;
}
