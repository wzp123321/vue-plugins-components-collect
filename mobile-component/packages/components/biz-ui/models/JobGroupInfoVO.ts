export default class JobGroupInfoVO {
	// 岗位分组ID
	id: string = '';
	// 岗位分组名称
	name: string = '';
	// 父级岗位分组id
	parentId: string = '';
	// 父级岗位分组id
	parentName: string = '';
	// 乐观锁
	versionId: string = '';
}