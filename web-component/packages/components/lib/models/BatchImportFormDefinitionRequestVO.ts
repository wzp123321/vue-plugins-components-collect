import FormDefinitionImportInfoVO from './FormDefinitionImportInfoVO';
export default class BatchImportFormDefinitionRequestVO {
	// 用于导入的表单定义信息列表
	formDefinitions: Nullable<FormDefinitionImportInfoVO[]>;
}