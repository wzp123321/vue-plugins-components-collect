import ProcessNodeExtensionElementConfigVO from './ProcessNodeExtensionElementConfigVO';
export default class ProcessNodeConfigVO {
  // 节点名称
  name: Nullable<string>;
  // bpmnXml中定义的节点id，流程内唯一
  bpmnNodeId: Nullable<string>;
  // 节点类型
  type: Nullable<string>;
  // 节点的各项具体配置信息
  extensionElements: Nullable<ProcessNodeExtensionElementConfigVO[]>;
}
