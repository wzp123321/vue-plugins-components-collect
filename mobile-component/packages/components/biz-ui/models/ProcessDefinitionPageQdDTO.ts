import PageQd from './PageQd';
import { ProcessDefinitionStatusEnum } from './ProcessDefinitionStatusEnum';
export default class ProcessDefinitionPageQdDTO extends PageQd {
	// 应用实例id等于
	appInstanceIdEq: Nullable<string>;
	// 业务分类编码等于
	businessCategoryCodeEq: Nullable<string>;
	// 流程定义状态等于
	statusEq: Nullable<ProcessDefinitionStatusEnum>;
	// 流程定义名称类似于（模糊搜索）
	processDefinitionNameLike: Nullable<string>;
}