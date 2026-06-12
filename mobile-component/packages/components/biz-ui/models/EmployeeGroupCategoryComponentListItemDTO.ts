import IdName from './IdName';
export default class EmployeeGroupCategoryComponentListItemDTO extends IdName {
  // 机构id
  organizationId: Nullable<string>;
  // 组织名称
  organizationName: Nullable<string>;
  // 群组类别名称全路径
  fullName: Nullable<string>;
  // 是否有子群组类别
  hasChildren: Nullable<boolean>;
  // 是否有群组
  hasEmployeeGroup: Nullable<boolean>;
}
