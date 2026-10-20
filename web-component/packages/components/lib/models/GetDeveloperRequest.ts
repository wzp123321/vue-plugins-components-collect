export default class GetDeveloperRequest {
	// 接入公钥
	appId: string = '';
	// 乐观锁版本号
	fVersion: number = 0;
	// 来源: 0-平台、子系统、1-第三方
	source: Nullable<number>;
}