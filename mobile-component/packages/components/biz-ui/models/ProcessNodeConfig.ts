import ProcessNodeExtensionElementsConfig from './ProcessNodeExtensionElementsConfig';
import { ProcessNodeTypeEnum } from './ProcessNodeTypeEnum';
export default class ProcessNodeConfig {
	// 节点名称
	name: Nullable<string>;
	// bpmnXml中定义的节点id，流程内唯一
	bpmnNodeId: Nullable<string>;
	// 节点类型
	type: Nullable<ProcessNodeTypeEnum>;
	// 节点的各项具体配置信息
	extensionElements: Nullable<ProcessNodeExtensionElementsConfig>;
}