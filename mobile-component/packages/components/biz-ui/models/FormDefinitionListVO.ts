import CodeName from './CodeName';
import IdName from './IdName';
import StandardEntity from './StandardEntity';
import { FormDefinitionStatusEnum } from './FormDefinitionStatusEnum';
export default class FormDefinitionListVO extends StandardEntity {
	// 表单定义id
	formDefinitionId: Nullable<string>;
	// 表单定义名称
	formDefinitionName: Nullable<string>;
	// 表单定义描述
	formDefinitionDesc: Nullable<string>;
	// 业务应用
	appInstance: Nullable<IdName>;
	// 业务分类
	businessCategory: Nullable<CodeName>;
	// 表单定义版本
	version: Nullable<string>;
	// 表单定义状态
	status: Nullable<FormDefinitionStatusEnum>;
}