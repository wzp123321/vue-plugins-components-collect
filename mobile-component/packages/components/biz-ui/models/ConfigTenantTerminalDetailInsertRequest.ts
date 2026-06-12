import DingTalkInsertRequest from './DingTalkInsertRequest';
import WeChatMiniProgramInsertRequest from './WeChatMiniProgramInsertRequest';
import WeChatOfficialAccountInsertRequest from './WeChatOfficialAccountInsertRequest';
import WeComInsertRequest from './WeComInsertRequest';
export default class ConfigTenantTerminalDetailInsertRequest {
  // 钉钉
  dingTalkInsertRequest: Nullable<DingTalkInsertRequest>;
  // 微信公众号
  weChatOfficialAccountInsertRequest: Nullable<WeChatOfficialAccountInsertRequest>;
  // 企业微信
  weComInsertRequest: Nullable<WeComInsertRequest>;
  // 微信小程序
  weChatMiniProgramInsertRequest: Nullable<WeChatMiniProgramInsertRequest>;
}
