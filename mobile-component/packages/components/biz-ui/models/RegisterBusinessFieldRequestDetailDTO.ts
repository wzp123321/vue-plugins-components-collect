import { MarketCodeBusinessFieldDateTypeEnum } from './MarketCodeBusinessFieldDateTypeEnum';
export default class RegisterBusinessFieldRequestDetailDTO {
  // 字段key
  key: string = '';
  // 字段名称
  name: string = '';
  // 数据类型
  dataType: Nullable<MarketCodeBusinessFieldDateTypeEnum>;
  // 字段描述
  description: Nullable<string>;
}
