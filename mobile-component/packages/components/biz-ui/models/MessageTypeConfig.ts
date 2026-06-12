import MessageConfig from './MessageConfig';
import { SendMessageMomentTypeEnum } from './SendMessageMomentTypeEnum';
export default class MessageTypeConfig {
	// 消息提醒时机类型
	type: Nullable<SendMessageMomentTypeEnum>;
	// 消息提醒配置列表
	messageList: Nullable<MessageConfig[]>;
}