import MemberOptionsVO from './MemberOptionsVO';
export default class OperatorConfigVO {
  // 执行人配置
  operatorOptions: Nullable<MemberOptionsVO>;
  // 抄送人配置
  ccOptions: Nullable<MemberOptionsVO>;
  // 多人审批方式：countersign-会签、orSign-或签
  approveType: Nullable<string>;
  // 执行人为空时的处理方式：autoAgree-自动通过、appointMember-指定人员审批
  nullOperatorType: Nullable<string>;
  // 执行人为空选择指定人员审批时，指定的员工id列表
  nullOperatorList: Nullable<string[]>;
  // 执行人与发起人相同时的处理方式：starter-发起人对自己审批、autoAgree-自动通过、deptManager-转交给部分负责人审批
  sameOperatorType: Nullable<string>;
}
