import { DSB_IPageForm } from '@/views/pages/department-assessment/da-result-publicity/dsp-search-bar/dsp-search-bar.api';
import { DA_ICheckInfo } from '@/views/pages/department-assessment/department-assessment.api';

interface IDepartmentAssessState {
  configureInfo: DA_ICheckInfo;
  searchForm: DSB_IPageForm
}
/**
 * 科室考核模块
 */
const departmentAssessStore = {
  state: {
    // 科室配置信息
    configureInfo: {
      indexIdList: [],
      energyCodeList: [],
      treeIdList: [],
      allEnergyCodeList: [],
      showFlag: true,
      configFlag: false,
    },
    searchForm:{
      energyCode:'',
      date: undefined,
      indexId: undefined
    }
  },
  getters: {
    configureInfo: (state: IDepartmentAssessState): DA_ICheckInfo => {
      return state.configureInfo as DA_ICheckInfo;
    },
    searchForm: (state: IDepartmentAssessState): DSB_IPageForm => {
      return state.searchForm as DSB_IPageForm;
    },
  },
  mutations: {
    ['SET_CONFIGURE_INFO']: (state: IDepartmentAssessState, payload: DA_ICheckInfo) => {
      state.configureInfo = {
        ...state.configureInfo,
        ...payload
      };
    },
    ['SET_SEARCH_FORM']: (state: IDepartmentAssessState, payload: DSB_IPageForm) => {
      state.searchForm = {
        ...state.searchForm,
        ...payload
      };
    },
  },
  actions: {
    setConfigureInfo: ({ commit }: { commit: (type: string, data: DA_ICheckInfo) => void }, data: DA_ICheckInfo) => {
      commit('SET_CONFIGURE_INFO', data);
    },
    setSearchForm: ({ commit }: { commit: (type: string, data: DSB_IPageForm) => void }, data: DSB_IPageForm) => {
      commit('SET_SEARCH_FORM', data);
    },
  },
};

export default departmentAssessStore;
