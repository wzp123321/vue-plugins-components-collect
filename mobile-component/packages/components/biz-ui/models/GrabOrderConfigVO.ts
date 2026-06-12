import MemberOptionsVO from './MemberOptionsVO';
import OperatorConfigVO from './OperatorConfigVO';
export default class GrabOrderConfigVO {
  // 候选人配置
  candidateOptions: Nullable<MemberOptionsVO>;
  // 是否开启超时设置：1-开启、0关闭
  isTimeoutSet: Nullable<number>;
  // 超时时间
  timeout: Nullable<number>;
  // 超时时间的单位：minute-分钟、hour-小时、day-天
  timeUnit: Nullable<string>;
  // 超时处理人配置
  operatorConfig: Nullable<OperatorConfigVO>;
}
