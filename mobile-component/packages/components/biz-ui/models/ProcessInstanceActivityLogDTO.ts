import ProcessNodeActivityLogDTO from './ProcessNodeActivityLogDTO';
export default class ProcessInstanceActivityLogDTO {
	// 流程各节点执行日志列表
	nodeActivityLogs: Nullable<ProcessNodeActivityLogDTO[]>;
}