import MarketCodePrintCodeLabelRequestDetailDTO from './MarketCodePrintCodeLabelRequestDetailDTO';
import { MarketCodePrintModeEnum } from './MarketCodePrintModeEnum';
export default class MarketCodePrintCodeLabelRequestDTO {
  // 打印模板id
  printTemplateId: Nullable<string>;
  // 打印模式
  printMode: Nullable<MarketCodePrintModeEnum>;
  // 打印明细
  details: Nullable<MarketCodePrintCodeLabelRequestDetailDTO[]>;
}
