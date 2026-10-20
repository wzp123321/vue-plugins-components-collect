import UiActionDefinition from './UiActionDefinition';
export default class TaskBriefVO {
  // 任务实例id
  taskInstanceId: Nullable<string>;
  // 任务标题
  summary: Nullable<string>;
  // 任务描述
  description: Nullable<string>;
  // 截止时间时间戳
  dueDate: Nullable<number>;
  // 基于业务分类注册的界面动作
  uiActions: Nullable<UiActionDefinition[]>;
}
