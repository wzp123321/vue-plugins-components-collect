import IdName from './IdName';
export default class LabelGroupComponentListItemDTO extends IdName {
  // 机构id
  organizationId: Nullable<string>;
  // 组织名称
  organizationName: Nullable<string>;
  // 标签分组名称全路径
  fullName: Nullable<string>;
  // 是否有子标签分组
  hasChildren: Nullable<boolean>;
  // 是否有标签
  hasLabel: Nullable<boolean>;
}
