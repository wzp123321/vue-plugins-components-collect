export default class JobAddRequest {
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
}