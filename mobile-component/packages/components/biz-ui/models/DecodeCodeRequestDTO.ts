export default class DecodeCodeRequestDTO {
	// 内容
	content: string = '';
	// 是否需要鉴权。优先级高于方案中的配置，不传时使用方案中的配置
	authEnabled: Nullable<boolean>;
	// 是否需要查询运营策略。为true会返回跳转地址，否则不会返回
	queryOperationEnabled: boolean = false;
	// 终端类型编码。需要配鉴权时，如果不传则无法生成鉴权地址
	terminalTypeCode: Nullable<string>;
	// 终端入口编码
	terminalEntryCode: string = '';
}