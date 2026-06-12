import VariableBinding from './VariableBinding';
import { MarketCodeAssetSchemeTypeEnum } from './MarketCodeAssetSchemeTypeEnum';
import { MarketCodeMatchFieldEnum } from './MarketCodeMatchFieldEnum';
import { MarketCodeScanTypeEnum } from './MarketCodeScanTypeEnum';
export default class CreateMarketCodeAssetDefSchemeRequestVO {
  // 资产码
  assetCode: Nullable<string>;
  // 方案名称
  schemeName: Nullable<string>;
  // 方案分类
  schemeType: Nullable<MarketCodeAssetSchemeTypeEnum>;
  // 扫码类型
  scanType: Nullable<MarketCodeScanTypeEnum>;
  // 匹配字段
  matchField: Nullable<MarketCodeMatchFieldEnum>;
  // 是否需要鉴权
  authEnabled: Nullable<boolean>;
  // 扫码内容
  scanContent: Nullable<string>;
  // 扫码内容参数绑定
  scanContentParamBindings: Nullable<VariableBinding[]>;
  // 扫码识别规则
  scanContentMatchRule: Nullable<string>;
}
