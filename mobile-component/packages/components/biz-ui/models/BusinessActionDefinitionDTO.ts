export default class BusinessActionDefinitionDTO {
	// 业务动作编码，在产品模块内唯一
	code: Nullable<string>;
	// 业务动作名称
	name: Nullable<string>;
	// 业务动作api接口请求路径，支持http(无注册中心的)/lb(同一注册中心内的)协议的绝对路径，要求以POST方式实现
	api: Nullable<string>;
	// 业务动作api接口超时时长（单位：毫秒），最大3秒，不传则默认1秒
	timeout: Nullable<number>;
}