import { createStore } from 'vuex';
const key = 'iot_router_params';

interface StoreInfo {
  iotImsInfo: string;
  jumpParam: { [key: string]: any };
  username: string;
  appName: string;
}

export default createStore<StoreInfo>({
  state: {
    iotImsInfo: 'iotImsInfo', // 缓存key
    jumpParam: {}, // 跳转过来的传参
    username: '', // 用户名
    appName: '', // 系统名
  },
  getters: {
    /**
     * 获取当前页面传值
     */
    getParams: (state) => (self: any) => {
      let params = {};
      if (self.$route.query) {
        // params = JSON.parse(unescape(self.$route.query))
        params = self.$route.query;
      }
      return params;
    },
    /**
     * 获取cookie
     * @param cookieName cookie名
     */
    getCookie: (state) => (cookieName: string) => {
      const name = cookieName + '=';
      const arr = document.cookie.split(';');
      for (const item of arr) {
        const c = item.trim();
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
        }
      }
      return '';
    },
    /**
     * 路由携带参数 需要对参数进行解密
     * @param state
     * @returns
     */
    jumpParam: (state) => {
      state.jumpParam = JSON.parse(
        window.sessionStorage.getItem(`${key}-${state.jumpParam.tenantCode}`) ||
          '{}'
      );
      return state.jumpParam;
    },
    // 用户信息
    // userInfo: (state) => {
    //   return state.userInfo
    // },
    username: (state) => {
      return state.jumpParam && state.jumpParam.username
        ? state.jumpParam.username
        : '';
    },
    // tenantCode
    tenantCode: (state) => {
      return state.jumpParam && state.jumpParam.tenantCode
        ? state.jumpParam.tenantCode
        : '';
    },
    appName: (state) => {
      return state.jumpParam && state.jumpParam.appName
        ? state.jumpParam.appName
        : '';
    },
  },
  mutations: {
    /**
     * @param state
     * @param payload
     */
    ['SET_JUMP_PARAMS'](state, payload) {
      window.sessionStorage.setItem(
        `${key}-${payload.tenantCode}`,
        JSON.stringify(payload)
      );
      state.jumpParam = payload;
    },
    // 设置用户信息
    // ['SET_USER_INFO'](state, payload) {
    //   state.userInfo = payload
    // },
  },
  actions: {
    /**
     * 存储页面携带参数
     */
    setJumpParams({ commit }, data) {
      commit('SET_JUMP_PARAMS', data);
    },
    /**
     * 设置字典
     * @param param0
     * @param data
     */
    setDictionaryMap({ commit }, data) {
      commit('SET_DICTIONARY_MAP', data);
    },
    /**
     * 设置用户信息
     * @param param0
     * @param data
     */
    setUserInfo({ commit }, data) {
      commit('SET_USER_INFO', data);
    },
  },
});
