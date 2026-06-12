import { OrganizationIdentityTypeEnum } from './OrganizationIdentityTypeEnum';
export default class ProjectQd {
  // 院区ID In
  projectIdIn: Nullable<string[]>;
  // 组织在院区下的身份, 不传代表全部
  orgIdentityTypeIn: Nullable<OrganizationIdentityTypeEnum[]>;
}
