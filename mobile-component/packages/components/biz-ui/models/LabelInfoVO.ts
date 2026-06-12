export default class LabelInfoVO {
	// 职务ID
	id: string = '';
	// 职务名称
	name: string = '';
	// 职务编码
	titleNo: string = '';
	// 父级职务分组id
	groupId: string = '';
	// 父级职务分组名称
	groupName: string = '';
	// 描述
	description: Nullable<string>;
	// 乐观锁
	versionId: string = '';
}