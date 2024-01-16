import { FGetStorageData } from '@/utils/token';
import { createStore } from 'vuex';
import { CheckTokenRes } from '@/services/common/common-api';

import { departmentAssessStore } from './modules/index'

interface StoreInfo {
  tenantVO?: CheckTokenRes; // 租户信息
  theme: string; // 主题变量
  themeOption: GlobalModule.CommonObject; // 主题配置
  menuList: GlobalModule.MenuInfo[]; // 菜单
  defaultUrl: string; // 默认页面
  forbiddenReqFlag: boolean; // 是否有无权限提示
  isCloudEnvironment: boolean; // 是否是云端环境
}

export default createStore<StoreInfo>({
  // 模块
  modules:{
    departmentAssessStore
  },
  state: {
    tenantVO: {},
    theme: 'light',
    themeOption: {},
    menuList: [],
    defaultUrl: '/web/home',
    forbiddenReqFlag: false,
    isCloudEnvironment: false,
  },
  getters: {
    /**
     * 租户信息
     */
    tenantVO: (state): CheckTokenRes => {
      return state.tenantVO as CheckTokenRes;
    },
    /**
     * 主题
     */
    theme: (state): string => {
      return state.theme;
    },
    /**
     * 主题配置
     * @param state
     * @returns
     */
    themeOption: (state) => {
      return state.themeOption;
    },
    // 菜单
    menuList: (state) => {
      return state.menuList;
    },
    // 默认页面
    defaultUrl: (state) => {
      return state.defaultUrl;
    },
    // tenantCode
    tenantCode: (state) => {
      return FGetStorageData('energy-corpid') ?? '';
    },
    // tenantId
    tenantId: (state) => {
      return FGetStorageData('energy-corpid') ?? '';
    },
    // username-用于接口入参
    username: (state) => {
      return FGetStorageData('energy-loginName') ?? '';
    },
    // loginName-用户名-用于展示
    loginName: (state) => {
      return FGetStorageData('energy-loginName') ?? '';
    },
    // token
    token: (state) => {
      return FGetStorageData('energy-token');
    },
    forbiddenReqFlag: (state) => {
      return state.forbiddenReqFlag;
    },
    isCloudEnvironment: (state) => {
      return state.isCloudEnvironment;
    },
  },
  mutations: {
    /**
     * 租户信息
     */
    ['SET_TENANTVO'](state, payload) {
      state.tenantVO = payload;
    },
    /**
     * 头部查询参数
     */
    ['SET_THEME'](state, payload) {
      state.theme = payload;
    },
    /**
     * 主题配置
     * @param state
     * @param payload
     */
    ['SET_THEME_OPTION'](state, payload) {
      state.themeOption = payload;
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
    /**
     * 是否有无权限的请求
     */
    ['SET_FORBIDDENREQ_FLAG'](state, payload) {
      state.forbiddenReqFlag = payload;
    },
    ['SET_IS_CLOUD_ENVIRONMENT'](state, payload) {
      state.isCloudEnvironment = payload;
    },
  },
  actions: {
    /**
     * 租户信息
     */
    setTenantVO({ commit }, data) {
      commit('SET_TENANTVO', data);
    },
    /**
     * 主题
     */
    setTheme({ commit }, data) {
      commit('SET_THEME', data);
    },
    /**
     * 主题配置
     * @param param0
     * @param data
     */
    setThemeOption({ commit }, data) {
      commit('SET_THEME_OPTION', data);
    },
    /**
     * 当前项目类型 & 菜单
     * @param param0
     * @param data
     */
    setMenuList({ commit }, data) {
      commit('set_MENU_LIST', data);
    },
    /**
     * 用户信息
     * @param param0
     * @param data
     */
    setUserInfo({ commit }, data) {
      commit('SET_USER_INFO', data);
    },
    /**
     * 是否有无权限的请求
     */
    setForbiddenReqFlag({ commit }, data) {
      commit('SET_FORBIDDENREQ_FLAG', data);
    },
    setIsCloudEnvironment({ commit }, data) {
      commit('SET_IS_CLOUD_ENVIRONMENT', data);
    },
  },
});
