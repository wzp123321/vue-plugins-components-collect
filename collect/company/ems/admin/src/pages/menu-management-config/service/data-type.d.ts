declare namespace MenuManagementConfig {
  /** 更新菜单是否可见 */
  interface UpdateVisibilityParams {
    menuId: number;
    showFlag: boolean;
  }
  /** 菜单查询条件 */
  interface MenuParams {
    likeName: string;
  }
  // 更新别名参数
  interface UpdateAliasParams {
    menuId: number;
    alias: string | null;
  }
}
