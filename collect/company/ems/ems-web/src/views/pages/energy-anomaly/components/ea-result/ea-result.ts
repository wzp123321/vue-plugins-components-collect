import { defineComponent } from 'vue';
// enum
import { ANOMALY_RESULT_TYPE } from '@/config/enum';

export default defineComponent({
  name: 'AnomalyResult',
  props: {
    title: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    dataSource: {
      type: Array,
      default: [],
    },
  },
  setup(props) {
    const { title, type, dataSource } = props;
    return { title, type, dataSource, ANOMALY_RESULT_TYPE };
  },
});
