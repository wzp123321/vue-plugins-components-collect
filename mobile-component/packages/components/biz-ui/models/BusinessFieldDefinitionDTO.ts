import FormWidgetConfigDTO from './FormWidgetConfigDTO';
import { BusinessFieldTypeEnum } from './BusinessFieldTypeEnum';
export default class BusinessFieldDefinitionDTO {
	// 业务字段编码，在产品模块内唯一
	code: Nullable<string>;
	// 业务字段名称
	name: Nullable<string>;
	// 业务字段类型
	type: Nullable<BusinessFieldTypeEnum>;
	// 表单中是否可以以业务控件形式选择到该字段：true-可以、false-不可以
	formUse: Nullable<boolean>;
	// 动态表单相关控件设置，当formUse为true时必填
	formWidgetConfig: Nullable<FormWidgetConfigDTO>;
	// 动态表单相关控件配置版本，从1开始，当formUse为true时必填
	formWidgetConfigVersion: Nullable<number>;
}