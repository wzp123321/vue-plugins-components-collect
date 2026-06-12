import FormWidget from './FormWidget';
export default class FormDefinitionVO {
	// 表单定义id
	formDefinitionId: Nullable<string>;
	// 表单定义名称
	formDefinitionName: Nullable<string>;
	// 前端表单设计器版本号，由前端定义并写死
	frontVersion: Nullable<string>;
	// 表单控件列表
	children: Nullable<FormWidget[]>;
}