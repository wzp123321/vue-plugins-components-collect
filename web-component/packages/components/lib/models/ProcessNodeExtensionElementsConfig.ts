import AdvancedConfig from './AdvancedConfig';
import BranchConfig from './BranchConfig';
import ButtonsConfig from './ButtonsConfig';
import FormConfig from './FormConfig';
import GatewayConfig from './GatewayConfig';
import GrabOrderConfig from './GrabOrderConfig';
import OperatorConfig from './OperatorConfig';
import { TaskHandleTypeEnum } from './TaskHandleTypeEnum';
export default class ProcessNodeExtensionElementsConfig {
	// 任务节点处理类型
	submitType: Nullable<TaskHandleTypeEnum>;
	// 是否由当前节点执行人去指定下一个节点的操作人
	appointNextOperator: Nullable<boolean>;
	// 发起人或开始节点的表单配置
	formConfig: Nullable<FormConfig>;
	// 执行人表单配置
	operatorFormConfig: Nullable<FormConfig>;
	// 任务节点处理人配置
	operatorConfig: Nullable<OperatorConfig>;
	// 任务节点抢单配置
	grabOrderConfig: Nullable<GrabOrderConfig>;
	// 任务节点操作按钮配置
	buttonsConfig: Nullable<ButtonsConfig>;
	// 任务节点高级配置
	advancedConfig: Nullable<AdvancedConfig>;
	// 分支节点（网关）配置
	gatewayConfig: Nullable<GatewayConfig>;
	// 分支（连线）配置
	branchConfig: Nullable<BranchConfig>;
}