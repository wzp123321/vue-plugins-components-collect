import { defineComponent, PropType, computed } from 'vue';
// constant
import { BENCH_STATUS, BENCH_TYPE } from '../../constant';

export default defineComponent({
  props: {
    title: {
      type: String,
      default: '',
    },
    bgColor: {
      type: String,
      default: '',
    },
    // 数据源
    targetDetailsVOList: {
      type: Array as PropType<
        AirportBenchMarkingAnalysisModule.TargetDetailsVOList[]
      >,
      default: 220,
    },
    type: {
      type: String,
      default: '',
    },
  },
  name: 'BenchMarkingDetailItem',
  setup(props) {
    const title = computed(() => {
      return props.title;
    });
    const list = computed(() => {
      return props.targetDetailsVOList;
    });
    const bgColor = computed(() => {
      return props.bgColor;
    });
    const type = computed(() => {
      return props.type;
    });
    return { title, list, bgColor, BENCH_TYPE, type, BENCH_STATUS };
  },
});
