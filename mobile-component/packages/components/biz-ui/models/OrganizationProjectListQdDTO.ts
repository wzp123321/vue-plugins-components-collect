import DataPermissionCheck from './DataPermissionCheck';
import { OrganizationIdentityTypeEnum } from './OrganizationIdentityTypeEnum';
export default class OrganizationProjectListQdDTO {
  // 机构id等于
  organizationIdEq: Nullable<string>;
  // 机构id in
  organizationIdIn: Nullable<string[]>;
  // 机构在院区下的身份类型
  organizationIdentityTypeIn: Nullable<OrganizationIdentityTypeEnum[]>;
  // 用户数据权限
  dataPermissionCheck: Nullable<DataPermissionCheck>;
}
