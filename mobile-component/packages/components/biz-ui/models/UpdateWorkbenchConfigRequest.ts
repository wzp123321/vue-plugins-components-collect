import WorkbenchConfigContent from './WorkbenchConfigContent';
export default class UpdateWorkbenchConfigRequest {
  // id,主键
  id: Nullable<string>;
  // 配置的版本号,由前端指定,为空则更新最近编辑过的数据
  version: Nullable<number>;
  // 配置详情
  contents: Nullable<WorkbenchConfigContent[]>;
}
