import PageQd from './PageQd';
import { MarketCodeAssetOperationStatusEnum } from './MarketCodeAssetOperationStatusEnum';
import { MarketCodeAssetRegisterStatusEnum } from './MarketCodeAssetRegisterStatusEnum';
export default class MarketCodeAssetDefPageQdVO extends PageQd {
  // 资产码名称（模糊查询）
  assetCodeNameLike: Nullable<string>;
  // 资产码注册状态
  registerStatusEq: Nullable<MarketCodeAssetRegisterStatusEnum>;
  // 资产码运营状态
  operationStatusEq: Nullable<MarketCodeAssetOperationStatusEnum>;
  // 是否需要返回已设置的编码方案数量
  needCodeSchemeCount: Nullable<boolean>;
}
