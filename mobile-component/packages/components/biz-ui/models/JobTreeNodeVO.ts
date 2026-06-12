// 岗位树对象
export default class JobTreeNodeVO {
	// ID
	id: string = '';
	// 名称
	name: string = '';
	// 父级岗位分组id
	parentId: string = '';
	// 类型：0 岗位分组 1 岗位
	type: number = 0;
	// 乐观锁
	versionId: string = '';
}