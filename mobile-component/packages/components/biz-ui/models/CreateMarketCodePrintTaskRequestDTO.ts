import { MarketCodePrintModeEnum } from './MarketCodePrintModeEnum';
export default class CreateMarketCodePrintTaskRequestDTO {
  // 资产码
  assetCode: Nullable<string>;
  // 打印模式
  printMode: Nullable<MarketCodePrintModeEnum>;
  // 打印模板id
  printTemplateId: Nullable<string>;
  // 打印任务所需的其它执行参数json
  otherParams: Nullable<string>;
}
