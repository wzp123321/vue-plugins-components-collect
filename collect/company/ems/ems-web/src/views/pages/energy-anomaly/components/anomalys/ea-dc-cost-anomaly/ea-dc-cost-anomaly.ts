import { defineComponent, computed } from 'vue';
import { thousandSeparation } from '@/utils/index';

export default defineComponent({
  name: 'CostAnomaly',
  props: {
    currentValue: {
      type: Number,
      default: 0,
    },
    differenceRatio: {
      type: Number,
      default: 0,
    },
    targetValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const currentValue = computed(() => {
      return props.currentValue;
    });
    const differenceRatio = computed(() => {
      return props.differenceRatio;
    });
    const targetValue = computed(() => {
      return props.targetValue;
    });
    const unit = computed(() => {
      return props.unit;
    });
    return {
      currentValue,
      differenceRatio,
      targetValue,
      unit,
      thousandSeparation,
    };
  },
});
