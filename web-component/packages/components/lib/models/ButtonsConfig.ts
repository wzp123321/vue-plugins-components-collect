import ButtonConfig from './ButtonConfig';
export default class ButtonsConfig {
	// 执行人的操作配置列表
	operatorButtonList: Nullable<ButtonConfig[]>;
	// 发起人的操作配置列表
	launchButtonList: Nullable<ButtonConfig[]>;
	// 候选人的操作配置列表（抢单）
	candidateButtonList: Nullable<ButtonConfig[]>;
}