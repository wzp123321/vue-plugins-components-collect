import MessageConfigVO from './MessageConfigVO';
export default class MessageTypeConfigVO {
  // 消息提醒时机类型：enterNode-进入节点时发送、leaveNode-离开节点时发送、timeout-节点超时未处理时发送
  type: Nullable<string>;
  // 消息提醒配置列表
  messageList: Nullable<MessageConfigVO[]>;
}
