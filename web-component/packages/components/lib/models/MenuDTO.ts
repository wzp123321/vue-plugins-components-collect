export default class MenuDTO {
	/**
	 * 路由名
	 * 约束：产品模块内唯一: MaintainReportTemplate
	 */
	routerName: Nullable<string>;
	// 菜单名称
	title: Nullable<string>;
	// 子菜单
	children: Nullable<MenuDTO[]>;
	/**
	 * 鉴权点
	 * 该菜单的鉴权点,多个鉴权点之间是或关系,如: [MaintainReportTemplate.edit, MaintainReportTemplate.view]
	 */
	permissionIds: Nullable<string[]>;
	// 路由路径
	routerPath: Nullable<string>;
	// 图标
	icon: Nullable<string>;
}