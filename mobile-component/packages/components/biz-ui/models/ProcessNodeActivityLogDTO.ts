import TaskActivityLogDTO from './TaskActivityLogDTO';
import { ProcessNodeTypeEnum } from './ProcessNodeTypeEnum';
export default class ProcessNodeActivityLogDTO {
  // 流程节点id
  nodeId: Nullable<string>;
  // 流程节点名称
  nodeName: Nullable<string>;
  // 流程节点类型：START_EVENT-开始节点、USER_TASK-任务节点、END_EVENT-结束节点
  nodeType: Nullable<ProcessNodeTypeEnum>;
  // 多人审批方式：COUNTER_SIGN-会签、OR_SIGN-或签
  approveType: Nullable<string>;
  // 流程节点下的任务执行日志列表
  taskActivityLogs: Nullable<TaskActivityLogDTO[]>;
}
