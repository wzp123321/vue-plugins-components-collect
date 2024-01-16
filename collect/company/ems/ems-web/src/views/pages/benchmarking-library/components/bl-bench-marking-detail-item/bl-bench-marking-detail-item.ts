import { defineComponent, PropType, computed, ref, watch } from 'vue';
// constant
import { BENCH_STATUS, BENCH_TYPE } from '../../constant';
// utils
import { thousandSeparation } from '@/utils/index';
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
    benchmarkingDetailsVOList: {
      type: Array as PropType<
        BenchmarkingLibraryModule.BenchmarkingDetailsVOList[]
      >,
      default: 220,
    },
    type: {
      type: String,
      default: '',
    },
    benchmarkingObjectName: {
      type: String,
      default: '',
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
  name: 'BenchMarkingDetailItem',
  setup(props) {
    const title = computed(() => {
      return props.title;
    });
    const list = computed(() => {
      return props.benchmarkingDetailsVOList;
    });
    const bgColor = computed(() => {
      return props.bgColor;
    });
    const type = computed(() => {
      return props.type;
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
      title,
      list,
      bgColor,
      BENCH_TYPE,
      type,
      BENCH_STATUS,
      benchmarkingObjectName,
      thousandSeparation,
    };
  },
});
