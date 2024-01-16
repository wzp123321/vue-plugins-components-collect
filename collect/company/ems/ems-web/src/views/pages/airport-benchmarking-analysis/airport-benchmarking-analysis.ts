import { defineComponent, onMounted, reactive, toRefs } from 'vue';
import { useCommonController } from '@/utils/use-common-controller';
// components
import SubContainer from './components/aba-sub-container/aba-sub-container.vue';
import ResultItem from './components/aba-result-item/aba-result-item.vue';
import ExplainItem from './components/aba-explain-item/aba-explain-item.vue';
import BenchMarkingDetailItem from './components/aba-detail-item/aba-detail-item.vue';
// config
import {
  OPTIONS_BG_COLOR,
  VALUES_BG_COLOR,
  STANDARDS_BG_COLOR,
  BENCH_STATUS,
  BENCH_TYPE
} from './constant';
import useCurrentInstance from '@/utils/use-current-instance';
// service
import { getBenchMarkingData } from '@/views/pages/airport-benchmarking-analysis/services/airport-benchmarking-analysis.service';
// utils
import { formatDate } from '@/utils/index';

interface PageFormState {
  queryFormParams: AirportBenchMarkingAnalysisModule.FormParams;
  treeList: TreeManageModule.TreeList[];
  onSearch: () => void;
  onReset: () => void;
  onDateDisabled: (time: number) => void;
}

interface PageContentState {
  loading: boolean;
  chartExplain: AirportBenchMarkingAnalysisModule.ChartExplainInfo;
}

export default defineComponent({
  components: {
    SubContainer,
    ResultItem,
    ExplainItem,
    BenchMarkingDetailItem
  },
  setup() {
    const { proxy } = useCurrentInstance();
    const { getTreeList } = useCommonController();

    // 头部
    const formModule = () => {
      const onReset = () => {
        formState.queryFormParams.treeId = [formState.treeList[0].id];
        formState.queryFormParams.time = new Date().toString();
        onSearch();
      };
      // 查询
      const onSearch = async () => {
        const { treeId, time } = formState.queryFormParams;
        try {
          contentState.loading = true;
          const formatTime = `${formatDate(
            new Date(time).getTime(),
            'yyyy'
          )}-01`;
          const res = await getBenchMarkingData({
            time: formatTime,
            treeId: treeId[0]
          });
          if (res && res.code === 200 && res.data) {
            console.log(res.data);
            res.data.targetResultVOList = res.data.targetResultVOList.filter(
              (item: AirportBenchMarkingAnalysisModule.TargetResultVOList) => {
                return item.status !== BENCH_STATUS.NODATA;
              }
            );
            res.data.targetDetailsVOList = res.data.targetDetailsVOList.filter(
              (item: AirportBenchMarkingAnalysisModule.TargetDetailsVOList) => {
                return item.status !== BENCH_STATUS.NODATA;
              }
            );
            contentState.chartExplain = res.data;
            contentState.loading = false;
          } else {
            proxy.$message.error(res.message || '查询数据失败');
            contentState.loading = false;
          }
        } catch (error) {
          contentState.loading = false;
          proxy.$message.error('查询数据失败');
        }
      };
      // 日期禁用
      const onDateDisabled = (time: number) => {
        return time > new Date().getTime();
      };
      const formState = reactive<PageFormState>({
        queryFormParams: {
          treeId: [],
          time: ''
        },
        treeList: [],
        onSearch,
        onReset,
        onDateDisabled
      });
      return { formState };
    };
    // 内容
    const contentModule = () => {
      const contentState = reactive<PageContentState>({
        loading: false,
        chartExplain: {
          targetResultVOList: [],
          targetDetailsVOList: []
        }
      });
      return { contentState };
    };
    const { formState } = formModule();
    const { contentState } = contentModule();
    // 初始化
    onMounted(async () => {
      formState.treeList = await getTreeList();
      if (formState.treeList && formState.treeList.length) {
        formState.queryFormParams.treeId = [formState.treeList[0].id];
      }
      formState.queryFormParams.time = new Date().toString();
      formState.onSearch();
    });
    return {
      ...toRefs(formState),
      ...toRefs(contentState),
      OPTIONS_BG_COLOR,
      VALUES_BG_COLOR,
      STANDARDS_BG_COLOR,
      BENCH_TYPE
    };
  }
});
