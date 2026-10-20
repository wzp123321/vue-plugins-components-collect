// 产品模块基础信息
export default class GetAllProductIdNameVO {
	// 产品模块id
	productId: Nullable<string>;
	// 产品模块名称
	productName: Nullable<string>;
	// 是否支持多实例: 0-否,1-是
	multiApp: Nullable<boolean>;
	// 是否已实例化
	instantiated: Nullable<boolean>;
}