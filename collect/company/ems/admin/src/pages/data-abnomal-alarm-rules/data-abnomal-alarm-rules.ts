import { defineComponent, ref, computed, nextTick } from 'vue';

// 改造版
import MinAbnormalValueConfigure from './components/daar-min-abnormal-value-configure/daar-min-abnormal-value-configure.vue';
import AnalyseThresholdValueConfigure from './components/daar-analyse-thresholdvalue-configure/daar-analyse-thresholdvalue-configure.vue';
import CalculateNodeLevelConfigure from './components/daar-calculate-nodelevel-configure/daar-calculate-nodelevel-configure.vue';
import DataSignConfigure from './components/daar-data-sign/daar-data-sign.vue';
import YesterdayAbnormalThresholdConfigure from './components/daar-yesterday-abnormal-threshold-configure/daar-yesterday-abnormal-threshold-configure.vue';
import AbnormalThresholdConfigure from './components/daar-abnormal-threshold-configure/daar-abnormal-threshold-configure.vue';

import { EDaarAbnormalTab, EDaarAbnormalType, EDaarPageModule } from './data-abnomal-alarm-rules.api';
import { Common_ICodeName } from '@/services/common/common-api';

export default defineComponent({
  name: 'dataAbnomalAlarmRules',
  components: {
    'daar-min-abnormal-value-configure': MinAbnormalValueConfigure,
    'daar-analyse-thresholdvalue-configure': AnalyseThresholdValueConfigure,
    'daar-datasign-configure': DataSignConfigure,
    'daar-calculate-nodelevel-configure': CalculateNodeLevelConfigure,
    'daar-yesterday-thresholdvalue-configure': YesterdayAbnormalThresholdConfigure,
    'daar-abnormal-thresholdvalue-configure': AbnormalThresholdConfigure,
  },
  setup() {
    const realtimeAbnormal = ref();
    const boundaryAbnormal = ref();
    const pageTabOptions = computed(() => {
      return Object.entries(EDaarPageModule).map(([k, v]) => {
        return {
          label: k,
          value: v,
        };
      });
    });
    const activePageTab = ref<string>(EDaarPageModule.能耗分析);
    function handleLoaded(list: Common_ICodeName[], type: EDaarAbnormalType) {
      nextTick(() => {
        switch (type) {
          case EDaarAbnormalType.用能异常:
            realtimeAbnormal.value.load(list);
            break;
          case EDaarAbnormalType.边界异常:
            boundaryAbnormal.value.load(list);
            break;
        }
      });
    }

    return {
      EDaarAbnormalTab,
      EDaarAbnormalType,
      realtimeAbnormal,
      boundaryAbnormal,
      pageTabOptions,
      activePageTab,
      EDaarPageModule,

      handleLoaded,
    };
  },
});
