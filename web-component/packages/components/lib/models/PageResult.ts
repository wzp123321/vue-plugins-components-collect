export default class PageResult<T> {
	// 数据集
	records: Nullable<T[]>;
	// 数据总数
	total: Nullable<number>;
	// 页码，起始值为1
	pageNum: Nullable<number>;
	// 分页大小
	pageSize: Nullable<number>;
}