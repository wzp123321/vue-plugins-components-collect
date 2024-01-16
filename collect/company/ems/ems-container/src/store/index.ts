import { createStore } from 'vuex';
import { CheckTokenRes, MenuInfo } from '@/services/common.type';
interface StoreInfo {
  tenantVO?: CheckTokenRes;
  forbiddenReqFlag: boolean;
  menuList: MenuInfo[];
  defaultUrl: string;
}

export default createStore<StoreInfo>({
  state: {
    tenantVO: {}, // 租户信息
    forbiddenReqFlag: false, // 是否有无权限提示
    menuList: [],
    defaultUrl: '',
  },
  mutations: {
    /**
     * 是否有无权限的请求
     */
    ['SET_FORBIDDENREQ_FLAG'](state, payload) {
      state.forbiddenReqFlag = payload;
    },

    /**
     * 租户信息
     */
    ['SET_TENANTVO'](state, payload) {
      state.tenantVO = payload;
    },

    /**
     * 项目类型 & 菜单
     * @param state
     * @param payload
     */
    ['set_MENU_LIST'](state, payload) {
      const { menuList, defaultUrl } = payload;
      state.menuList = menuList;
      state.defaultUrl = defaultUrl;
    },
  },
  actions: {
    /**
     * 是否有无权限的请求
     */
    setForbiddenReqFlag({ commit }, data) {
      commit('SET_FORBIDDENREQ_FLAG', data);
    },

    /**
     * 租户信息
     */
    setTenantVO({ commit }, data) {
      commit('SET_TENANTVO', data);
    },

    /**
     * 当前项目类型 & 菜单
     * @param param0
     * @param data
     */
    setMenuList({ commit }, data) {
      commit('set_MENU_LIST', data);
    },
  },
  getters: {
    forbiddenReqFlag: (state) => {
      return state.forbiddenReqFlag;
    },

    /**
     * 租户信息
     */
    tenantVO: (state): CheckTokenRes => {
      return state.tenantVO as CheckTokenRes;
    },

    // 菜单
    menuList: (state) => {
      return state.menuList;
    },
  },
});
