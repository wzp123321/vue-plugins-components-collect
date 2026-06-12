import MessageConfig from './MessageConfig';
import RejectInfo from './RejectInfo';
import { ProcessActionCodeEnum } from './ProcessActionCodeEnum';
export default class ButtonConfig {
	// 新增时生成的唯一id：button_uuid
	id: Nullable<string>;
	// 操作类型
	type: Nullable<ProcessActionCodeEnum>;
	// 操作按钮名称
	label: Nullable<string>;
	// 操作按钮样式
	style: Nullable<string>;
	// 业务动作编码
	businessActionCode: Nullable<string>;
	// 界面动作编码
	uiActionCode: Nullable<string>;
	// 是否开启消息提醒：1-开启、0-关闭
	isMessage: Nullable<number>;
	// 消息提醒的配置
	messageList: Nullable<MessageConfig[]>;
	// 驳回按钮的配置
	rejectConfig: Nullable<RejectInfo>;
}