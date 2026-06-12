import { MarketCodeAssetSchemeStatusEnum } from './MarketCodeAssetSchemeStatusEnum';
export default class UpdateMarketCodeAssetDefSchemeStatusRequestVO {
  // 方案id
  schemeId: Nullable<string>;
  // 状态
  status: Nullable<MarketCodeAssetSchemeStatusEnum>;
}
