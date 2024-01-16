import { Component, defineAsyncComponent, defineComponent, reactive } from 'vue';
import { TH_ERiskRank } from './terminal-home.api';

import './services/token';
import InofService from './services/th-info.service';

// 动态组件模块路径配置
const PATH = {
  'th-module-lt': './th-project-detail/th-project-detail.vue',
  'th-module-lm': './th-manage-execution/th-manage-execution.vue',
  'th-module-lb': './th-management-analysis/th-management-analysis.vue',
  'th-module-rt': './th-energy-survey/th-energy-survey.vue',
  'th-module-rm': './th-alarm-track/th-alarm-track.vue',
  'th-module-rb': './th-energy-event/th-energy-event.vue',
};
Object.freeze(PATH);

export default defineComponent({
  name: 'TerminalHomeComponent',
  components: loadModule(),
  setup() {
    //#region 基本信息服务
    const sInfo = reactive(InofService);
    sInfo.query();
    //#endregion

    return { sInfo };
  },
  methods: {
    mapRiskRank: (risk: TH_ERiskRank): string | undefined => {
      switch (risk) {
        case TH_ERiskRank.health:
          return 'health';
        case TH_ERiskRank.warn:
          return 'warn';
        case TH_ERiskRank.danger:
          return 'danger';
        default:
          break;
      }
    },
  },
});

/**
 * 动态加载异步组件模块
 * @returns 异步组件
 */
function loadModule(): Partial<{ [key in keyof typeof PATH]: () => Promise<Component> }> {
  const modules = import.meta.glob('./**/*.vue');
  const components: Partial<{ [key in keyof typeof PATH]: () => Promise<Component> }> = {};

  Object.entries(PATH).forEach(([k, v]) => {
    if (v && Object.keys(modules).includes(v)) {
      components[k] = defineAsyncComponent(modules[v]);
    }
  });

  return components;
}
