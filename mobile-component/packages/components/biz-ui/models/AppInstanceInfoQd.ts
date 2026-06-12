export default class AppInstanceInfoQd {
	// 应用实例id, 为空则返回全部
	appInstanceIdIn: Nullable<string[]>;
	// 状态: false-下线 true-上线, 为空则返回全部
	statusEq: Nullable<boolean>;
	// 产品模块id, 为空则返回全部
	productIdEq: Nullable<string>;
}