import { defineComponent, ref, onMounted, toRef } from 'vue';
import { useRoute } from 'vue-router';

import { thousandSeparation } from '@/utils/index';
import EnergyCostAnalysisService from './services/home-energy-cost-analysis';
import HomeComponentContainer from '../home-component-container/home-component-container.vue';

import { noConfigImg } from '@/config/config';
import { openBlankUrl } from '@/utils/index';

import EcaPieChart from './components/home-eca-pie-chart/home-eca-pie-chart.vue';

export default defineComponent({
  name: 'EnergyCostAnalysis',
  components: {
    EcaPieChart,
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
    const switchSelect = ref('1');
    const switchItems = dataTypeList;
    const totalCost = ref();
    const unit = ref();
    const pieList = ref();
    // 是否配置
    const isNoConfigure = ref(false);
    const isNoConfigureMsg = ref();
    const isLoading = ref(true);
    // 是否有数据
    const isNoData = ref(false);
    const isNoDataMsg = ref();
    // 能源费率是否配置
    const isNoConfigureRate = ref(false);

    onMounted(() => {
      const param: EnergyCostAnalysisModule.pieParam = {
        id: props.uid,
        timeType: switchSelect.value,
      };
      getEnergyCostAnlaysisData(param);
    });

    /**
     * 颗粒度切换事件
     */
    const switchChange = (item: string) => {
      switchSelect.value = item;
      const param: EnergyCostAnalysisModule.pieParam = {
        id: props.uid,
        timeType: item,
      };
      isLoading.value = true;
      getEnergyCostAnlaysisData(param);
    };
    /**
     * 获取成本分析的数据
     * @param
     */
    const getEnergyCostAnlaysisData = async (param: EnergyCostAnalysisModule.pieParam) => {
      isLoading.value = true;
      isNoConfigureRate.value = false;
      isNoConfigure.value = false;

      await EnergyCostAnalysisService.getConsumptionRank(param)
        .then((res: HttpRequestModule.ResTemplate<EnergyCostAnalysisModule.energyCostAnalysisData>) => {
          if (res && res.code === 200) {
            isNoConfigureRate.value = false;
            isNoConfigure.value = false;
            if (res.data.pieChartDataVO && res.data.pieChartDataVO.length > 0) {
              isNoData.value = false;
            } else {
              isNoData.value = true;
              isNoDataMsg.value = '暂无数据';
            }
            totalCost.value = res.data.totalCost;
            unit.value = res.data.unit;
            pieList.value = res.data.pieChartDataVO || [];
          } else if (res && res.code === 16000 && !res.success) {
            isNoConfigureRate.value = true;
            isNoConfigureMsg.value = res.message;
            unit.value = '';
          } else {
            isNoConfigure.value = res?.message.includes('未配置数据源');
            isNoData.value = !isNoConfigure.value;
            isNoDataMsg.value = res?.message.includes('未配置数据源')
              ? '暂未配置'
              : res.message.includes('操作失败')
              ? '暂无数据'
              : res.message;
            isNoConfigureMsg.value = isNoDataMsg.value;
          }
          isLoading.value = false;
        })
        .catch((error: Error) => {
          if (error && error.message.includes('费率')) {
            isNoConfigureRate.value = true;
            isNoConfigure.value = false;
            isNoConfigureMsg.value = error && error.message ? error.message : '暂未配置';
            unit.value = '';
          } else {
            isNoConfigure.value = true;
            isNoConfigureRate.value = false;
            isNoConfigureMsg.value = error && error.message ? error.message : '暂无数据';
            isNoData.value = false;
          }
        })
        .finally(() => {
          isLoading.value = false;
        });
    };
    /**
     * 跳转能源费率页面配置
     */
    const goConfigure = () => {
      const path = '/web/energyRate';
      openBlankUrl(path);
      sessionStorage.setItem('ems-kpiName', 'home');
    };
    // 跳转详情
    const linkToDetailPage = () => {
      openBlankUrl('/web/costAnalysis', 'web', route.query);
    };

    return {
      switchSelect,
      switchItems,
      switchChange,
      thousandSeparation,
      totalCost,
      unit,
      pieList,
      isNoConfigure,
      isNoConfigureMsg,
      noConfigImg,
      isLoading,
      isNoData,
      isNoDataMsg,
      isNoConfigureRate,
      title,

      goConfigure,
      linkToDetailPage,
    };
  },
});

export const dataTypeList = [
  { value: '1', label: '本月' },
  { value: '2', label: '本年' },
];
