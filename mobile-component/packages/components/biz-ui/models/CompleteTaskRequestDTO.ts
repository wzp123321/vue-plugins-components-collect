export default class CompleteTaskRequestDTO {
  // 任务实例id
  taskInstanceId: Nullable<string>;
  // 流程动作编码
  processActionCode: Nullable<string>;
  // 请求幂等性标识，requestId不变代表是同一次请求的重试
  requestId: Nullable<string>;
  // 表单控件内容
  formMap: any;
  // 处理任务需要传入的业务字段/流程引擎预留字段参数
  paramMap: any;
  processInstanceId: any;
}
