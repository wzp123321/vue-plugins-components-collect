export default class ProjectSyncDTO {
	// id
	id: Nullable<string>;
	// 上级id
	parentId: Nullable<string>;
	// 编码
	projectCode: Nullable<string>;
	// 名称
	projectName: Nullable<string>;
	// 空间层级：1-院区；
	levelCode: Nullable<string>;
	// id路径
	idPath: Nullable<string>;
	// 排序
	sort: Nullable<string>;
	// 是否删除
	isDelete: Nullable<string>;
	// 状态：0-闲置中 1-使用中 2-维护中
	status: Nullable<string>;
}