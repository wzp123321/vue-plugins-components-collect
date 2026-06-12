import { ApplicationTypeEnum } from './ApplicationTypeEnum';
export default class OrganizationApplicationInfoListQdDTO {
  // 机构id等于
  organizationIdEq: Nullable<string>;
  // 产品模块id等于
  productIdEq: Nullable<string>;
  // 应用类型, 为空则返回全部
  typeIn: Nullable<ApplicationTypeEnum[]>;
}
