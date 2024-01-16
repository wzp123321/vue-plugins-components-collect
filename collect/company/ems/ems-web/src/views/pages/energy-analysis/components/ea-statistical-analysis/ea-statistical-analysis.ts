import { defineComponent, PropType } from 'vue';
import { formatEmptyValue, thousandSeparation } from '@/utils/index';
export default defineComponent({
  name: 'StatisticalAnalysis',
  props: {
    data: {
      type: Object as PropType<AnalysisManageModule.EnergyCompareRes>,
      default: {},
    },
  },
  setup() {
    const resetValue = (value: number, unit: string) => {
      const resetUnit = unit === '%' ? unit : ' ' + unit;
      if (!value && value !== 0) {
        return '--';
      } else {
        return formatEmptyValue(thousandSeparation(Math.abs(value)), resetUnit);
      }
    };
    return {
      resetValue,
    };
  },
});
