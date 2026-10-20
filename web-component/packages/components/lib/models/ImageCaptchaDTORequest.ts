export default class ImageCaptchaDTORequest {
	// 终端id，企业微信、钉钉等平台是第三方应用id，workbench-天溯工作台，smc-天溯系统管理中心，yst-天溯医溯通APP
	terminalId: Nullable<string>;
	// 重新签发验证码时作废的图片验证码文本键,首次签发时为空
	invalidCaptchaKey: Nullable<string>;
}