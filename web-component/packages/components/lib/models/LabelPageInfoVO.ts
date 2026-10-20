export default class LabelPageInfoVO {
	// 职务ID
	id: string = '';
	// 职务名称
	name: string = '';
	// 职务编码
	code: string = '';
	// 描述
	description: Nullable<string>;
	// 乐观锁
	versionId: string = '';
	// 分组名称
	parentName: string = '';
	// 分组id
	parentId: Nullable<string>;
	// 能否修改
	editable: Nullable<boolean>;
	// 能否删除
	deletable: Nullable<boolean>;
}