import { AuthTypeEnum } from './AuthTypeEnum';
export default class SsoRedirectResponseVO {
  // 跳转地址：返回的地址拼接参数；绝对地址直接打开；相对地址加上当前页地址再打开
  url: Nullable<string>;
  // 鉴权方式
  authType: Nullable<AuthTypeEnum>;
}
