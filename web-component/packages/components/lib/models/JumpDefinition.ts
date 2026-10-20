import { UrlOpenTypeEnum } from './UrlOpenTypeEnum';
export default class JumpDefinition {
  code: Nullable<string>;
  // 跳转url; 自有业务界面建议填写相对路径; 参数支持使用固定值或变量,可使用占位符(双花括号包裹参数名)表示, 如: /product/product-detail/{{orderId}}?name={{name}}&desc=123; 业务在使用时,可通过传参提供变量的真实值,由应用中心进行占位符的替换,如: {"orderId":"orderId11","name":"xx"}; 返回业务拼接后的url为: /product/product-detail/orderId11?name=xx&desc=123; 若不传或变量匹配失败则不予替换,将配置信息原样返回; 业务使用时自行拼接系统域名; 业务在注册更新时,建议自行保证对旧版本的兼容性,如:在调整变量参数时,兼容旧版的变量参数;
  url: Nullable<string>;
  // 界面打开方式
  openType: Nullable<UrlOpenTypeEnum>;
  // 该跳转定义支持的终端入口编码清单: 需填写team-产品中心-终端入口-终端入口清单中定义的终端入口编码
  supportTerminalEntryCodes: Nullable<string[]>;
}
