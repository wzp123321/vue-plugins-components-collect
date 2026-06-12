export default class JobPageInfoVO {
	// 岗位ID
	id: string = '';
	// 岗位名称
	name: string = '';
	// 岗位编码
	jobNo: string = '';
	// 简称
	shortName: Nullable<string>;
	// 适用部门名称
	deptNames: string = '';
	// 描述
	description: Nullable<string>;
	// 乐观锁
	versionId: string = '';
	// 分组名称
	parentName: string = '';
	// 分组id
	parentId: Nullable<string>;
}