export default class UpdateQualificationTypeVORequest {
	// 资质类型ID
	id: Nullable<string>;
	// 资质类型名称
	name: Nullable<string>;
	// 关联岗位ID列表
	jobIds: Nullable<string[]>;
	// 到期提醒人类型编码
	recipientTypeCodes: Nullable<string[]>;
	// 描述
	description: Nullable<string>;
}