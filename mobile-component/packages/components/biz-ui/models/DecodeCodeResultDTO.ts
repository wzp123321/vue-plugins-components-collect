export default class DecodeCodeResultDTO {
	// 资产码
	assetCode: string = '';
	// 资产码名称
	assetName: string = '';
	// 业务对象id。业务系统中主键
	businessEntityId: string = '';
	// 三方编码1
	thirdCode1: Nullable<string>;
	// 三方编码2
	thirdCode2: Nullable<string>;
	// 三方编码3
	thirdCode3: Nullable<string>;
	// 是否需要鉴权
	authEnabled: boolean = false;
	// 跳转地址
	jumpUrl: string = '';
}