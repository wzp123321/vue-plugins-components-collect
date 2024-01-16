import { PM_EGrainSharingMode } from '@/pages/project-manage/constant/enum';
import { Common_IValueLabel } from '@/service/api';

interface IFormulaEditorStore {
  // 正在拖拽
  draggingFlag: boolean;
  // 公式未保存
  unSaveFlag: boolean;
  // 收益分享模式
  grainSharingMode: PM_EGrainSharingMode;
  // 项目托管期
  trusteeshipDateList: Date[];
  // 托管期列表
  hostingPeriodList: Common_IValueLabel<number>[];
}

export const formulaEditor = {
  state: {
    draggingFlag: false,
    unSaveFlag: false,
    grainSharingMode: PM_EGrainSharingMode.保证伙伴收益型,
  },
  mutations: {
    ['SET_DRAGGING_FLAG'](state: IFormulaEditorStore, payload: boolean) {
      state.draggingFlag = payload;
    },
    ['SET_UN_SAVE_FLAG'](state: IFormulaEditorStore, payload: boolean) {
      state.unSaveFlag = payload;
    },
    ['SET_GRAIN_SHARING_MODE'](state: IFormulaEditorStore, payload: PM_EGrainSharingMode) {
      state.grainSharingMode = payload;
    },
    ['SET_TRUST_SHEEP_DATE_LIST'](state: IFormulaEditorStore, payload: Date[]) {
      state.trusteeshipDateList = payload;
    },
    ['SET_HOSTING_PERIOD_LIST'](state: IFormulaEditorStore, payload: Common_IValueLabel<number>[]) {
      state.hostingPeriodList = payload;
    },
  },
  actions: {
    setDraggingFlag({ commit }: { commit: (type: string, params: boolean) => void }, data: boolean) {
      commit('SET_DRAGGING_FLAG', data);
    },
    setUnSaveFlag({ commit }: { commit: (type: string, params: boolean) => void }, data: boolean) {
      commit('SET_UN_SAVE_FLAG', data);
    },
    setGrainSharingMode({ commit }: { commit: (type: string, params: boolean) => void }, data: boolean) {
      commit('SET_GRAIN_SHARING_MODE', data);
    },
    setTrustSheepDateList({ commit }: { commit: (type: string, params: Date[]) => void }, data: Date[]) {
      commit('SET_TRUST_SHEEP_DATE_LIST', data);
    },
    setHostingPeriodList(
      { commit }: { commit: (type: string, params: Common_IValueLabel<number>[]) => void },
      data: Common_IValueLabel<number>[],
    ) {
      commit('SET_HOSTING_PERIOD_LIST', data);
    },
  },
  getters: {
    // 正在拖拽
    draggingFlag: (state: IFormulaEditorStore) => {
      return state.draggingFlag;
    },
    // 公式未保存
    unSaveFlag: (state: IFormulaEditorStore) => {
      return state.unSaveFlag;
    },
    // 收益分享模式
    grainSharingMode: (state: IFormulaEditorStore) => {
      return state.grainSharingMode;
    },
    // 项目托管期
    trusteeshipDateList: (state: IFormulaEditorStore) => {
      return state.trusteeshipDateList;
    },
    hostingPeriodList: (state: IFormulaEditorStore) => {
      return state.hostingPeriodList;
    },
  },
};
