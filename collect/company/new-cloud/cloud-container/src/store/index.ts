/*
 * @Author: wanzp
 * @Date: 2022-05-25 14:04:27
 * @LastEditors: wanzp
 * @LastEditTime: 2023-06-27 09:10:04
 * @Description: Description
 */
import { createStore } from 'vuex';
interface StoreInfo {
  isTokenFailureFlag: boolean;
}

export default createStore<StoreInfo>({
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
