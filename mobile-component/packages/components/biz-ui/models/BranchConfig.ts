export default class BranchConfig {
	// 根据设置的条件，生成的条件表达式
	conditionExpress: Nullable<string>;
	// 前端展示需要使用的分支条件字符串，后端仅透传
	conditionStr: Nullable<string>;
	// 指定分支时，选择的流程动作按钮的id号
	buttonId: Nullable<string>;
}