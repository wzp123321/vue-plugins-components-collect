import BusinessFieldDefinitionDTO from './BusinessFieldDefinitionDTO';
export default class RegisterBusinessFieldsRequestDTO {
	// 产品模块id
	productId: Nullable<string>;
	// 该产品模块下所有的业务字段对象列表
	businessFields: Nullable<BusinessFieldDefinitionDTO[]>;
}