import { AuthAlgorithmEnum } from './AuthAlgorithmEnum';
export default class GetDeveloperVO {
  // 开发者名称
  appName: Nullable<string>;
  // 接入公钥
  appId: Nullable<string>;
  // 接入秘钥
  appSecret: Nullable<string>;
  // 描述信息
  description: Nullable<string>;
  // 鉴权方式,basic,jwt,aes
  authType: Nullable<AuthAlgorithmEnum>;
  // 来源: 0-平台、子系统、1-第三方
  source: Nullable<number>;
}
