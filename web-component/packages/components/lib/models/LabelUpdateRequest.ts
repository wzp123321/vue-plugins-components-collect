export default class LabelUpdateRequest {
	// 标签主键id
	id: string = '';
	// 标签名称
	name: string = '';
	// 标签分组id
	groupId: string = '';
	// 描述
	description: Nullable<string>;
	// 乐观锁
	versionId: number = 0;
}