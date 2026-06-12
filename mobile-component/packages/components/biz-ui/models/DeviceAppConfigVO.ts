export default class DeviceAppConfigVO {
	// id
	id: Nullable<string>;
	// 应用产品id，每个产品固化，据此获取appInstanceId
	appProductId: Nullable<string>;
	// '应用名称'
	appName: Nullable<string>;
	// '应用链接地址'
	appUrl: Nullable<string>;
	// 是否启用-1是；0-否
	enable: Nullable<string>;
	// 创建时间
	createTime: Nullable<string>;
	// 修改时间
	updateTime: Nullable<string>;
}