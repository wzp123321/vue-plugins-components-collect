import MessageConfigVO from './MessageConfigVO';
import RejectConfigVO from './RejectConfigVO';
export default class ButtonConfigVO {
  // 新增时生成的唯一id：button_uuid
  id: Nullable<string>;
  // 操作类型
  type: Nullable<string>;
  // 操作按钮名称
  label: Nullable<string>;
  // 业务动作编码
  businessActionCode: Nullable<string>;
  // 界面动作编码
  uIActionCode: Nullable<string>;
  // 是否开启消息提醒：1-开启、0-关闭
  isMessage: Nullable<number>;
  // 消息提醒的配置
  messageList: Nullable<MessageConfigVO[]>;
  // 驳回按钮的配置
  rejectConfig: Nullable<RejectConfigVO>;
}
