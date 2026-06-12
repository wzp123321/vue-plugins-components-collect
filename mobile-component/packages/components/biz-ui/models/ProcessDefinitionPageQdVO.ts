import PageQd from './PageQd';
export default class ProcessDefinitionPageQdVO extends PageQd {
	// 应用实例id
	appInstanceIdEq: Nullable<string>;
	// 业务分类编码
	businessCategoryCodeEq: Nullable<string>;
	// 流程定义名称关键字（模糊搜索）
	processDefinitionNameLike: Nullable<string>;
}