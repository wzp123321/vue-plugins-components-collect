import DingTalkUpdateRequest from './DingTalkUpdateRequest';
import WeChatMiniProgramUpdateRequest from './WeChatMiniProgramUpdateRequest';
import WeChatOfficialAccountUpdateRequest from './WeChatOfficialAccountUpdateRequest';
import WeComUpdateRequest from './WeComUpdateRequest';
export default class ConfigTenantTerminalDetailUpdateRequest {
  // 钉钉
  dingTalkUpdateRequest: Nullable<DingTalkUpdateRequest>;
  // 微信公众号
  weChatOfficialAccountUpdateRequest: Nullable<WeChatOfficialAccountUpdateRequest>;
  // 企业微信
  weComUpdateRequest: Nullable<WeComUpdateRequest>;
  // 微信小程序
  weChatMiniProgramUpdateRequest: Nullable<WeChatMiniProgramUpdateRequest>;
}
