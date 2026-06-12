import { MarketCodeScanTypeEnum } from './MarketCodeScanTypeEnum';
export default class MarketCodeDetailScanContentDTO {
  // 资产码
  assetCode: Nullable<string>;
  // 天溯码
  code: Nullable<string>;
  // 扫码类型
  scanType: Nullable<MarketCodeScanTypeEnum>;
  // 扫码内容
  scanContent: Nullable<string>;
  schemeName: Nullable<string>;
}
