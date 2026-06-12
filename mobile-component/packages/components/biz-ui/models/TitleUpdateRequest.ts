export default class TitleUpdateRequest {
	// 职务主键id
	id: string = '';
	// 职务名称
	name: string = '';
	// 职务分组id
	groupId: string = '';
	// 描述
	description: Nullable<string>;
	// 乐观锁
	versionId: number = 0;
}