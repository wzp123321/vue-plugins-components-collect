import { defineComponent, ref, onMounted, PropType, watch, toRef } from 'vue';

import EaLineBarChart from '@/views/pages/energy-analysis/components/ea-lineBar-chart/ea-lineBar-chart.vue';
import StatisticalAnalysis from '../ea-statistical-analysis/ea-statistical-analysis.vue';
import EnergyConsumptionDetail from '../ea-energy-consumption-detail/ea-energy-consumption-detail.vue';

import energyAnalysisService from '@/views/pages/energy-analysis/services/energy-analysis.service';
import commonService from '@/services/common/common.service';

import { cloneDeep } from 'lodash';
import { formatEmptyValue } from '@/utils/index';
import { switchTableLineChartIcons } from '@/config/config';
import message from '@/utils/message';

const compSwitchTableLineChartIcons = switchTableLineChartIcons.reverse();

export default defineComponent({
  name: 'DeviceDetail',
  components: {
    EaLineBarChart,
    StatisticalAnalysis,
    EnergyConsumptionDetail,
  },
  props: {
    searchParam: {
      type: Object as PropType<AnalysisManageModule.GetLineBarChartParam>,
      default: {},
    },
    treeName: {
      type: String,
      default: '',
    },
    timeSection: {
      type: Array as PropType<string[]>,
      default: [],
    },
  },
  setup(props) {
    const switchIconSelect = ref(2);
    const timeSection = toRef(props, 'timeSection');
    watch(
      () => props.searchParam,
      (val) => {
        getIndexDeviceListData(val);
      },
    );
    const deviceListLoading = ref(true); // 节点设备列表加载框
    const devSelect = ref<any>(null); // 设备选中节点
    const devStandardPointCode = ref(''); // 选中的设备StandardPointCode
    const devPointNumber = ref<number>(-1); // 选中的设备pointNumber
    const deviceList = ref<AnalysisManageModule.IndexDeviceListRes[]>([]); // 设备数据源
    const deviceDetailLoading = ref(true); // 设备信息加载框
    const deviceDetail = ref<any>(null); // 设备信息数据源
    const statisticalLoading = ref(true); // 设备能耗同环比
    const statisticalData = ref(null); // 设备能耗同环比数据源
    const barChartLoading = ref(true); // 设备能耗分析图表数据加载框
    const barChart = ref<AnalysisManageModule.BarChart | null>(null); // 能耗分析柱状图数据
    const energyTableList = ref([]); // 能耗分析数据
    const tableUnit = ref(''); // 当前数据单位
    const tableColumnName = ref(''); // 能耗明细列名
    const tableValueMean = ref('1'); // 能源指标
    const exportLoading = ref(false); // 导出loading

    const selectedEnergyCode = ref<string>(''); // 能源类型

    /**
     * 初始化
     */
    onMounted(async () => {
      await getIndexDeviceListData(props.searchParam);
      await getRealtimeData(props.searchParam, deviceList.value[0].deviceID);
      await getEnergyCompareData(props.searchParam, deviceList.value[0].deviceID);
      if (Object.prototype.toString.call(statisticalData.value) === '[object Null]') {
        barChartLoading.value = false;
        statisticalLoading.value = false;
        return;
      }
      await getEnergyAnalyseData(props.searchParam, deviceList.value[0].deviceID);
    });
    /**
     * 获取节点下设备名称列表
     */
    const getIndexDeviceListData = async (param: AnalysisManageModule.GetLineBarChartParam) => {
      selectedEnergyCode.value = props.searchParam.energyCode;

      deviceListLoading.value = true;
      deviceDetailLoading.value = true;
      statisticalLoading.value = true;
      barChartLoading.value = true;
      await energyAnalysisService
        .getIndexDeviceList(param)
        .then((res: any) => {
          if (res && res.code === 200) {
            if (res.success && res.data) {
              deviceList.value = res.data || [];
              if (deviceList.value.length > 0) {
                devSelect.value = deviceList.value[0].deviceID;
                devStandardPointCode.value = deviceList.value[0].standardPointCode;
                devPointNumber.value = deviceList.value[0].pointNumber;

                selectedEnergyCode.value = deviceList.value[0].energyCode;
              } else {
                deviceDetailLoading.value = false;
                statisticalLoading.value = false;
                barChartLoading.value = false;
              }
            } else {
              deviceList.value = [];
              deviceDetailLoading.value = false;
              statisticalLoading.value = false;
              barChartLoading.value = false;
            }
          } else {
            deviceListLoading.value = false;
            deviceDetailLoading.value = false;
            statisticalLoading.value = false;
            barChartLoading.value = false;
          }
          deviceListLoading.value = false;
        })
        .catch((error: Error) => {
          message.error((error && error.message) || '操作失败');
          deviceListLoading.value = false;
          deviceDetailLoading.value = false;
          statisticalLoading.value = false;
          barChartLoading.value = false;
        });
    };
    /**
     * 设备点击事件
     */
    const deviceOnClick = async (
      deviceID: number,
      standardPointCode: string,
      pointNumber: number,
      energyCode: string,
    ) => {
      switchIconSelect.value = 2;
      devSelect.value = deviceID;
      devPointNumber.value = pointNumber;
      devStandardPointCode.value = standardPointCode;
      selectedEnergyCode.value = energyCode;

      await getRealtimeData(props.searchParam, deviceID);
      await getEnergyCompareData(props.searchParam, deviceID);
      if (Object.prototype.toString.call(statisticalData.value) === '[object Null]') {
        barChartLoading.value = false;
        statisticalLoading.value = false;
        return;
      }
      await getEnergyAnalyseData(props.searchParam, deviceID);
    };
    /**
     * 获取节点设备信息数据
     */
    const getRealtimeData = async (param: AnalysisManageModule.GetLineBarChartParam, currentId: number) => {
      deviceDetailLoading.value = true;
      const params = {
        treeId: currentId,
      };
      await energyAnalysisService
        .getRealtime(params)
        .then((res: any) => {
          if (res && res.code === 200) {
            if (res.success && res.data) {
              deviceDetail.value = res.data;
            } else {
              deviceDetail.value = null;
            }
          } else {
            deviceDetail.value = null;
          }
          deviceDetailLoading.value = false;
        })
        .catch((error: Error) => {
          message.error((error && error.message) || '操作失败');
          deviceDetail.value = null;
          deviceDetailLoading.value = false;
        });
    };
    /**
     * 获取能耗同环比数据
     */
    const getEnergyCompareData = async (param: AnalysisManageModule.GetEnergyCompareParam, currentId: number) => {
      statisticalLoading.value = true;
      const params = cloneDeep(param);
      params.isDevice = 1; // 0 默认 1 查询设备
      params.treeId = currentId;
      await energyAnalysisService
        .getEnergyCompare({
          ...params,
          energyCode: selectedEnergyCode.value,
          standardPointCode: devStandardPointCode.value,
          pointNumber: devPointNumber.value,
        })
        .then((res: any) => {
          if (res && res.code === 200) {
            if (res.success && res.data) {
              statisticalData.value = res.data || null;
            } else {
              statisticalData.value = null;
            }
          } else {
            statisticalData.value = null;
          }
          statisticalLoading.value = false;
        })
        .catch((error: any) => {
          message.error(error.code && error.code !== 500 ? error.message : '查询失败！');
          statisticalData.value = null;
          statisticalLoading.value = false;
        });
    };
    /**
     * 获取能耗分析图表和能耗明细表格数据
     */
    const getEnergyAnalyseData = async (param: AnalysisManageModule.GetLineBarChartParam, currentId: number) => {
      barChartLoading.value = true;
      const params = cloneDeep(param);
      params.isDevice = 1; // 0 默认 1 查询设备
      params.treeId = currentId;
      await energyAnalysisService
        .getEnergyAnalyseBarChart({
          ...params,
          energyCode: selectedEnergyCode.value,
          standardPointCode: devStandardPointCode.value,
          pointNumber: devPointNumber.value,
        })
        .then((res: HttpRequestModule.ResTemplate<any>) => {
          if (res && res.code === 200) {
            if (res.success && res.data) {
              barChart.value = res.data.barChart || null;
              energyTableList.value = res.data.energyTableList || [];
              tableUnit.value = res.data.barChart.yaxisItemList[0].unit || '';
              tableColumnName.value = res.data.colName || '';
              tableValueMean.value = param.valueMean || '1';
            } else {
              barChart.value = null;
              energyTableList.value = [];
              tableUnit.value = '';
              tableColumnName.value = '';
              tableValueMean.value = param.valueMean || '1';
            }
          } else {
            barChart.value = null;
            energyTableList.value = [];
            tableUnit.value = '';
            tableColumnName.value = '';
            tableValueMean.value = param.valueMean || '1';
          }
          barChartLoading.value = false;
        })
        .catch((error: any) => {
          barChart.value = null;
          energyTableList.value = [];
          tableUnit.value = '';
          tableColumnName.value = '';
          tableValueMean.value = param.valueMean || '1';
          message.error(error.code && error.code !== 500 ? error.message : '查询失败！');
          barChartLoading.value = false;
        });
    };
    /**
     * 导出能耗明细
     */
    const exportTable = async () => {
      if (exportLoading.value) {
        return;
      }
      exportLoading.value = true;
      const param = cloneDeep(props.searchParam);
      param.treeId = devSelect.value;
      param.isDevice = 1; // 0 默认 1 查询设备
      commonService.getFileStreamDownload(
        {
          ...param,
          standardPointCode: devStandardPointCode.value,
          pointNumber: devPointNumber.value,
        },
        '/energyAnalyse/exportExcelEnergyAnalyse',
        '导出',
        () => {
          exportLoading.value = false;
        },
        () => {
          exportLoading.value = false;
        },
      );
    };
    return {
      devSelect,
      deviceList,
      devPointNumber,
      switchIconSelect,
      compSwitchTableLineChartIcons,
      barChart,
      energyTableList,
      tableUnit,
      tableColumnName,
      tableValueMean,
      deviceListLoading,
      deviceDetailLoading,
      statisticalLoading,
      statisticalData,
      barChartLoading,
      deviceDetail,
      exportLoading,
      timeSection,

      deviceOnClick,
      exportTable,
      formatEmptyValue,
    };
  },
});
