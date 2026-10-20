export default class CustomPageInfoRequestDTO {
	// 业务界面id主键; 由[产品模块id.子模块编码.业务界面编码]拼接而成
	idEq: string = '';
	// 终端入口编码,根据此参数过滤业务界面跳转信息,为空则返回全部
	terminalEntryCodeEq: Nullable<string>;
	// 变量参数实际值映射集合,由后台匹配mapKey和url中的变量参数名进行替换对应的value,如: {"orderId":"orderId11",""name"":"xx"}; 若不传或变量匹配失败则不予替换,将配置信息原样返回

	urlParams: any;
}