import FormFieldConfig from './FormFieldConfig';
export default class FormConfig {
	// 表单定义id
	formDefinitionId: Nullable<string>;
	// 表单版本id
	formVersionId: Nullable<string>;
	// 呈现字段配置
	fieldList: Nullable<FormFieldConfig[]>;
	// 勾选的回写字段的key列表
	writeBackFieldList: Nullable<string[]>;
}