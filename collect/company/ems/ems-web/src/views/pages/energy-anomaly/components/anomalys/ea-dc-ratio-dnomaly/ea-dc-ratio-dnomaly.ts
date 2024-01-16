import { defineComponent, computed } from 'vue';
import { ANOMALY_LAVEL } from '@/config/enum';
import { thousandSeparation } from '@/utils/index';

export default defineComponent({
  name: 'RatioBasisAnomaly',
  props: {
    // 预测值
    predictValue: {
      type: Number,
      default: 0,
    },
    // 当前值
    actualValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: '',
    },
    abnormalLevel: {
      type: Number,
      default: 1,
    },
    isIncreaseOrReduce: {
      type: Boolean,
      default: true,
    },
    // 偏差率
    deviationRate: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const predictValue = computed(() => {
      return props.predictValue;
    });
    const actualValue = computed(() => {
      return props.actualValue;
    });
    const unit = computed(() => {
      return props.unit;
    });
    const isIncreaseOrReduce = computed(() => {
      return props.isIncreaseOrReduce;
    });
    const deviationRate = computed(() => {
      return props.deviationRate;
    });
    const abnormalLevel = computed(() => {
      return props.abnormalLevel;
    });

    return {
      predictValue,
      actualValue,
      unit,
      isIncreaseOrReduce,
      deviationRate,
      abnormalLevel,
      ANOMALY_LAVEL,
      thousandSeparation,
    };
  },
});
