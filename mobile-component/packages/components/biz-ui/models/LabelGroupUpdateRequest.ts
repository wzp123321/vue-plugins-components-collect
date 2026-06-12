export default class LabelGroupUpdateRequest {
	// 标签分组id
	id: string = '';
	// 标签分组名称
	name: string = '';
	// 父级分组id
	parentId: string = '';
	// 乐观锁
	versionId: number = 0;
}