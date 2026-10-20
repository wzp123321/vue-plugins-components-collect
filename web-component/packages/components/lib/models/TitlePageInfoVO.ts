export default class TitlePageInfoVO {
	// 职务ID
	id: string = '';
	// 职务名称
	name: string = '';
	// 职务编码
	titleNo: string = '';
	// 描述
	description: Nullable<string>;
	// 乐观锁
	versionId: string = '';
	// 分组名称
	parentName: string = '';
	// 分组id
	parentId: Nullable<string>;
}