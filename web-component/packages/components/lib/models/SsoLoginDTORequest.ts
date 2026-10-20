export default class SsoLoginDTORequest {
	// 其他系统传入的授权码
	authCode: Nullable<string>;
	// 登录终端类型: wxworkH5-企业微信、wechatH5-微信公众号、dingtalkH5-钉钉H5应用、pcWeb-天溯后勤运维平台、app-天溯APP、wechatMini-微信小程序
	terminalType: Nullable<string>;
	// 终端id，企业微信、钉钉等平台是第三方应用id，workbenchWeb-天溯工作台，opWeb-天溯系统管理中心，workbenchApp-天溯医溯通APP，mljcWeChatmini-美兰机场小程序
	terminalId: Nullable<string>;
}