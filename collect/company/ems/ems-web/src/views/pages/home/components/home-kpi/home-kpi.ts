import { openBlankUrl } from '@/utils/index';
import { defineComponent, reactive, ref, toRefs, onMounted, toRef, computed } from 'vue';
import { useRoute } from 'vue-router';

import KpiChart from './components/home-kpi-chart/home-kpi-chart.vue';
import KpiDetail from './components/home-kpi-detail/home-kpi-detail.vue';
import NoDatas from './components/home-kpi-no-data/home-kpi-no-data.vue';
import HomeComponentContainer from '../home-component-container/home-component-container.vue';

import kpiService from './services/home-kpi';

import { noConfigImg } from '@/config/config';

export default defineComponent({
  name: 'Kpi',
  components: {
    KpiChart,
    KpiDetail,
    NoDatas,
    'h-component-container': HomeComponentContainer,
  },
  props: {
    configContent: {
      type: String,
      default: '',
    },
    uid: {
      type: Number,
      default: null,
    },
    uComponentCode: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const title = toRef(props, 'title');
    const route = useRoute();

    const tableState = reactive<any>({
      isLoading: true,
      isNoData: false,
      isNoDataData: false,
      isNoDataMsg: '暂无数据',
      isNoConfig: false,
      isNoConfigMsg: '暂未配置',
      tableData: [],
    });
    const canJump = computed(() => {
      return !!props.configContent;
    });

    const kpiType = ref<number | string>(1);
    const switchSelect = ref(1); // 颗粒度选中
    const switchItems: any = ref([
      // { value: 1, label: '本月' },
      // { value: 2, label: '本年' },
    ]); // 颗粒度数据源
    const chartData = reactive({
      percentData: null,
      unitName: '',
    });
    const cardData = ref<KpiModule.CardItem[]>([
      //  { name: '', value: 0 },
      { name: '当前消耗值', value: 0 },
      { name: '剩余值', value: 0 },
      { name: '定额值', value: 0 },
      { name: '理想消耗值', value: 0 },
    ]);
    const tipsData = reactive({
      content: '',
      // '能耗使用速率异常，即将超出定额！能耗使用速率异常，即将超出定额！能耗使用速率异常，即将超出定额！',
      subTip: '',
    });
    // 跳转路由参数
    const kpiTypeId = ref();
    const kpiDingeType = ref();
    const energyConservationEnergyCode = ref<string>();

    const getKpiData = async () => {
      tableState.isLoading = true;
      tableState.isNoData = false;
      tableState.isNoDataData = false;
      tableState.isNoConfig = false;
      try {
        const obj = {
          componentCode: props.uComponentCode,
          id: props.uid,
          timeType: switchSelect.value,
        };
        const res = await kpiService.getKpiData(obj);
        if (res && res.code === 200 && res.success) {
          if (res.data) {
            if (res.data.percentages) {
              if (res.data.percentages.charAt(res.data.percentages.length - 1) === '%') {
                res.data.percentages = res.data.percentages.substr(0, res.data.percentages.length - 1);
              }
            }
            chartData.percentData = res.data.percentages || '--';
            const str = res.data.energyCodeUnit ? '(' + res.data.energyCodeUnit + ')' : '';

            if (!res.data.energyCodeName && !res.data.energyCodeUnit) {
              chartData.unitName = '--';
            } else {
              chartData.unitName = res.data.energyCodeName + str;
            }
            cardData.value[0].value = res.data.currentConsumption || '--';
            cardData.value[1].value = res.data.residualValue || '--';
            cardData.value[2].value = res.data.quotaValue || '--';
            cardData.value[3].value = res.data.idealConsumption || '--';
            tipsData.content = res.data.suggestions || '';
            if (res.data.quotaType) {
              switchItems.value = res.data.quotaType.split(',').map((item: any) => {
                if (item === '1') {
                  return {
                    value: 1,
                    label: '本月',
                  };
                }
                if (item === '2') {
                  return {
                    value: 2,
                    label: '本年',
                  };
                }
              });
            }
            if (res.data.quotaConfigInfo) {
              tableState.isNoDataData = true;
              tableState.isNoDataMsg = '无定额数据';
              if (res.data.quotaConfigInfo) {
                kpiType.value = Number(res.data.quotaConfigInfo.kpiType); //判断跳转是节能考核 定额配置还是kpi管理定额配置
                kpiTypeId.value = res.data.quotaConfigInfo.energyCodeId; //跳转到kpi定额配置 能源id
                kpiDingeType.value = switchSelect.value; //选择年 还是选择月
                energyConservationEnergyCode.value = String(res.data.quotaConfigInfo.energyCode); //节能考核 能源code
              }
            }
          } else {
            tableState.isNoData = true;
            tableState.isNoDataMsg = '暂无数据';
          }
          tableState.isNoConfig = false;
        } else {
          tableState.isNoConfig = res?.message.includes('未配置数据源');
          tableState.isNoData = !tableState.isNoConfig;
          tableState.isNoDataMsg = res?.message.includes('未配置数据源')
            ? '暂未配置'
            : res.message.includes('操作失败')
            ? '暂无数据'
            : res.message;
          tableState.isNoConfigMsg = tableState.isNoDataMsg;
        }
        tableState.isLoading = false;
      } catch (err) {
        console.warn('err', err);

        tableState.isNoConfig = true;
        if (err && (err as any)?.message.includes('500')) {
          tableState.isNoConfigMsg = '暂未配置';
        } else {
          tableState.isNoConfigMsg = (err && (err as any)?.message) || '暂未配置';
        }
        tableState.isNoDataMsg = (err && (err as any)?.message) || '暂无数据';
        tableState.isLoading = false;
      }
    };
    // 切换
    const switchChange = async () => {
      await getKpiData();
    };
    // 跳转详情
    const linkToDetailPage = () => {
      if (!canJump.value) {
        return;
      }
      openBlankUrl(kpiType.value === 1 ? '/web/energyConservationAssess' : '/web/kpiManagement', 'web', route.query);
    };

    onMounted(async () => {
      // 初始化kpi配置
      try {
        const res = await kpiService.getInitData(props.uid);
        if (res.code === 200 && res.success) {
          if (res.data && res.data.quotaType) {
            switchItems.value = res.data.quotaType.split(',').map((item: any) => {
              if (item === '1') {
                return {
                  value: 1,
                  label: '本月',
                };
              }
              if (item === '2') {
                return {
                  value: 2,
                  label: '本年',
                };
              }
            });
          }
          kpiType.value = Number(res.data && res.data.kpiType);
          if (switchItems.value.length) {
            switchSelect.value = switchItems.value[0].value; //选中节点
          }
        }
      } catch (err) {
        console.log(err);
      }
      await getKpiData();
    });
    return {
      ...toRefs(tableState),
      ...toRefs(chartData),
      switchSelect,
      switchItems,
      cardData,
      tipsData,
      noConfigImg,
      kpiType,
      kpiTypeId,
      kpiDingeType,
      energyConservationEnergyCode,
      title,
      canJump,

      linkToDetailPage,
      switchChange,
    };
  },
});
