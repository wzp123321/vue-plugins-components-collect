import { FGetSessionStorageData } from '@/utils/token';
import { createStore } from 'vuex';
import { CheckTokenRes } from '@/services/common/common-api';

interface StoreInfo {
  menuList: GlobalModule.MenuInfo[];
  defaultUrl: string;
  homeOption: any;
  tenantVO: CheckTokenRes;
  forbiddenReqFlag: boolean;
  diffTime: string;
}

export default createStore<StoreInfo>({
  state: {
    defaultUrl: '', // 默认地址
    menuList: [], // 菜单列表
    homeOption: {},
    tenantVO: {}, // 租户信息
    forbiddenReqFlag: false, // 是否有无权限的请求
    diffTime: '',
  },
  mutations: {
    ['SET_MENU_LIST'](state, payload) {
      const { menuList, defaultUrl } = payload;
      state.defaultUrl = defaultUrl;
      state.menuList = menuList;
    },
    // 设置单个首页单个组件配置信息
    ['SET_HOME_OPTION'](state, payload) {
      state.homeOption = payload;
    },
    /**
     * 租户信息
     */
    ['SET_TENANTVO'](state, payload) {
      state.tenantVO = payload;
    },
    /**
     * 是否有无权限的请求
     */
    ['SET_FORBIDDENREQ_FLAG'](state, payload) {
      state.forbiddenReqFlag = payload;
    },
    ['SET_DIFF_TIME'](state, payload) {
      state.diffTime = payload;
    },
  },
  actions: {
    /**
     * 设置菜单
     * @param param0
     * @param data
     */
    setMenuList({ commit }, data) {
      commit('SET_MENU_LIST', data);
    },
    /**
     * 设置单个首页单个组件配置信息
     * @param param0
     * @param data
     */
    setHomeOption({ commit }, data) {
      commit('SET_HOME_OPTION', data);
    },
    /**
     * 租户信息
     */
    setTenantVO({ commit }, data) {
      commit('SET_TENANTVO', data);
    },
    /**
     * 是否有无权限的请求
     */
    setForbiddenReqFlag({ commit }, data) {
      commit('SET_FORBIDDENREQ_FLAG', data);
    },
    setDiffTime({ commit }, data) {
      commit('SET_DIFF_TIME', data);
    },
  },
  getters: {
    // 菜单
    menuList(state) {
      return state.menuList;
    },
    // tenantCode
    tenantCode: (state) => {
      return FGetSessionStorageData('energy-corpid') as string;
    },
    // tenantId
    tenantId: (state) => {
      return FGetSessionStorageData('energy-corpid') as string;
    },
    // token
    token: (state) => {
      return FGetSessionStorageData('energy-token') as string;
    },
    // username
    username: (state) => {
      return FGetSessionStorageData('energy-loginName') as string;
    },
    // 默认地址
    defaultUrl: (state) => {
      return state.defaultUrl;
    },
    // 租户信息
    tenantVO: (state) => {
      return state.tenantVO;
    },
    // 是否无权限
    forbiddenReqFlag: (state) => {
      return state.forbiddenReqFlag;
    },
    diffTime: (state) => {
      return state.diffTime;
    },
  },
});
