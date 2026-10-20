import { WorkbenchConfigLevelEnum } from './WorkbenchConfigLevelEnum';
export default class GetWorkbenchConfigRequest {
  // 终端id
  terminalIdEq: Nullable<string>;
  // 配置级别,默认租户级
  configLevelEq: Nullable<WorkbenchConfigLevelEnum>;
  // 配置的版本号,由前端指定,不传则获取最近编辑过的配置信息
  versionEq: Nullable<number>;
}
