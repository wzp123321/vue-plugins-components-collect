import { MarketCodeDetailStatusEnum } from './MarketCodeDetailStatusEnum';
export default class MarketCodeDetailListVO {
  // 天溯码
  code: Nullable<string>;
  // 资产码名称
  assetCodeName: Nullable<string>;
  // 编码状态
  status: Nullable<MarketCodeDetailStatusEnum>;
  // 业务对象id
  businessEntityId: Nullable<string>;
  // 三方编码1
  thirdCode1: Nullable<string>;
  // 三方编码2
  thirdCode2: Nullable<string>;
  // 三方编码3
  thirdCode3: Nullable<string>;
}
