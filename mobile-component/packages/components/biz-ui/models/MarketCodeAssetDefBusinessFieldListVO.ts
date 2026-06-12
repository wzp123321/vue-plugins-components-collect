import { MarketCodeBusinessFieldDateTypeEnum } from './MarketCodeBusinessFieldDateTypeEnum';
export default class MarketCodeAssetDefBusinessFieldListVO {
  // 字段key
  key: Nullable<string>;
  // 字段名称
  name: Nullable<string>;
  // 数据类型
  dataType: Nullable<MarketCodeBusinessFieldDateTypeEnum>;
  // 字段描述
  description: Nullable<string>;
}
