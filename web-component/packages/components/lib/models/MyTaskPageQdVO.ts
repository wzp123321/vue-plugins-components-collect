import MutablePair from './MutablePair';
import PageQd from './PageQd';
import { MyTaskTypeEnum } from './MyTaskTypeEnum';
export default class MyTaskPageQdVO extends PageQd {
	// 类别
	typeEq: Nullable<MyTaskTypeEnum>;
	// 搜索关键词，关键词包括任务标题和任务描述（模糊搜索）
	keywordLike: Nullable<string>;
	// 创建时间时间戳范围
	createTimeBetween: Nullable<MutablePair<number, number>>;
	// 应用实例id
	appInstanceIdEq: Nullable<string>;
	// 业务分类编码
	businessCategoryCodeEq: Nullable<string>;
}