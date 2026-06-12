import { MarketCodePrintModeEnum } from './MarketCodePrintModeEnum';
import { MarketCodeTaskStatusEnum } from './MarketCodeTaskStatusEnum';
export default class MarketCodePrintTaskListVO {
  // 任务ID
  id: string = '';
  // 任务名称
  name: string = '';
  // 任务状态
  status: Nullable<MarketCodeTaskStatusEnum>;
  // 执行模式
  mode: Nullable<MarketCodePrintModeEnum>;
  // 创建时间
  createTime: number = 0;
  // 执行输出文件名称
  executeOutputFileName: string = '';
  // 执行信息
  executeMessage: string = '';
}
