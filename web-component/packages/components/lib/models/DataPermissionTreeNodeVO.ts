export default class DataPermissionTreeNodeVO {
	/**
	 * 数据权限ID
	 * 标识值
	 */
	id: Nullable<string>;
	/**
	 * 数据权限名称
	 * 标签
	 */
	name: Nullable<string>;
	/**
	 * 是否有子节点
	 * 1有，0无
	 */
	hasChildren: Nullable<boolean>;
	// 子节点
	children: Nullable<DataPermissionTreeNodeVO[]>;
}