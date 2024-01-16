import { defineComponent, ref, PropType, toRef } from 'vue';
import EaDoughnutChart from '@/views/pages/energy-analysis/components/ea-doughnut-chart/ea-doughnut-chart.vue';
import DeviceDetail from '../ea-device-detail/ea-device-detail.vue';
import { thousandSeparation } from '@/utils/index';
export interface PieChartAttribute {
  deviceNumber: number;
  hasDirectDevice: boolean;
  treeName: string;
  rangeDate: string;
}
export default defineComponent({
  name: 'EnergyConsumptionDecompose',
  components: {
    EaDoughnutChart,
    DeviceDetail,
  },
  props: {
    pieChart: {
      // 数据源
      type: Object as PropType<AnalysisManageModule.PieChart>,
      default: [],
    },
    attribute: {
      type: Object as PropType<PieChartAttribute>,
      default: {},
    },
    searchParam: {
      type: Object as PropType<AnalysisManageModule.GetLineBarChartParam>,
      default: {},
    },
    timeSection: {
      type: Array as PropType<string[]>,
      default: [],
    },
  },
  setup(props) {
    const dialogDetailVisible = ref(false);
    const timeSection = toRef(props, 'timeSection');
    const pieList = props.pieChart?.pieChartSeriesList[0]?.pieChartDataList || [];
    const typeName = props.pieChart?.pieChartSeriesList[0]?.energyType?.replace('能耗', '') || '';
    const yAxisItems = props?.pieChart?.yaxisItemList || [];
    // 饼图ref
    const doughnutRef = ref(null);
    // 拿到生成的饼图 file
    const getPieChartFile = () => {
      if (!doughnutRef.value) {
        return;
      }
      return (doughnutRef.value as any).toFile();
    };
    return {
      dialogDetailVisible,
      pieList,
      typeName,
      yAxisItems,
      doughnutRef,
      timeSection,

      thousandSeparation,
      getPieChartFile,
    };
  },
});
