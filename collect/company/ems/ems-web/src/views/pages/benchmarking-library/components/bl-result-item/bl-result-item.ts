import { defineComponent, computed } from 'vue';
import { BENCH_STATUS } from '../../constant';

export default defineComponent({
  name: 'ResultItem',
  props: {
    text: {
      type: String,
      default: '',
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const text = computed(() => {
      return props.text;
    });
    const status = computed(() => {
      return props.status;
    });
    return { text, status, BENCH_STATUS };
  },
});
