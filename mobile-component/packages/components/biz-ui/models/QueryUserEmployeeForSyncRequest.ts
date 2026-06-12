export default class QueryUserEmployeeForSyncRequest {
	/**
	 * 组织ID equals
	 * 一个用户可以对应多个组织的员工，员工只属于一个组织，所以需要传入组织ID来确定员工，如果不传则默认取管理方组织的员工
	 */
	orgIdEq: Nullable<string>;
	// 用户登录名 in
	loginNameIn: Nullable<string[]>;
}