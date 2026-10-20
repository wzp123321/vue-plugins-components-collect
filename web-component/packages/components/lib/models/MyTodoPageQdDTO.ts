import PageQd from './PageQd';
export default class MyTodoPageQdDTO extends PageQd {
	// 业务分类编码
	businessCategoryCodeEq: Nullable<string>;
	// 流程实例id
	processInstanceIdEq: Nullable<string>;
	// 流程实例id列表
	processInstanceIdIn: Nullable<string[]>;
}