import IdName from './IdName';
export default class DepartmentComponentPageItemDTO extends IdName {
  // 机构id
  organizationId: Nullable<string>;
  // 部门名称全路径
  fullName: Nullable<string>;
  // 是否有子部门
  hasChildren: Nullable<boolean>;
  // 是否有员工
  hasEmployee: Nullable<boolean>;
}
