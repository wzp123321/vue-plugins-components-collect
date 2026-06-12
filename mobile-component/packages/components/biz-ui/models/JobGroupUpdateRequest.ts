export default class JobGroupUpdateRequest {
	// 岗位分组id
	id: string = '';
	// 岗位分组名称
	name: string = '';
	// 父级分组id
	parentId: string = '';
	// 乐观锁
	versionId: number = 0;
}