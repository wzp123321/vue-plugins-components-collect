import CodeName from './CodeName';
import FormDefinitionSimpleVO from './FormDefinitionSimpleVO';
import IdName from './IdName';
import ProcessExtraConfig from './ProcessExtraConfig';
import ProcessNodeConfig from './ProcessNodeConfig';
export default class ProcessDefinitionImportInfoVO {
  // 流程定义key
  processDefinitionKey: Nullable<string>;
  // 流程定义名称
  processDefinitionName: Nullable<string>;
  // 流程定义描述
  processDefinitionDesc: Nullable<string>;
  // 业务应用
  appInstance: Nullable<IdName>;
  // 业务分类
  businessCategory: Nullable<CodeName>;
  // 关联表单列表（关联表单数≤10）
  formDefinitions: Nullable<FormDefinitionSimpleVO[]>;
  // 符合bpmn规范的xml格式流程定义
  bpmnXml: Nullable<string>;
  // 流程图绘制json
  diagramDrawingJson: Nullable<string>;
  // 流程各节点配置
  nodeConfigs: Nullable<ProcessNodeConfig[]>;
  // 更多设置
  extraConfig: Nullable<ProcessExtraConfig>;
}
