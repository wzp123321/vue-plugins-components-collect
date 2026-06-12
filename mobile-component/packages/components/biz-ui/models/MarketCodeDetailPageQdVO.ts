import PageQd from './PageQd';
import { MarketCodeDetailStatusEnum } from './MarketCodeDetailStatusEnum';
export default class MarketCodeDetailPageQdVO extends PageQd {
  // 资产码
  assetCodeEq: Nullable<string>;
  // 天溯码
  codeEq: Nullable<string>;
  // 业务对象id
  businessEntityIdEq: Nullable<string>;
  // 三方编码1
  thirdCode1Eq: Nullable<string>;
  // 三方编码2
  thirdCode2Eq: Nullable<string>;
  // 三方编码3
  thirdCode3Eq: Nullable<string>;
  // 激活状态
  statusEq: Nullable<MarketCodeDetailStatusEnum>;
}
