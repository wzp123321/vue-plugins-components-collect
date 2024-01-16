/*
 * @Author: wanzp
 * @Date: 2022-11-10 15:24:16
 * @LastEditors: wanzp
 * @LastEditTime: 2023-06-26 15:54:28
 * @Description: Description
 */
import { createStore } from 'vuex';
import { formulaEditor } from './modules/formula-editor';

interface StoreState {
  dialogData: any;
  isTokenFailureFlag: boolean; // token是否已失效
}
export default createStore<StoreState>({
  state: {
    dialogData: {},
    isTokenFailureFlag: false,
  },
  modules: {
    formulaEditor,
  },
  mutations: {
    /**
     * 设置公共弹框传参
     * @param state
     * @param payload
     */
    ['SET_DIALOG_Data'](state, payload) {
      state.dialogData = payload;
    },
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
    dialogData: (state) => {
      return state.dialogData;
    },
    isTokenFailureFlag: (state) => {
      return state.isTokenFailureFlag;
    },
  },
});
