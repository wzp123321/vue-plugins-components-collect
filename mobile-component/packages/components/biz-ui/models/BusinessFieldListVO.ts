import { BusinessFieldTypeEnum } from './BusinessFieldTypeEnum';
export default class BusinessFieldListVO {
	// 业务字段编码
	code: Nullable<string>;
	// 业务字段名称
	name: Nullable<string>;
	// 业务字段类型
	type: Nullable<BusinessFieldTypeEnum>;
}