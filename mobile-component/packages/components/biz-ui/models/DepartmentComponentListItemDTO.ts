import IdName from './IdName';
export default class DepartmentComponentListItemDTO extends IdName {
  // 部门名称全路径
  fullName: Nullable<string>;
  // 机构id
  organizationId: Nullable<string>;
}
