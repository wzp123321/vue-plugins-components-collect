export default class WeChatOfficialAccountVO {
	// 终端id,主键id
	id: Nullable<string>;
	// 终端id,业务id
	terminalId: Nullable<string>;
	// 终端名称
	name: Nullable<string>;
	// appId
	appId: Nullable<string>;
	// appSecret
	appSecret: Nullable<string>;
	// 二维码url
	qrCodeUrl: Nullable<string>;
}