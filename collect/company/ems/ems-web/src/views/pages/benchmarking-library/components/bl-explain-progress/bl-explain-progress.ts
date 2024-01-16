import { defineComponent, computed } from 'vue';
// constant
import { BENCH_STATUS } from '../../constant';
// utils
import { thousandSeparation } from '@/utils/index';
export default defineComponent({
  name: 'ExplainProgress',
  props: {
    explainInfo: {
      type: Object,
      default: false,
    },
    // 是否为图例
    isLegend: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const explainInfo = computed(() => {
      return props.explainInfo;
    });
    const isLegend = computed(() => {
      return props.isLegend;
    });
    // 标记左定位
    const currentLeft = computed(() => {
      const {
        maxValue,
        averageValue,
        minValue,
        measureValue,
      } = explainInfo.value;
      let precent = 0;
      if (averageValue >= maxValue && measureValue > maxValue) {
        precent = 97;
      } else if (averageValue <= minValue && minValue !== maxValue) {
        precent = 0;
      } else if (
        minValue < averageValue < maxValue &&
        measureValue < maxValue
      ) {
        precent = 100 * (Number(averageValue) / Number(maxValue));
      } else if (
        minValue < averageValue < maxValue &&
        measureValue > maxValue
      ) {
        precent = 97 * (Number(averageValue) / Number(maxValue));
      } else {
        precent = 100;
      }
      return precent;
    });
    // 进度条宽度
    const progressWidth = computed(() => {
      const {
        minValue,
        maxValue,
        averageValue,
        measureValue,
      } = explainInfo.value;
      let width = 100;
      if (!props.isLegend) {
        // 没有最小值 或 没有最大值
        if (
          Object.prototype.toString.call(minValue) === '[object Null]' ||
          Object.prototype.toString.call(maxValue) === '[object Null]' ||
          Object.prototype.toString.call(averageValue) === '[object Null]'
        ) {
          width = 0;
        } else if (
          (measureValue < Number(maxValue) &&
            measureValue > Number(minValue)) ||
          (Number(maxValue) === Number(minValue) &&
            measureValue < Number(maxValue))
        ) {
          width = 100 * (Number(measureValue) / Number(maxValue));
        } else if (
          measureValue <= Number(averageValue) &&
          Number(maxValue) !== Number(minValue)
        ) {
          width = 0;
        } else {
          width = 100;
        }
      } else {
        if (measureValue > Number(maxValue)) {
          width = 97;
        }
      }
      return width;
    });
    // 最低值左定位
    const minLeft = computed(() => {
      const { minValue, measureValue } = explainInfo.value;
      let left = -54;
      if (measureValue < minValue) {
        left = -33;
      }
      return left;
    });
    // 最低值左定位
    const minLineLeft = computed(() => {
      const { minValue, measureValue } = explainInfo.value;
      let lineLeft = 0;
      if (measureValue < minValue) {
        lineLeft = 20;
      }
      return lineLeft;
    });
    // 状态 1-蓝 2-黄  3-红
    const status = computed(() => {
      const { maxValue, averageValue, measureValue } = explainInfo.value;
      let s = BENCH_STATUS.NORMAL;
      if (!props.isLegend) {
        if (measureValue >= maxValue) {
          s = BENCH_STATUS.HEIGHEST;
        } else if (measureValue <= averageValue) {
          s = BENCH_STATUS.NORMAL;
        } else {
          s = BENCH_STATUS.HIGH;
        }
      }
      return s;
    });
    return {
      explainInfo,
      currentLeft,
      status,
      isLegend,
      progressWidth,
      BENCH_STATUS,
      minLeft,
      minLineLeft,
      thousandSeparation,
    };
  },
});
