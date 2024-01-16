import { defineComponent, computed, PropType } from 'vue';
// constant
import { BENCH_STATUS } from '../../constant';

export default defineComponent({
  name: 'ExplainProgress',
  props: {
    explainInfo: {
      type: Object as PropType<
        AirportBenchMarkingAnalysisModule.TargetDetailsVOList
      >,
      default: {}
    },
    // 是否为图例
    isLegend: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const explainInfo = computed(() => {
      return props.explainInfo;
    });
    // 标记左定位
    const currentLeft = computed(() => {
      const { minValue, maxValue, measureValue } = explainInfo.value;
      const precent =
        !measureValue || measureValue < Number(minValue)
          ? 0
          : Object.prototype.toString.call(minValue) === '[object Null]'
          ? 0
          : Object.prototype.toString.call(maxValue) === '[object Null]'
          ? 50
          : (100 * (measureValue - Number(minValue))) /
            (Number(maxValue) - Number(minValue));

      return precent <= 100 ? `${precent}%` : '100%';
    });
    // 进度条宽度
    const progressWidth = computed(() => {
      const { minValue, maxValue, measureValue } = explainInfo.value;
      let width = 100;
      if (!props.isLegend) {
        // 没有最小值 或 没有最大值
        if (
          Object.prototype.toString.call(minValue) === '[object Null]' ||
          Object.prototype.toString.call(maxValue) === '[object Null]'
        ) {
          width = 50;
        } else if (
          measureValue < Number(maxValue) &&
          measureValue > Number(minValue)
        ) {
          width = 100;
        } else {
          width =
            measureValue < Number(minValue)
              ? 100 *
                ((Number(maxValue) - Number(minValue)) /
                  (Number(maxValue) - measureValue))
              : 100 *
                ((Number(maxValue) - Number(minValue)) /
                  (measureValue - Number(minValue)));
        }
      }

      return width;
    });
    // 状态 0-实时值在两者中间  1-空白区域在右边  2-空白区域在左边
    const status = computed(() => {
      const { minValue, maxValue, measureValue } = explainInfo.value;
      let s = BENCH_STATUS.NORMAL;
      if (!props.isLegend) {
        // 没有最小值 或 没有最大值
        if (
          Object.prototype.toString.call(minValue) === '[object Null]' ||
          Object.prototype.toString.call(maxValue) === '[object Null]'
        ) {
          s =
            Number(minValue) > measureValue
              ? BENCH_STATUS.LOW
              : BENCH_STATUS.HIGH;
        } else {
          s =
            Number(minValue) > measureValue
              ? BENCH_STATUS.LOW
              : BENCH_STATUS.HIGH;
        }
      }
      return s;
    });
    return {
      explainInfo,
      currentLeft,
      status,
      progressWidth,
      BENCH_STATUS
    };
  }
});
