export default class QrCodeTemplateSaveRequestVO {
	// 模板id
	id: Nullable<string>;
	// 二维码模板key
	templateKey: string = '';
	// 二维码配置顶层图片地址
	topLogo: Nullable<string>;
	// 二维码中间图片地址
	botLogo: Nullable<string>;
	// 二维码标题
	title: Nullable<string>;
}