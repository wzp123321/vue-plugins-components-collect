import type { Common_ISystemVO } from '@/api/model';
import { createStore } from 'vuex';
interface IStore {
  systemTime: string;
  systemInfo: Common_ISystemVO;
}

const store = createStore<IStore>({
  state: {
    systemTime: '',
    systemInfo: {
      windowWidth: 375,
      windowHeight: 750,
      screenWidth: 375,
      screenHeight: 750,
      platform: 'ios',
    },
  },
  mutations: {
    ['SET_SYSTEM_TIME'](state, payload) {
      state.systemTime = payload;
    },
    ['SET_SYSTEM_INFO'](state, payload) {
      state.systemInfo.windowWidth = payload.windowWidth;
      state.systemInfo.windowHeight = payload.windowHeight;
      state.systemInfo.screenWidth = payload.screenWidth;
      state.systemInfo.screenHeight = payload.screenHeight;
      state.systemInfo.platform = payload.platform;
    },
  },
  actions: {
    setSystemTime({ commit }, data) {
      commit('SET_SYSTEM_TIME', data);
    },
    setSystemInfo({ commit }, data) {
      commit('SET_SYSTEM_INFO', data);
    },
  },
  getters: {
    systemTime: (state) => {
      return state.systemTime;
    },
    systemInfo: (state) => {
      return state.systemInfo;
    },
  },
});

export default store;
