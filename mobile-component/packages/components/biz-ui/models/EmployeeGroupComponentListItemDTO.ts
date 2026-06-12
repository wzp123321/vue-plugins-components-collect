import IdName from './IdName';
export default class EmployeeGroupComponentListItemDTO extends IdName {
  // 机构id
  organizationId: Nullable<string>;
  // 组织名称
  organizationName: Nullable<string>;
  // 群组类别名称全路径
  categoryFullName: Nullable<string>;
}
