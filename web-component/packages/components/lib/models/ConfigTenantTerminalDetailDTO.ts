import DingTalkDTO from './DingTalkDTO';
import WeChatMiniProgramDTO from './WeChatMiniProgramDTO';
import WeChatOfficialAccountDTO from './WeChatOfficialAccountDTO';
import WeComDTO from './WeComDTO';
export default class ConfigTenantTerminalDetailDTO {
  // 钉钉
  dingTalkDTO: Nullable<DingTalkDTO>;
  // 微信公众号
  weChatOfficialAccountDTO: Nullable<WeChatOfficialAccountDTO>;
  // 企业微信
  weComDTO: Nullable<WeComDTO>;
  // 微信小程序
  weChatMiniProgramDTO: Nullable<WeChatMiniProgramDTO>;
}
