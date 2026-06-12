import ProcessNodeConfig from './ProcessNodeConfig';
import ButtonConfigVO from './ButtonConfigVO';
import FormConfigVO from './FormConfigVO';
export default class ProcessDefinitionDesignInfoVO {
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
  extraConfig: Nullable<{
    launchConfig: {
      canCancel: boolean;
      cancelButton: ButtonConfigVO;
      formConfig: FormConfigVO;
    };
  }>;
}
