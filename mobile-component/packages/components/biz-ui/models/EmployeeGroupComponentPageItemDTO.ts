import IdName from './IdName';
export default class EmployeeGroupComponentPageItemDTO extends IdName {
  // 机构id
  organizationId: Nullable<string>;
  // 机构名称
  organizationName: Nullable<string>;
  // 群组类别名称全路径
  categoryFullName: Nullable<string>;
}
