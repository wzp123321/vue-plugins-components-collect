import { MarketCodeAssetOperationStatusEnum } from './MarketCodeAssetOperationStatusEnum';
import { MarketCodeAssetRegisterStatusEnum } from './MarketCodeAssetRegisterStatusEnum';
export default class MarketCodeAssetDefListVO {
  // id
  id: Nullable<string>;
  // 租户id
  tenantId: Nullable<string>;
  // 资产码
  assetCode: Nullable<string>;
  // 资产码名称
  assetCodeName: Nullable<string>;
  // 业务对象名称
  businessEntityName: Nullable<string>;
  // 注册状态
  registerStatus: Nullable<MarketCodeAssetRegisterStatusEnum>;
  // 运营状态
  operationStatus: Nullable<MarketCodeAssetOperationStatusEnum>;
  // 描述
  description: Nullable<string>;
  // 已设置的编码方案数量
  codeSchemeCount: Nullable<number>;
}
