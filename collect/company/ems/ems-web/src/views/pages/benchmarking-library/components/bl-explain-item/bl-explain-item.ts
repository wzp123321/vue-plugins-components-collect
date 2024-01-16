import { defineComponent, PropType, computed, watch, ref } from 'vue';
// components
import ExplainProgress from '../bl-explain-progress/bl-explain-progress.vue';
import ExplainProgressMedian from '../bl-explain-progress-median/bl-explain-progress-median.vue';

export default defineComponent({
  name: 'ExplainItem',
  props: {
    explainInfo: {
      type: Object as PropType<
        BenchmarkingLibraryModule.BenchmarkingDetailsVOList
      >,
      default: {},
    },
    hasLegend: {
      type: Boolean,
      default: false,
    },
    radio: {
      type: Number,
      default: false,
    },
    benchmarkingObjectName: {
      type: String,
      default: false,
    },
    ObjectList: {
      type: Object as PropType<BenchmarkingLibraryModule.CommonObject[]>,
      default: {},
    },
    treeId: {
      type: Number,
      default: false,
    },
  },
  components: {
    ExplainProgress,
    ExplainProgressMedian,
  },
  setup(props) {
    const isLegend = true;
    const explainInfo = computed(() => {
      return props.explainInfo;
    });
    const hasLegend = computed(() => {
      return props.hasLegend;
    });
    const radio = computed(() => {
      return props.radio;
    });
    let benchmarkingObjectName = computed(() => {
      return props.ObjectList.filter(
        (item: BenchmarkingLibraryModule.CommonObject) => {
          if (item.id == Number(props.treeId)) {
            return item.treeName;
          }
        },
      )[0].treeName;
    });
    watch(
      () => props.treeId,
      newValue => {
        benchmarkingObjectName = props.ObjectList.filter(
          (item: BenchmarkingLibraryModule.CommonObject) => {
            if (item.id == Number(newValue)) {
              return item.treeName;
            }
          },
        )[0].treeName;
      },
    );
    return {
      explainInfo,
      hasLegend,
      radio,
      benchmarkingObjectName,
      isLegend,
    };
  },
});
