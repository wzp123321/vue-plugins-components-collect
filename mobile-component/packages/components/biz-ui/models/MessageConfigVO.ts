import MemberOptionsVO from './MemberOptionsVO';
export default class MessageConfigVO {
  // 新增时生成的唯一id：message_uuid
  id: Nullable<string>;
  // 推送目标人员的配置
  personOptions: Nullable<MemberOptionsVO>;
  // 推送内容
  pushContent: Nullable<string>;
}
