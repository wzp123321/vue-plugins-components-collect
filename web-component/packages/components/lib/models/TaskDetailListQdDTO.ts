import FetchQd from './FetchQd';
import { MyTaskTypeEnum } from './MyTaskTypeEnum';
export default class TaskDetailListQdDTO extends FetchQd {
	// 查询任务的类别
	typeEq: Nullable<MyTaskTypeEnum>;
	// 员工id（无Authorization时必填）
	employeeIdEq: Nullable<string>;
	// 流程实例id
	processInstanceIdEq: Nullable<string>;
}