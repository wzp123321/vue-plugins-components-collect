// mq同步反查详情接口响应体
export default class HospitalSyncDTO {
	// id
	id: Nullable<string>;
	// 编码
	locationCode: Nullable<string>;
	// 名称
	locationName: Nullable<string>;
	// id路径
	idPath: Nullable<string>;
	// 排序
	sort: Nullable<string>;
	// 是否删除
	isDelete: Nullable<string>;
	// 状态：0-闲置中1-使用中 2-维护中
	status: Nullable<string>;
}