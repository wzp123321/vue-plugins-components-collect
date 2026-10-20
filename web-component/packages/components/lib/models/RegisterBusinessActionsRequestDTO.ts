import BusinessActionDefinitionDTO from './BusinessActionDefinitionDTO';
export default class RegisterBusinessActionsRequestDTO {
	// 产品模块id
	productId: Nullable<string>;
	// 该产品模块下所有的业务动作对象列表
	businessActions: Nullable<BusinessActionDefinitionDTO[]>;
}