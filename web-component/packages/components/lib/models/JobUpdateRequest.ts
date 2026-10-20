export default class JobUpdateRequest {
	// 岗位主键id
	id: string = '';
	// 岗位名称
	name: string = '';
	// 岗位简称
	shortName: Nullable<string>;
	// 岗位分组id
	groupId: string = '';
	// 适用部门id
	deptIdList: Nullable<string[]>;
	// 描述
	description: Nullable<string>;
	// 乐观锁
	versionId: number = 0;
}