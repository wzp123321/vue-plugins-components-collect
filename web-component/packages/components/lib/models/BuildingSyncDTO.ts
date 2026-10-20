export default class BuildingSyncDTO {
	// id
	id: Nullable<string>;
	// 上级id
	parentId: Nullable<string>;
	// 编码
	buildingCode: Nullable<string>;
	// 名称
	buildingName: Nullable<string>;
	// 空间层级：0-医院；1-院区；2-建筑；3-建筑分区；4-楼层；5-楼层分区；6-房间；7-房间分区
	levelCode: Nullable<string>;
	// id路径
	idPath: Nullable<string>;
	// 排序
	sort: Nullable<string>;
	// 是否删除
	isDelete: Nullable<string>;
	// 状态：0-闲置中1-使用中 2-维护中
	status: Nullable<string>;
}