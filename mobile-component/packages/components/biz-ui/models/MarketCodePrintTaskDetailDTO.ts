import { MarketCodePrintModeEnum } from './MarketCodePrintModeEnum';
import { MarketCodeTaskStatusEnum } from './MarketCodeTaskStatusEnum';
export default class MarketCodePrintTaskDetailDTO {
  //
  name: Nullable<string>;
  //
  status: Nullable<MarketCodeTaskStatusEnum>;
  //
  progress: Nullable<number>;
  //
  mode: Nullable<MarketCodePrintModeEnum>;
  //
  startTime: Nullable<Date>;
  //
  endTime: Nullable<Date>;
  //
  executeOutputFileName: Nullable<string>;
  //
  executeOutputFile: Nullable<string>;
  //
  executeMessage: Nullable<string>;
}
