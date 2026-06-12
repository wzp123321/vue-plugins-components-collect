import ActionButton from './ActionButton';
export default class TaskActionInfo {
  // 执行人/候选人操作按钮信息
  operatorActionButtons: Nullable<ActionButton[]>;
  // 发起人操作按钮信息
  starterActionButtons: Nullable<ActionButton[]>;
}
