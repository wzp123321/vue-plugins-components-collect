import DingTalkVO from './DingTalkVO';
import WeChatMiniProgramVO from './WeChatMiniProgramVO';
import WeChatOfficialAccountVO from './WeChatOfficialAccountVO';
import WeComVO from './WeComVO';
export default class ConfigTenantTerminalDetailVO {
  // 钉钉
  dingTalkVO: Nullable<DingTalkVO>;
  // 微信公众号
  weChatOfficialAccountVO: Nullable<WeChatOfficialAccountVO>;
  // 企业微信
  weComVO: Nullable<WeComVO>;
  // 微信小程序
  weChatMiniProgramVO: Nullable<WeChatMiniProgramVO>;
}
