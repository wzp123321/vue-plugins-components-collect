import CodeName from './CodeName';
import FormWidget from './FormWidget';
import IdName from './IdName';
export default class FormDefinitionImportInfoVO {
	// 表单定义编码
	formDefinitionCode: Nullable<string>;
	// 表单定义名称
	formDefinitionName: Nullable<string>;
	// 表单定义描述
	formDefinitionDesc: Nullable<string>;
	// 业务应用
	appInstance: Nullable<IdName>;
	// 业务分类
	businessCategory: Nullable<CodeName>;
	// 表单控件列表
	children: Nullable<FormWidget[]>;
}