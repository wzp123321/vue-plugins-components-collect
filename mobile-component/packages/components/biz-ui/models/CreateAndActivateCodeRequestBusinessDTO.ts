export default class CreateAndActivateCodeRequestBusinessDTO {
	// 业务对象id。业务系统中主键
	businessEntityId: string = '';
	// 三方编码1
	thirdCode1: Nullable<string>;
	// 三方编码2
	thirdCode2: Nullable<string>;
	// 三方编码3
	thirdCode3: Nullable<string>;
}