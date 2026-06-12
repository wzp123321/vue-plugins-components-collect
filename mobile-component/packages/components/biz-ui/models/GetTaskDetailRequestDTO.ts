import FetchQd from './FetchQd';
export default class GetTaskDetailRequestDTO extends FetchQd {
	// 任务实例id
	taskInstanceIdEq: Nullable<string>;
}