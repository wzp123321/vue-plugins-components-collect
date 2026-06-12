export default class QrcodeCreateRequestDTO {
	// 标识物主键
	markerPrimary: string = '';
	// 标识物编码
	markerCode: string = '';
	// 标识物类型
	markerType: string = '';
	// 打印模板标识，用于查询打印模板配置
	printTemplateKey: Nullable<string>;
}