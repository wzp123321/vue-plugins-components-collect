import IdName from './IdName';
export default class TitleComponentPageItemDTO extends IdName {
  // 机构id
  organizationId: Nullable<string>;
  // 机构名称
  organizationName: Nullable<string>;
  // 职务分组名称全路径
  groupFullName: Nullable<string>;
}
