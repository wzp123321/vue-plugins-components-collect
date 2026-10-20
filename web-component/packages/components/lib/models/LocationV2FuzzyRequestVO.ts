export default class LocationV2FuzzyRequestVO {
	// 模糊查询name
	nameLike: Nullable<string>;
	// 待筛选的院区id
	projectIn: Nullable<string[]>;
}