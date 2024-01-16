/*
 * @Author: wanzp
 * @Date: 2022-11-10 15:24:16
 * @LastEditors: wanzp
 * @LastEditTime: 2023-07-27 09:16:38
 * @Description: Description
 */
import { createStore } from 'vuex';

interface StoreState {
  isTokenFailureFlag: boolean; // token是否已失效
}
export default createStore<StoreState>({
  state: {
    isTokenFailureFlag: false,
  },
  mutations: {
    ['SET_IS_TOKEN_FAILURE_FLAG'](state, payload) {
      state.isTokenFailureFlag = payload;
    },
  },
  actions: {
    setIsTokenFailureFlag({ commit }, data) {
      commit('SET_IS_TOKEN_FAILURE_FLAG', data);
    },
  },
  getters: {
    isTokenFailureFlag: (state) => {
      return state.isTokenFailureFlag;
    },
  },
});
