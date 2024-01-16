import { defineComponent, computed } from 'vue';
import DifferenceValue from '../ea-dc-difference-value/ea-dc-difference-value.vue';
import { thousandSeparation } from '@/utils/index';

export default defineComponent({
  name: 'KpiAnomdaly',
  components: {
    DifferenceValue,
  },
  props: {
    quotaValue: {
      type: Number,
      default: 0,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: '',
    },
    differenceRatio: {
      type: Number,
      default: 0,
    },
    // 类型
    quotaAbnormalType: {
      type: String,
      default: '1',
    },
    // 时间
    trendAbnormalTime: {
      type: String,
      default: '',
    },
    // 等级
    level: {
      type: Number,
      default: 1,
    },
  },
  setup(props) {
    const quotaValue = computed(() => {
      return props.quotaValue;
    });
    const currentValue = computed(() => {
      return props.currentValue;
    });
    const unit = computed(() => {
      return props.unit;
    });
    const differenceRatio = computed(() => {
      return props.differenceRatio;
    });
    const quotaAbnormalType = computed(() => {
      return props.quotaAbnormalType;
    });
    const trendAbnormalTime = computed(() => {
      return props.trendAbnormalTime;
    });
    const level = computed(() => {
      return props.level;
    });
    return {
      quotaValue,
      currentValue,
      unit,
      differenceRatio,
      quotaAbnormalType,
      trendAbnormalTime,
      level,
      thousandSeparation,
    };
  },
});
