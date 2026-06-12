import VariableBinding from './VariableBinding';
import { MarketCodeAssetSchemeStatusEnum } from './MarketCodeAssetSchemeStatusEnum';
import { MarketCodeAssetSchemeTypeEnum } from './MarketCodeAssetSchemeTypeEnum';
import { MarketCodeMatchFieldEnum } from './MarketCodeMatchFieldEnum';
import { MarketCodeScanTypeEnum } from './MarketCodeScanTypeEnum';
export default class MarketCodeAssetDefSchemeDetailVO {
  // 方案id
  schemeId: Nullable<string>;
  // 方案名称
  schemeName: Nullable<string>;
  // 是否预置
  isPreset: Nullable<boolean>;
  // 方案分类
  schemeType: Nullable<MarketCodeAssetSchemeTypeEnum>;
  // 扫码类型
  scanType: Nullable<MarketCodeScanTypeEnum>;
  // 匹配字段
  matchField: Nullable<MarketCodeMatchFieldEnum>;
  // 是否需要鉴权
  authEnabled: Nullable<boolean>;
  // 状态
  status: Nullable<MarketCodeAssetSchemeStatusEnum>;
  // 扫码内容
  scanContent: Nullable<string>;
  // 扫码内容参数绑定
  scanContentParamBindings: Nullable<VariableBinding[]>;
  // 扫码识别规则
  scanContentMatchRule: Nullable<string>;
}
