import { defineComponent, PropType, computed } from 'vue';
// components
import ExplainProgress from '../aba-explain-progress/aba-explain-progress.vue';

export default defineComponent({
  name: 'ExplainItem',
  props: {
    explainInfo: {
      type: Object as PropType<
        AirportBenchMarkingAnalysisModule.TargetDetailsVOList
      >,
      default: {},
    },
    hasLegend: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ExplainProgress,
  },
  setup(props) {
    const explainInfo = computed(() => {
      return props.explainInfo;
    });
    const hasLegend = computed(() => {
      return props.hasLegend;
    });
    return { explainInfo, hasLegend };
  },
});
