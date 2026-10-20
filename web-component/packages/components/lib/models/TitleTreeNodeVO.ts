// 职务树对象
export default class TitleTreeNodeVO {
	// 职务ID
	id: string = '';
	// 职务名称
	name: string = '';
	// 父级职务分组id
	parentId: string = '';
	// 类型：0 岗位分组 1 岗位
	type: number = 0;
	// 乐观锁
	versionId: string = '';
}