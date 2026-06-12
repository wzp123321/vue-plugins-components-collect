import AdvancedConfigVO from './AdvancedConfigVO';
import BranchConfigVO from './BranchConfigVO';
import ButtonsConfigVO from './ButtonsConfigVO';
import FormConfigVO from './FormConfigVO';
import GatewayConfigVO from './GatewayConfigVO';
import GrabOrderConfigVO from './GrabOrderConfigVO';
import OperatorConfigVO from './OperatorConfigVO';
export default class ProcessNodeExtensionElementConfigVO {
  // 任务节点处理类型：manualReview-人工审核、autoAgree-自动通过、autoRefuse-自动拒绝、grabOrder-抢单
  submitType: Nullable<string>;
  // 发起人或开始节点的表单配置
  formConfig: Nullable<FormConfigVO>;
  // 执行人表单配置
  operatorFormConfig: Nullable<FormConfigVO>;
  // 任务节点处理人配置
  operatorConfig: Nullable<OperatorConfigVO>;
  // 任务节点抢单配置
  grabOrderConfig: Nullable<GrabOrderConfigVO>;
  // 任务节点操作按钮配置
  buttonsConfig: Nullable<ButtonsConfigVO>;
  // 任务节点高级配置
  advancedConfig: Nullable<AdvancedConfigVO>;
  // 分支节点（网关）配置
  gatewayConfig: Nullable<GatewayConfigVO>;
  // 分支（连线）配置
  branchConfig: Nullable<BranchConfigVO>;
}
