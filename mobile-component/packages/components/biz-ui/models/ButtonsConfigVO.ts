import ButtonConfigVO from './ButtonConfigVO';
export default class ButtonsConfigVO {
  // 执行人的操作配置列表
  operatorButtonList: Nullable<ButtonConfigVO[]>;
  // 发起人的操作配置列表
  launchButtonList: Nullable<ButtonConfigVO[]>;
  // 候选人的操作配置列表（抢单）
  candidateButtonList: Nullable<ButtonConfigVO[]>;
}
