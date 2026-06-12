import { MarketCodeTaskStatusEnum } from './MarketCodeTaskStatusEnum';
export default class MarketCodePrintTaskUpdateProgressRequestDTO {
  // 打印任务id
  taskId: Nullable<string>;
  // 任务状态
  status: Nullable<MarketCodeTaskStatusEnum>;
  // 任务进度
  progress: Nullable<number>;
  // 最后执行完的序号，从1开始，任务初始为0
  lastExecutedNo: Nullable<number>;
  // 执行输出文件名
  executeOutputFileName: Nullable<string>;
  // 执行输出文件地址
  executeOutputFile: Nullable<string>;
  // 执行信息
  executeMessage: Nullable<string>;
  // 结束时间
  endTime: Nullable<Date>;
}
