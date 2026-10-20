export default class ZoneInfoRequest {
	// 院区id
	id: Nullable<string>;
	// 租户id
	tenantId: Nullable<string>;
	// 院区编码
	code: Nullable<string>;
	// 院区名称
	name: Nullable<string>;
	// 院区简称
	simpleName: Nullable<string>;
	// 类型：0-院区(默认),1-社区，2-园区
	type: Nullable<string>;
	// 位置信息-名称
	locationName: Nullable<string>;
	// 位置信息-经度
	locationLongitude: Nullable<string>;
	// 位置信息-纬度
	locationLatitude: Nullable<string>;
	// 地址信息
	address: Nullable<string>;
}