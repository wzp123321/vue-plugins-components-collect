import FormWidgetInstance from './FormWidgetInstance';
export default class FormInstanceDTO {
	// 表单实例id
	formInstanceId: Nullable<string>;
	// 表单定义id
	formDefinitionId: Nullable<string>;
	// 表单定义名称
	name: Nullable<string>;
	// 表单设计器前端版本号
	frontVersion: Nullable<string>;
	// 表单控件实例列表
	children: Nullable<FormWidgetInstance[]>;
}