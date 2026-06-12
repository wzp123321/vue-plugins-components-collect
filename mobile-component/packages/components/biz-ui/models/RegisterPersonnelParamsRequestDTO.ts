import PersonnelParamDefinitionDTO from './PersonnelParamDefinitionDTO';
export default class RegisterPersonnelParamsRequestDTO {
	// 产品模块id
	productId: Nullable<string>;
	// 该产品模块下所有的人员参数对象列表
	personnelParams: Nullable<PersonnelParamDefinitionDTO[]>;
}