export default class TitleGroupUpdateRequest {
	// 职务分组id
	id: string = '';
	// 职务分组名称
	name: string = '';
	// 父级分组id
	parentId: string = '';
	// 乐观锁
	versionId: number = 0;
}