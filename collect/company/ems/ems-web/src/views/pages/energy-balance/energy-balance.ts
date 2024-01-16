import { defineComponent, reactive, ref, toRefs, watch } from 'vue';
// components
import BalanceSearchForm from './components/eb-search-form/eb-search-form.vue';
import G6ChartView from './components/eb-g6-chart/eb-g6-chart.vue';
// utils
import { calculateQueryParams } from './utils';
// service
import energyBalanceService from '@/views/pages/energy-balance/services/energy-balance.service';
// config
import { treeTypeList } from '@/config/config';

const allTreeTypeList = [...treeTypeList, { value: 3, label: '支路' }];

interface BalanceState {
  dataSource: EnergyBalanceModule.EnergyBalanceInfo;
  totalRatio: string;
  dailyRatio: string;
  direction: number;
  pageLoading: boolean;
  loadError: boolean;
  queryParams: EnergyBalanceModule.PageFormParams;
}
// 方向
const directions = [
  {
    label: '横板',
    value: 1,
  },
  {
    label: '竖版',
    value: 2,
  },
];

export default defineComponent({
  components: {
    BalanceSearchForm,
    G6ChartView,
  },
  setup() {
    const differenceFlag = ref(false);

    const chartRef = ref(null);
    const initialData = {
      branchValue: 0,
      children: [],
      dailyGrowth: 0,
      differenceRatio: 0,
      hasChildren: false,
      collapsed: false,
      totalValue: 0,
      treeId: 0,
      limitFlag: false,
      treeName: '',
      unit: '',
      yesterdayValue: 0,
    };
    const balanceState = reactive<BalanceState>({
      dataSource: initialData,
      totalRatio: '',
      dailyRatio: '',
      direction: directions[1].value,
      pageLoading: true,
      loadError: false,
      queryParams: {
        date: [],
        endTime: '',
        energyCode: [],
        startTime: '',
        treeId: -1,
        treeType: allTreeTypeList[0].value,
      },
    });
    // 是否展示日增长率
    const dailyRatioFlag = ref(true);
    const errorMessage = ref<string>('暂无数据');
    // 根据总分值 日增长筛选
    const onDataSourceFilter = () => {
      if (chartRef.value) {
        (chartRef.value as any).onFilter();
      }
    };
    /**
     * 切换方向
     */
    const onDireactionChange = (data: number) => {
      balanceState.direction = data;
    };
    // 请求失败
    const onError = (message: string = '暂无数据') => {
      errorMessage.value = message;
      balanceState.loadError = true;
      balanceState.pageLoading = false;
    };
    // 重置
    const onReset = (params: EnergyBalanceModule.PageFormParams) => {
      errorMessage.value = '暂无数据';
      balanceState.dailyRatio = '';
      balanceState.totalRatio = '';
      dailyRatioFlag.value = true;
      balanceState.direction = directions[1].value;
      onPageFormQuery(params);
    };
    /**
     * 头部请求
     */
    const onPageFormQuery = async (params: EnergyBalanceModule.PageFormParams) => {
      queryBalanceFlag();
      try {
        errorMessage.value = '暂无数据';

        balanceState.queryParams = params;
        const queryParams = calculateQueryParams(balanceState.queryParams);
        balanceState.pageLoading = true;
        balanceState.loadError = false;
        const res = await energyBalanceService.queryEnergyBalanceData(queryParams);
        if (res && res.code === 200 && res.data) {
          // 需要给顶级节点 collapsed 它的子节点collapsed设置成false
          res.data = { ...res.data, ...{ collapsed: false } };
          if (res.data.children && res.data.children.length) {
            res.data.children = res.data.children.map((item: EnergyBalanceModule.EnergyBalanceInfo) => {
              return { ...item, ...{ collapsed: true } };
            });
          }
          balanceState.dataSource = res.data;
          balanceState.loadError = false;
        } else {
          balanceState.dataSource = initialData;
          balanceState.loadError = true;
        }
      } catch (error) {
        balanceState.loadError = true;
        balanceState.dataSource = initialData;
      } finally {
        balanceState.pageLoading = false;
      }
    };

    const queryBalanceFlag = async () => {
      try {
        const res = await energyBalanceService.queryBalanceFlag();
        if (res && res.code === 200) {
          differenceFlag.value = res.data;
        } else {
          differenceFlag.value = false;
        }
      } catch (error) {
        differenceFlag.value = false;
      }
    };

    // 更新form数据
    const onUpdateForm = (params: EnergyBalanceModule.PageFormParams) => {
      balanceState.queryParams = params;
    };
    watch(
      () => dailyRatioFlag.value,
      (newVal) => {
        if (!newVal) {
          balanceState.dailyRatio = '';
        }
      },
    );

    return {
      ...toRefs(balanceState),
      directions,
      dailyRatioFlag,
      chartRef,
      errorMessage,
      differenceFlag,

      onDataSourceFilter,
      onDireactionChange,
      onPageFormQuery,
      onUpdateForm,
      onError,
      onReset,
    };
  },
});
