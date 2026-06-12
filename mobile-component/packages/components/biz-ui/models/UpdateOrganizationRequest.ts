export default class UpdateOrganizationRequest {
	// id
	id: string = '';
	// 乐观锁版本号
	versionId: number = 0;
	// 组织名称
	name: string = '';
	// 统一信用代码
	code: Nullable<string>;
	// 组织类型: 0-管理方（默认）、1-服务商、2-运营商
	type: number = 0;
	// 位置信息-名称
	locationName: Nullable<string>;
	// 位置信息-经度
	locationLongitude: Nullable<number>;
	// 位置信息-纬度
	locationLatitude: Nullable<number>;
	// 地址: 省市区
	addrMain: Nullable<string>;
	// 地址: 详细
	addrEx: Nullable<string>;
	// 组织管理员员工id
	adminEmployeeId: string = '';
	// 组织管理员联系方式
	adminPhone: string = '';
}