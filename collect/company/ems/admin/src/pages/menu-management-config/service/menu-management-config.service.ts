import { postRequest } from '../../../services/request';

const MenuManagementConfigService = {
  /**
   * 查询菜单树
   */
  async getMenuToSelect(params: MenuManagementConfig.MenuParams) {
    const res = await postRequest('/menu/queryMenuToSelect', params);
    return res;
  },
  /**
   * 菜单树关闭
   */
  async updateVisibility(params: MenuManagementConfig.UpdateVisibilityParams) {
    const res = await postRequest('/menu/updateVisibility', params);
    return res;
  },
  /**
   * 更新别名
   */
  async updateAlias(params: MenuManagementConfig.UpdateAliasParams) {
    const res = await postRequest('/menu/updateAlias', params);
    return res;
  },
};

export default MenuManagementConfigService;
