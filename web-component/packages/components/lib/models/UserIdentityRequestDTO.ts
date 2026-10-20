import { IdentityTypeEnum } from './IdentityTypeEnum';
export default class UserIdentityRequestDTO {
  // 查询的用户id列表
  userIdIn: Nullable<string[]>;
  // 终端id
  terminalId: Nullable<string>;
  // 身份类型
  identityType: Nullable<IdentityTypeEnum>;
}
