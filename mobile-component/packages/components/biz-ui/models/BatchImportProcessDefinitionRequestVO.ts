import ProcessDefinitionImportInfo from './ProcessDefinitionImportInfo';
export default class BatchImportProcessDefinitionRequestVO {
	// 用于导入的流程定义信息列表
	processDefinitions: Nullable<ProcessDefinitionImportInfo[]>;
}