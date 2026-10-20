import { TaskCustomAttachmentTypeEnum } from './TaskCustomAttachmentTypeEnum';
export default class TaskAttachmentDTO {
  // 附件名称
  fileName: Nullable<string>;
  // 附件类型
  fileType: Nullable<TaskCustomAttachmentTypeEnum>;
  // 附件路径
  fileUrl: Nullable<string>;
}
