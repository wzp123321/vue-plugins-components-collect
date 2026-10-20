export default class InputProp {
	// 标题
	label: Nullable<string>;
	// 默认提示
	placeholder: Nullable<string>;
	// 默认值
	defaultValue: Nullable<string>;
	// 是否必填，默认为true
	required: Nullable<boolean>;
	// 布局设置，仅对pc端生效，一行分成24列，span为几表示占几列：24-整行、12-1/2行，默认为24
	span: Nullable<number>;
}