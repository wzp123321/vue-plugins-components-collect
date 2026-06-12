import { LoginTypeEnum } from './LoginTypeEnum';
import { PasswdUpdateTypeEnum } from './PasswdUpdateTypeEnum';
import { VerificationTypeEnum } from './VerificationTypeEnum';
export default class ConfigTenantSafeDTO {
  // 登陆方式：手机号登陆(PHONE)、账号密码登陆(PASSWD)、域账号登陆(DOMAIN),如：["PHONE","PASSWD","DOMAIN"]
  loginType: Nullable<LoginTypeEnum[]>;
  // 手机验证方式：手机验证码(VERIFICATION_PHONE),密码(VERIFICATION_PASSWD),数字验证码(VERIFICATION_DIGITAL_CODE), 如：["VERIFICATION_PHONE","VERIFICATION_PASSWD","VERIFICATION_DIGITAL_CODE"]
  phoneVerificationType: Nullable<VerificationTypeEnum[]>;
  // 手机登陆方式名称
  phoneName: Nullable<string>;
  // 密码验证方式：手机验证码(VERIFICATION_PHONE),密码(VERIFICATION_PASSWD),数字验证码(VERIFICATION_DIGITAL_CODE), 如：["VERIFICATION_PHONE","VERIFICATION_PASSWD","VERIFICATION_DIGITAL_CODE"]
  passwdVerificationType: Nullable<VerificationTypeEnum[]>;
  // 密码登陆方式名称
  passwdName: Nullable<string>;
  // 域账号验证方式：密码(VERIFICATION_PASSWD),数字验证码(VERIFICATION_DIGITAL_CODE), 如：["VERIFICATION_PASSWD","VERIFICATION_DIGITAL_CODE"]
  domainVerificationType: Nullable<VerificationTypeEnum[]>;
  // 域账号登陆方式名称
  domainName: Nullable<string>;
  // 登陆方式顺序：["PHONE","PASSWD","DOMAIN"]列表
  loginTypeOrder: Nullable<LoginTypeEnum[]>;
  // 修改密码方式：原密码修改(PASSWD),手机验证码修改(PHONE), 如：["PASSWD","PHONE"]
  passwdUpdateType: Nullable<PasswdUpdateTypeEnum[]>;
  // 密码强度："0"-简单密码，"1"-复杂密码
  pwdStrength: Nullable<string>;
  // 密码有效期-天,如："30"
  pwdPeriod: Nullable<string>;
  // 账号锁定时间-分钟,如："10"
  lockPeriod: Nullable<string>;
  // 最大登陆失败次数-次,如："5"
  loginFailedCount: Nullable<string>;
  // 登陆失效时间-小时,如："24"
  loginExpirationTime: Nullable<string>;
}
