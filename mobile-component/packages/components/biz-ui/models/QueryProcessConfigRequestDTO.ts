import FetchQd from './FetchQd';
export default class QueryProcessConfigRequestDTO extends FetchQd {
	// 流程定义id等于
	processDefinitionIdEq: Nullable<string>;
	// 流程节点id在其中
	nodeIdIn: Nullable<string[]>;
	// 流程实例id等于
	processInstanceIdEq: Nullable<string>;
}