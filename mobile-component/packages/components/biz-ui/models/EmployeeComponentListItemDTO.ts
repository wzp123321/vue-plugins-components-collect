import IdName from './IdName';
export default class EmployeeComponentListItemDTO extends IdName {
  // 机构id
  organizationId: Nullable<string>;
  // 员工头像地址
  picUrl: Nullable<string>;
  // 部门名称全路径
  departmentFullName: Nullable<string>;
  // 手机号
  phone: Nullable<string>;
}
