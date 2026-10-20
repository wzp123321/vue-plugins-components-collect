import WorkbenchConfigContent from './WorkbenchConfigContent';
import { WorkbenchConfigLevelEnum } from './WorkbenchConfigLevelEnum';
export default class InsertWorkbenchConfigRequest {
  // 终端id
  terminalId: Nullable<string>;
  // 配置级别
  configLevel: Nullable<WorkbenchConfigLevelEnum>;
  // 配置的版本号,由前端指定,为空则后台自动生成
  version: Nullable<number>;
  // 配置详情
  contents: Nullable<WorkbenchConfigContent[]>;
}
