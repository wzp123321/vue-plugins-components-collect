export default class LabelGroupDelRequest {
	// 标签分组id
	id: Nullable<string>;
	// 乐观锁
	versionId: number = 0;
}