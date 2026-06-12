import PageQd from './PageQd';
import { MarketCodePrintModeEnum } from './MarketCodePrintModeEnum';
import { MarketCodeTaskStatusEnum } from './MarketCodeTaskStatusEnum';
export default class MarketCodePrintTaskPageQdVO extends PageQd {
  // 任务id
  taskIdEq: Nullable<string>;
  // 任务名称
  taskNameLike: Nullable<string>;
  // 任务状态
  taskStatusIn: Nullable<MarketCodeTaskStatusEnum[]>;
  // 打印模式
  printModeIn: Nullable<MarketCodePrintModeEnum[]>;
}
