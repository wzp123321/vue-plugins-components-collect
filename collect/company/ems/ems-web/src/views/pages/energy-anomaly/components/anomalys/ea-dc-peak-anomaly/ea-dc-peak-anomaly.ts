import { defineComponent, computed } from 'vue';
import { thousandSeparation } from '@/utils/index';

export default defineComponent({
  name: 'PeakAnomaly',
  props: {
    peakTimes: {
      type: String,
      default: '',
    },
    value: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const value = computed(() => {
      return props.value;
    });
    const peakTimes = computed(() => {
      return props.peakTimes;
    });
    const unit = computed(() => {
      return props.unit;
    });
    return { value, peakTimes, unit, thousandSeparation };
  },
});
