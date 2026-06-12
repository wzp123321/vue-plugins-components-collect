import ProcessExtraConfig from './ProcessExtraConfig';
import ProcessNodeConfig from './ProcessNodeConfig';
export default class ProcessDefinitionDesignInfo {
	// 流程定义id
	processDefinitionId: Nullable<string>;
	// 流程定义名称
	processDefinitionName: Nullable<string>;
	// 流程定义描述
	processDefinitionDesc: Nullable<string>;
	// 关联表单定义id列表
	formDefinitionIds: Nullable<string[]>;
	// 符合bpmn规范的xml格式流程定义
	bpmnXml: Nullable<string>;
	// 流程图绘制json
	diagramDrawingJson: Nullable<string>;
	// 流程各节点配置
	nodeConfigs: Nullable<ProcessNodeConfig[]>;
	// 更多设置
	extraConfig: Nullable<ProcessExtraConfig>;
}