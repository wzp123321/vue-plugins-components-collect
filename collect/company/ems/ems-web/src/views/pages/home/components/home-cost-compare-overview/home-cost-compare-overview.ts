import { openBlankUrl } from '@/utils/index';
import { defineComponent, reactive, toRefs, ref, onMounted, toRef } from 'vue';
import CostCompareChart from './components/home-cco-chart/home-cco-chart.vue';
import CostCompareCard from './components/home-cco-card/home-cco-card.vue';
import HomeComponentContainer from '../home-component-container/home-component-container.vue';

import { noConfigImg } from '@/config/config';
import _ from 'lodash';
import { useRoute } from 'vue-router';

import CostCompareOverviewService from './services/home-cost-compare-overview';

export interface ItemCode {
  value: string;
  label: string;
}
export interface ChartDataState {
  isLineLoading: boolean;
  isNoConfig: boolean;
  isChartNoData: boolean;
  seriesData: CostCompareOverviewModule.Series;
  xAxisTime: string[];
  yAxisItems: CostCompareOverviewModule.YAxisItem[];
}
export interface CardDataState {
  isCardLoading: boolean;
  isCardNoData: boolean;
  cardData: CostCompareOverviewModule.QueryCompareEnergyRes[];
}

export default defineComponent({
  name: 'CostCompareOverview',
  components: {
    CostCompareChart,
    CostCompareCard,
    'h-component-container': HomeComponentContainer,
  },
  props: {
    uid: {
      type: Number,
      default: null,
    },
    title: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const route = useRoute();
    const title = toRef(props, 'title');
    const switchSelect = ref<string>(''); // 能源类型选中
    const switchItems = ref<ItemCode[]>([]); // 能源类型数据源
    const noConfigTitle = ref<string>('暂未配置');

    const chartErrorTitle = ref<string>('暂无数据');
    const cardErrorTitle = ref<string>('暂无数据');

    const chartDataState = reactive<ChartDataState>({
      isLineLoading: false,
      isNoConfig: false,
      isChartNoData: false,
      seriesData: {
        name: '',
        data: [],
        dataAttach: [],
      },
      xAxisTime: [],
      yAxisItems: [],
    });
    const cardDataState = reactive<CardDataState>({
      isCardLoading: false,
      isCardNoData: false,
      cardData: [],
    });

    // 组件是否为配置
    onMounted(() => {
      getCompareConfigData(props.uid);
    });
    // let changeFlag=false
    const switchChange = _.debounce((item: string) => {
      switchSelect.value = item;
      getCompareEnergyData();
      getEnergyPortalContrastChart();
    }, 800);
    // 跳转详情
    const linkToDetailPage = () => {
      openBlankUrl('/web/energyAnalysis', 'web', route.query);
    };

    /**
     * 获取能源类型数据
     */
    const getCompareConfigData = async (id: number) => {
      cardDataState.isCardNoData = false;
      cardDataState.isCardLoading = true;
      chartDataState.isChartNoData = false;
      chartDataState.isNoConfig = false;
      chartDataState.isLineLoading = true;
      await CostCompareOverviewService.getCompareConfig(id)
        .then((res: HttpRequestModule.ResTemplate<CostCompareOverviewModule.QueryCompareConfigRes>) => {
          if (res && res.code === 200) {
            if (res.data.energyCodes && res.data.energyCodes.length > 0) {
              switchItems.value = res.data.energyCodes.map((item: CostCompareOverviewModule.EnergyCodes) => {
                return {
                  label: item.name || '',
                  value: item.code || '',
                };
              });
              switchSelect.value = switchItems.value && switchItems.value.length > 0 ? switchItems.value[0].value : '';
              getCompareEnergyData();
              getEnergyPortalContrastChart();
            } else {
              cardDataState.isCardNoData = true;
              cardDataState.isCardLoading = false;
              chartDataState.isChartNoData = true;
              chartDataState.isNoConfig = true;
              chartDataState.isLineLoading = false;
            }
          } else {
            cardDataState.isCardNoData = true;
            cardDataState.isCardLoading = false;
            chartDataState.isChartNoData = true;
            chartDataState.isNoConfig = true;
            chartDataState.isLineLoading = false;
            noConfigTitle.value = res?.message.includes('未配置数据源')
              ? '暂未配置'
              : res.message.includes('操作失败')
              ? '暂无数据'
              : res.message;
          }
        })
        .catch(() => {
          cardDataState.isCardNoData = true;
          cardDataState.isCardLoading = false;
          chartDataState.isChartNoData = true;
          chartDataState.isNoConfig = true;
          chartDataState.isLineLoading = false;
        });
    };
    /**
     * 获取日周月年能耗
     */
    const getCompareEnergyData = async () => {
      cardDataState.isCardLoading = true;
      cardDataState.isCardNoData = false;
      const param = {
        energyCode: switchSelect.value,
      };
      await CostCompareOverviewService.getCompareEnergy(param)
        .then((res: HttpRequestModule.ResTemplate<CostCompareOverviewModule.QueryCompareEnergyRes[]>) => {
          if (res && res.code === 200) {
            if (res.data && res.data.length > 0) {
              cardDataState.cardData = res.data;
              cardDataState.isCardNoData = false;
            } else {
              chartErrorTitle.value = res?.message.includes('未配置数据源')
                ? '暂未配置'
                : res.message.includes('操作失败')
                ? '暂无数据'
                : res.message;
              cardDataState.isCardNoData = true;
            }
          } else {
            chartErrorTitle.value = res?.message.includes('未配置数据源')
              ? '暂未配置'
              : res.message.includes('操作失败')
              ? '暂无数据'
              : res.message;
            cardDataState.isCardNoData = true;
          }
        })
        .catch(() => {
          cardDataState.isCardNoData = true;
        })
        .finally(() => {
          cardDataState.isCardLoading = false;
        });
    };
    /**
     * 获取实时能耗曲线折线图
     */
    const getEnergyPortalContrastChart = async () => {
      chartDataState.isLineLoading = true;
      chartDataState.isChartNoData = false;
      const param: CostCompareOverviewModule.QueryCompareEnergyParam = {
        energyCode: switchSelect.value || '',
      };
      await CostCompareOverviewService.getEnergyPortalContrastChart(param)
        .then((res: HttpRequestModule.ResTemplate<CostCompareOverviewModule.LineChartData>) => {
          if (res && res.code === 200) {
            if (res.data && res.data.series && res.data.series.data.length > 0) {
              const { series, xaxisTimes, yaxisItemList } = res.data;
              chartDataState.seriesData = series;
              chartDataState.xAxisTime = xaxisTimes;
              chartDataState.yAxisItems = yaxisItemList;
              chartDataState.isChartNoData = false;
            } else {
              cardErrorTitle.value = res?.message.includes('未配置数据源')
                ? '暂未配置'
                : res.message.includes('操作失败')
                ? '暂无数据'
                : res.message;
              chartDataState.isChartNoData = true;
            }
          } else {
            cardErrorTitle.value = res?.message.includes('未配置数据源')
              ? '暂未配置'
              : res.message.includes('操作失败')
              ? '暂无数据'
              : res.message;
            chartDataState.isChartNoData = true;
          }
        })
        .catch(() => {
          chartDataState.isChartNoData = true;
        })
        .finally(() => {
          chartDataState.isLineLoading = false;
        });
    };
    return {
      ...toRefs(chartDataState),
      ...toRefs(cardDataState),
      noConfigTitle,
      switchSelect,
      switchItems,
      noConfigImg,
      switchChange,
      chartErrorTitle,
      cardErrorTitle,
      title,

      linkToDetailPage,
    };
  },
});
