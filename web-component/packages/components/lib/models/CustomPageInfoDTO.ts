import JumpInfoDTO from './JumpInfoDTO';
export default class CustomPageInfoDTO {
	// 业务界面id,主键; 由[产品模块id.子模块编码.业务界面编码]拼接而成
	id: Nullable<string>;
	// 业务界面名称
	name: Nullable<string>;
	// 描述
	description: Nullable<string>;
	// 跳转信息列表
	jumpInfos: Nullable<JumpInfoDTO[]>;
}