import { OrganizationIdentityTypeEnum } from './OrganizationIdentityTypeEnum';
export default class ProjectOrganizationListQdDTO {
  // 院区id等于
  projectIdEq: Nullable<string>;
  // 院区id in
  projectIdIn: Nullable<string[]>;
  // 组织在院区下的身份类型
  organizationIdentityTypeIn: Nullable<OrganizationIdentityTypeEnum[]>;
}
