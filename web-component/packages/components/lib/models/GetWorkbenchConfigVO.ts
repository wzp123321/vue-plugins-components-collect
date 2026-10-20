import WorkbenchConfigContent from './WorkbenchConfigContent';
export default class GetWorkbenchConfigVO {
  // id,主键
  id: Nullable<string>;
  // 配置详情
  contents: Nullable<WorkbenchConfigContent[]>;
}
