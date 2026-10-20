export default class OpenUserDtoRequest {
	// 用户id列表
	userIds: Nullable<string[]>;
	// 终端类型
	terminalType: Nullable<string>;
	// 终端id
	terminalId: Nullable<string>;
}