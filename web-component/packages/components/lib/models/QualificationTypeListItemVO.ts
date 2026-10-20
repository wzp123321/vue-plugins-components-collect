import ICN from './ICN';
export default class QualificationTypeListItemVO extends ICN {
  // 关联岗位名称
  jobNames: Nullable<string[]>;
  // 到期提醒人类型名称
  recipientTypeNames: Nullable<string[]>;
}
