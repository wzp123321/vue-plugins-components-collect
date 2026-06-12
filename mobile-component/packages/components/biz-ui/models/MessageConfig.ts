import MemberOptions from './MemberOptions';
export default class MessageConfig {
	// 新增时生成的唯一id：message_uuid
	id: Nullable<string>;
	// 推送目标人员的配置
	personOptions: Nullable<MemberOptions>;
	// 推送内容
	pushContent: Nullable<string>;
}