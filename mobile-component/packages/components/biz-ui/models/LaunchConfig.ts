import ButtonConfig from './ButtonConfig';
import FormConfig from './FormConfig';
export default class LaunchConfig {
	// 是否允许发起人撤销流程
	canCancel: Nullable<boolean>;
	// 发起人撤销按钮设置
	cancelButton: Nullable<ButtonConfig>;
	// 发起人表单设置
	formConfig: Nullable<FormConfig>;
}