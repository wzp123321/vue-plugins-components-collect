import { FormDefinitionStatusEnum } from './FormDefinitionStatusEnum';
export default class UpdateFormDefinitionStatusRequestVO {
	// 表单定义id
	formDefinitionId: Nullable<string>;
	// 表单定义状态
	status: Nullable<FormDefinitionStatusEnum>;
}