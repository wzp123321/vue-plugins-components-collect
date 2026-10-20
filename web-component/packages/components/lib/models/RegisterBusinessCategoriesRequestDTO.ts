import BusinessCategoryDTO from './BusinessCategoryDTO';
export default class RegisterBusinessCategoriesRequestDTO {
	// 产品模块id
	productId: Nullable<string>;
	// 该产品模块下所有的业务分类对象列表
	businessCategories: Nullable<BusinessCategoryDTO[]>;
}