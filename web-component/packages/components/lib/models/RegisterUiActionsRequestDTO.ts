import UiActionDefinition from './UiActionDefinition';
export default class RegisterUiActionsRequestDTO {
	// 产品模块id
	productId: Nullable<string>;
	// 该产品模块下所有的界面动作对象列表
	uiActions: Nullable<UiActionDefinition[]>;
}