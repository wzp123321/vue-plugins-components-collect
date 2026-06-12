import IdName from './IdName';
export default class LabelComponentListItemDTO extends IdName {
  // 机构id
  organizationId: Nullable<string>;
  // 组织名称
  organizationName: Nullable<string>;
  // 标签分组名称全路径
  groupFullName: Nullable<string>;
}
