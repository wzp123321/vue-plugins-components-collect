import IdName from './IdName';
import TaskAttachmentDTO from './TaskAttachmentDTO';
import { ProcessActionCodeEnum } from './ProcessActionCodeEnum';
import { TaskStatusEnum } from './TaskStatusEnum';
export default class TaskActivityLogDTO {
  // 任务实例id
  taskInstanceId: Nullable<string>;
  // 处理人列表
  handlers: Nullable<IdName[]>;
  // 抄送人列表
  ccs: Nullable<IdName[]>;
  // 任务要转交到的员工
  handOverTo: Nullable<IdName>;
  // 动作名称
  actionName: Nullable<string>;
  // 流程动作编码
  processActionCode: Nullable<ProcessActionCodeEnum>;
  // 任务状态：COMPLETED-已完成、INCOMPLETE-未完成
  status: Nullable<TaskStatusEnum>;
  // 任务创建时间时间戳
  createTime: Nullable<number>;
  // 任务完成时间时间戳
  completeTime: Nullable<number>;
  // 超时时长，单位：秒
  timeout: Nullable<number>;
  // 备注
  comment: Nullable<string>;
  // 附件列表
  attachments: Nullable<TaskAttachmentDTO[]>;
}
