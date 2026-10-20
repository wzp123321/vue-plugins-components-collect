import { AuthTypeEnum } from './AuthTypeEnum';
import { JumpWayEnum } from './JumpWayEnum';
// 应用实例扩展信息
export default class ApplicationAppendVO {
  // 应用实例id
  appInstanceId: Nullable<string>;
  // 终端id
  terminalId: Nullable<string>;
  // 应用跳转方式: externalLink-外部链接,internalLink-内部链接
  jumpWay: Nullable<JumpWayEnum>;
  // 默认应用入口地址
  applicationHomeUrl: Nullable<string>;
  // 鉴权方式
  authType: Nullable<AuthTypeEnum>;
}
