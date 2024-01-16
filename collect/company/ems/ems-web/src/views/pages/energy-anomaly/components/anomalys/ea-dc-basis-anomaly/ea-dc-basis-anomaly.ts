import { defineComponent } from 'vue';
import { thousandSeparation } from '@/utils/index';

import { ANOMALY_LAVEL } from '@/config/enum';

export default defineComponent({
  name: 'RatioBasisAnomaly',
  props: {
    currentValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: '',
    },
    isIncreaseOrReduce: {
      type: Boolean,
      default: true,
    },
    differenceRatio: {
      type: Number,
      default: 0,
    },
    abnormalLevel: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const {
      currentValue,
      unit,
      isIncreaseOrReduce,
      differenceRatio,
      abnormalLevel,
    } = props;
    return {
      currentValue,
      unit,
      isIncreaseOrReduce,
      differenceRatio,
      abnormalLevel,
      ANOMALY_LAVEL,
      thousandSeparation,
    };
  },
});
