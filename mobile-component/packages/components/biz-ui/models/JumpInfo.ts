import { JumpUrlTypeEnum } from './JumpUrlTypeEnum';
import { TerminalTypeEnum } from './TerminalTypeEnum';
import { UrlOpenTypeEnum } from './UrlOpenTypeEnum';
export default class JumpInfo {
  // 跳转url
  jumpUrl: Nullable<string>;
  // 跳转url类型
  jumpUrlType: Nullable<JumpUrlTypeEnum>;
  // 界面打开方式
  openType: Nullable<UrlOpenTypeEnum>;
  // 界面支持的终端类型清单
  supportTerminalTypes: Nullable<TerminalTypeEnum[]>;
  // 界面支持的终端id清单
  supportTerminalIds: Nullable<string[]>;
  // uni应用id，前端应用基于uni-app框架开发时必填
  uniAppId: Nullable<string>;
}
