import { defineComponent, onMounted, reactive, toRefs, ref, watch } from 'vue';
// components
import SubContainer from './components/bl-sub-container/bl-sub-container.vue';
import ResultItem from './components/bl-result-item/bl-result-item.vue';
import ExplainItem from './components/bl-explain-item/bl-explain-item.vue';
import ExplainItemMedian from './components/bl-explain-item-median/bl-explain-item-median.vue';
import BenchMarkingDetailItem from './components/bl-bench-marking-detail-item/bl-bench-marking-detail-item.vue';
// config
import {
  OPTIONS_BG_COLOR,
  VALUES_BG_COLOR,
  STANDARDS_BG_COLOR,
  AVERAGES_BG_COLOR,
  MINS_BG_COLOR,
  BENCH_STATUS,
  BENCH_TYPE,
} from './constant';
import useCurrentInstance from '@/utils/use-current-instance';
// service
import BenchmarkingLibraryService from './services/benchmarking-library';
// utils
import { formatDate } from '@/utils/index';

interface PageFormState {
  queryFormParams: BenchmarkingLibraryModule.FormParams;
  onSearch: () => void;
  onReset: () => void;
  onDateMonthDisabled: (time: number) => void;
  onDateYearDisabled: (time: number) => void;
}

interface PageContentState {
  loading: boolean;
  typeFlage: number;
  chartExplain: BenchmarkingLibraryModule.ChartExplainInfo;
  showNoData: boolean;
}
interface type {
  value: number;
  label: string;
}
export default defineComponent({
  name: 'benchmarkingLibrary',
  components: {
    SubContainer,
    ResultItem,
    ExplainItem,
    ExplainItemMedian,
    BenchMarkingDetailItem,
  },
  setup() {
    const { proxy } = useCurrentInstance();
    const typeList = [
      { value: 1, label: '平均值对标' },
      { value: 2, label: '中位数对标' },
    ];
    const dimension = ref<type[]>([
      { value: 1, label: '同区域' },
      { value: 2, label: '同医院等级' },
      { value: 3, label: '同医院类型' },
      { value: 4, label: '同月份' },
      { value: 5, label: '同供暖方式' },
      { value: 6, label: '同供冷方式' },
    ]);
    const ObjectList = ref<BenchmarkingLibraryModule.CommonObject[]>([]); // 能耗指标
    const radio = ref(1);
    let benchmarkingObjectName = ref<string>('');
    const treeIds = ref<number>(); // 树结构id
    const switchSelectData = proxy.$emsConfig.dateScopeListMonthOrYear;
    // 头部
    const formModule = () => {
      // 重置
      const onReset = () => {
        contentState.loading = true;
        if (typeList.length === 0 || ObjectList.value?.length === 0) {
          contentState.loading = false;
          contentState.showNoData = true;
          proxy.$message.error('对标对象不能为空');
          return;
        }
        formState.queryFormParams.type = typeList[0].value;
        formState.queryFormParams.treeId = ObjectList.value[0].id;
        formState.queryFormParams.benchmarkingType = '1';
        formState.queryFormParams.yearOrMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));
        formState.queryFormParams.dimensionList = [];
        dimension.value = [
          { value: 1, label: '同区域' },
          { value: 2, label: '同医院等级' },
          { value: 3, label: '同医院类型' },
          { value: 4, label: '同月份' },
          { value: 5, label: '同供暖方式' },
          { value: 6, label: '同供冷方式' },
        ];
        formState.onSearch();
      };
      // 查询
      const onSearch = async () => {
        try {
          contentState.showNoData = false;
          contentState.loading = true;
          const { type, yearOrMonth, treeId, benchmarkingType, dimensionList } = formState.queryFormParams;
          treeIds.value = treeId;
          // radio.value = 1;
          if (treeId === null) {
            contentState.chartExplain = {
              benchmarkingResultVOList: [],
              benchmarkingDetailsVOList: [],
              count: 0,
            };
            contentState.loading = false;
            contentState.showNoData = true;
            return proxy.$message.error('对标对象不能为空');
          }
          const obj = {
            type: type,
            treeId: treeId,
            benchmarkingType,
            yearOrMonth: formatDate(yearOrMonth, benchmarkingType === '1' ? 'yyyy-MM' : 'yyyy'),
            dimensionList: dimensionList,
          };
          const res = await BenchmarkingLibraryService.getBenchmarkingLibraryList(obj);
          if (res && res.code === 200 && res.data) {
            contentState.typeFlage = formState.queryFormParams.type;
            // console.log(res.data);
            contentState.chartExplain.benchmarkingResultVOList = res.data.benchmarkingResultVOList.filter(
              (item: BenchmarkingLibraryModule.BenchmarkingResultVOList) => {
                return item.status !== BENCH_STATUS.NODATA;
              },
            );
            contentState.chartExplain.benchmarkingDetailsVOList = res.data.benchmarkingDetailsVOList.filter(
              (item: BenchmarkingLibraryModule.BenchmarkingDetailsVOList) => {
                return item.status !== BENCH_STATUS.NODATA;
              },
            );
            radio.value = contentState.chartExplain.benchmarkingDetailsVOList[0].benchmarkingIndexId;
            contentState.chartExplain.count = res.data.count;
            contentState.chartExplain = res.data || {};
            contentState.loading = false;
            contentState.showNoData = false;
          } else {
            proxy.$message.info(res.message || '查询数据失败');
            contentState.chartExplain = {
              benchmarkingResultVOList: [],
              benchmarkingDetailsVOList: [],
              count: 0,
            };
            contentState.loading = false;
            contentState.showNoData = true;
          }
        } catch (error) {
          contentState.loading = false;
          contentState.showNoData = true;
          contentState.chartExplain = {
            benchmarkingResultVOList: [],
            benchmarkingDetailsVOList: [],
            count: 0,
          };
        }
      };

      // 日期禁用
      const onDateMonthDisabled = (time: number) => {
        return time > new Date().setMonth(new Date().getMonth() - 1);
      };
      const onDateYearDisabled = (time: number) => {
        return time > new Date().setFullYear(new Date().getFullYear() - 1);
      };
      const formState = reactive<PageFormState>({
        queryFormParams: {
          type: typeList[0].value,
          treeId: undefined,
          benchmarkingType: '1',
          yearOrMonth: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          dimensionList: [],
        },
        onSearch,
        onReset,
        onDateMonthDisabled,
        onDateYearDisabled,
      });
      return { formState };
    };
    // 内容
    const contentModule = () => {
      const contentState = reactive<PageContentState>({
        loading: true,
        typeFlage: 1,
        chartExplain: {
          benchmarkingResultVOList: [],
          benchmarkingDetailsVOList: [],
          count: 0,
        },
        showNoData: false,
      });
      return { contentState };
    };
    const { formState } = formModule();
    const { contentState } = contentModule();
    // 对标对象
    const ObjectListAsync = async () => {
      try {
        const res = await BenchmarkingLibraryService.getBenchmarkingObjectList();
        if (res.code == 200 && res.success) {
          ObjectList.value = res.data || [];
          formState.queryFormParams.treeId = res.data && res.data.length > 0 ? res.data[0].id : undefined;
          formState.onSearch();
        } else {
          contentState.chartExplain = {
            benchmarkingResultVOList: [],
            benchmarkingDetailsVOList: [],
            count: 0,
          };
          contentState.loading = false;
          contentState.showNoData = true;
          proxy.$message.info(res.message);
        }
      } catch (error) {
        contentState.chartExplain = {
          benchmarkingResultVOList: [],
          benchmarkingDetailsVOList: [],
          count: 0,
        };
        contentState.loading = false;
        contentState.showNoData = true;
      }
    };
    // 对标对象下拉框选择事件
    const selectChange = (value: number) => {
      benchmarkingObjectName = ObjectList.value.filter((item: BenchmarkingLibraryModule.CommonObject) => {
        if (item.id == Number(value)) {
          return item.treeName;
        }
      })[0].treeName;
    };

    // 数据时间点击事件
    const switchClick = () => {
      if (formState.queryFormParams.benchmarkingType === '1') {
        formState.queryFormParams.yearOrMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));
        dimension.value = [
          { value: 1, label: '同区域' },
          { value: 2, label: '同医院等级' },
          { value: 3, label: '同医院类型' },
          { value: 4, label: '同月份' },
          { value: 5, label: '同供暖方式' },
          { value: 6, label: '同供冷方式' },
        ];
      } else if (formState.queryFormParams.benchmarkingType === '2') {
        formState.queryFormParams.yearOrMonth = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
        dimension.value = [
          { value: 1, label: '同区域' },
          { value: 2, label: '同医院等级' },
          { value: 3, label: '同医院类型' },
          { value: 5, label: '同供暖方式' },
          { value: 6, label: '同供冷方式' },
        ];
      }
    };
    watch(
      () => formState.queryFormParams.benchmarkingType,
      newValue => {
        if (newValue === '1') {
          dimension.value = [
            { value: 1, label: '同区域' },
            { value: 2, label: '同医院等级' },
            { value: 3, label: '同医院类型' },
            { value: 4, label: '同月份' },
            { value: 5, label: '同供暖方式' },
            { value: 6, label: '同供冷方式' },
          ];
        } else if (newValue === '2') {
          dimension.value = [
            { value: 1, label: '同区域' },
            { value: 2, label: '同医院等级' },
            { value: 3, label: '同医院类型' },
            { value: 5, label: '同供暖方式' },
            { value: 6, label: '同供冷方式' },
          ];
        }
      },
    );
    // 初始化
    onMounted(async () => {
      await ObjectListAsync();
      formState.queryFormParams.type = typeList[0].value;
      formState.queryFormParams.treeId = ObjectList.value.length > 0 ? ObjectList.value[0].id : undefined;
      formState.queryFormParams.benchmarkingType = '1';
      formState.queryFormParams.yearOrMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));
      formState.queryFormParams.dimensionList = [];
    });
    return {
      ...toRefs(formState),
      ...toRefs(contentState),
      typeList,
      ObjectList,
      switchSelectData,
      dimension,
      radio,
      benchmarkingObjectName,
      OPTIONS_BG_COLOR,
      VALUES_BG_COLOR,
      STANDARDS_BG_COLOR,
      AVERAGES_BG_COLOR,
      MINS_BG_COLOR,
      BENCH_TYPE,
      treeIds,
      selectChange,
      switchClick,
    };
  },
});
