import MessageTypeConfigVO from './MessageTypeConfigVO';
import RejectConfigVO from './RejectConfigVO';
export default class AdvancedConfigVO {
  // 消息提醒方式列表
  messageTypes: Nullable<MessageTypeConfigVO[]>;
  // 是否自动处理：1-自动处理、0-不自动处理
  isAuto: Nullable<number>;
  // 超时时间
  timeout: Nullable<number>;
  // 超时时间的单位：minute-分钟、hour-小时、day-天
  timeUnit: Nullable<string>;
  // 超时时间的单位：minute-分钟、hour-小时、day-天
  processActionCode: Nullable<string>;
  // 驳回按钮的配置
  rejectConfig: Nullable<RejectConfigVO>;
  // 工作台（PC）任务详情地址界面动作编码
  taskDetailAddressPc: Nullable<string>;
  // 工作台（移动端）待办列表界面动作编码
  todoListAddressMobile: Nullable<string>;
}
