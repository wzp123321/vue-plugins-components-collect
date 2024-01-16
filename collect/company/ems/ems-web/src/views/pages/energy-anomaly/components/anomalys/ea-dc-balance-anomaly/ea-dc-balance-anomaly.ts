import { defineComponent } from 'vue';
import { thousandSeparation } from '@/utils/index';
// components
import DifferenceValue from '../ea-dc-difference-value/ea-dc-difference-value.vue';

export default defineComponent({
  name: 'BelanceAnomdaly',
  components: {
    DifferenceValue,
  },
  props: {
    totalValue: {
      type: Number,
      default: 0,
    },
    branchValue: {
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
    level: {
      type: Number,
      default: 1,
    },
  },
  setup(props) {
    const { totalValue, branchValue, unit, differenceRatio, level } = props;
    return {
      totalValue,
      branchValue,
      unit,
      differenceRatio,
      level,
      thousandSeparation,
    };
  },
});
