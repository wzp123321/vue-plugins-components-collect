export default class MajorDTO {
	// 专业id
	id: string = '';
	// 专业编号
	code: string = '';
	// 专业名称
	name: string = '';
	// 描述信息
	description: Nullable<string>;
	// 租户ID
	tenantId: number = 0;
}