import { defineComponent, PropType, computed } from 'vue';
export default defineComponent({
  name: 'CostCompareCard',
  props: {
    dataInfo: {
      type: Object as PropType<CostCompareOverviewModule.QueryCompareEnergyRes>,
      default: {},
    },
    index: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const cardData = computed(() => {
      return props.dataInfo;
    });
    const tagTextArray = ['日', '周', '月', '年'];
    /**
     * 转换同比，环比值
     * @param compareValue 比较值
     */
    const adaptCompareValue = (compareValue: string | number | null) => {
      if (!compareValue && compareValue !== 0) {
        return {
          value: '--',
          absValue: '--',
        };
      }

      if (compareValue === '--') {
        return {
          value: compareValue,
          absValue: compareValue,
        };
      }

      return {
        value: compareValue,
        absValue: String(Math.abs(Number(compareValue))) + '%',
      };
    };
    return {
      cardData,
      tagTextArray,
      adaptCompareValue,
    };
  },
});
