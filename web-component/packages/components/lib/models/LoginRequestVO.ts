import AccountLoginVO from './AccountLoginVO';
import DomainAccountLoginVO from './DomainAccountLoginVO';
import PhoneLoginVO from './PhoneLoginVO';
export default class LoginRequestVO {
  // 终端类型：wxworkH5-企业微信、wechatH5-微信公众号、dingtalkH5-钉钉H5应用、pcWeb-天溯后勤运维平台、app-天溯APP、wechatMini-微信小程序
  terminalType: Nullable<string>;
  // 登录类型：accountLogin-账号登录、phoneLogin-手机号登录、domainAccountLogin-域账号登录、authLogin-第三方授权登录
  loginType: Nullable<string>;
  // 账号登录时必填
  accountLogin: Nullable<AccountLoginVO>;
  // 手机号登录时必填
  phoneLogin: Nullable<PhoneLoginVO>;
  // 域账号登录时必填
  domainAccountLogin: Nullable<DomainAccountLoginVO>;
}
