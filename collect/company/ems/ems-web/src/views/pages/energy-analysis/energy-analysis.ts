import { defineComponent, ref, reactive, toRefs } from 'vue';
import energyAnalysisService from '@/views/pages/energy-analysis/services/energy-analysis.service';
import commonService from '@/services/common/common.service';
// utils
import { checkPageSearchParam } from './utils/index';
import { cloneDeep } from 'lodash';
import { formatDate } from '@/utils/index';
// components
import EaSearch from './components/ea-search/ea-search.vue';
import EaLineBarChart from '@/views/pages/energy-analysis/components/ea-lineBar-chart/ea-lineBar-chart.vue';
import DataDrilling from './components/ea-data-drilling/ea-data-drilling.vue';
import StatisticalAnalysis from './components/ea-statistical-analysis/ea-statistical-analysis.vue';
import EnergyConsumptionDetail from './components/ea-energy-consumption-detail/ea-energy-consumption-detail.vue';
import EnergyConsumptionDecompose from './components/ea-energy-consumption-decompose/ea-energy-consumption-decompose.vue';
import EaOfficeDecompose from './components/ea-office-energy-decompose/ea-office-energy-decompose.vue';
import EaOfficeAnalysis from './components/ea-office-energy-analysis/ea-office-energy-analysis.vue';
import EaOfficeDetail from './components/ea-office-energy-detail/ea-office-energy-detail.vue';
// config
import { VALUE_MEAN_UNCONFIGURE } from '@/config/enum';
import { getCampusParams } from '@/utils/token';
import { energyModel } from './enum';
import message from '@/utils/message';

export interface ObjectNameArrItem {
  id: number;
  name: string;
}

const switchItems = [
  { value: 1, label: '全部' },
  { value: 0, label: '异常' },
];

export default defineComponent({
  name: 'EnergyAnalysis',
  components: {
    EaSearch,
    EaLineBarChart,
    DataDrilling,
    StatisticalAnalysis,
    EnergyConsumptionDetail,
    EnergyConsumptionDecompose,
    EaOfficeDecompose,
    EaOfficeAnalysis,
    EaOfficeDetail,
  },
  setup() {
    const barChartLoading = ref(false); // 能耗分析柱状图加载标志
    const showBarChartNoData = ref(false); // 能耗分析柱状图展示缺省
    const wordExportLoading = ref(false); // 报告导出loading
    const barChart = ref<AnalysisManageModule.BarChart | null>(null); // 能耗分析柱状图数据
    const energyTableList = ref<GlobalModule.CommonObject>([]); // 能耗分析数据
    const tableUnit = ref(''); // 当前数据单位
    // 是否未配置
    const unConfigureMessage = ref('暂无数据');
    const unConfigureFlag = ref(false);
    const tableColumnName = ref(''); // 能耗明细列名
    const tableValueMean = ref('1'); // 能源指标
    const pieChartLoading = ref(false); // 能耗分解加载标志
    const showPieChartNoData = ref(false); // 能耗分解加载展示缺省
    const pieChart = ref<AnalysisManageModule.PieChart | null>(null); // 能耗分解环形图数据
    const lingChartRef = ref(null); // 折线图ref
    const analysisPieRef = ref(null); // 环形图ref
    const exportTableLoading = ref(false); // 表格导出
    const pieChartAttribute = reactive({
      // 能耗分解图属性数据
      treeName: '',
      hasDirectDevice: false,
      deviceNumber: 0,
      rangeDate: '',
    });
    const statisticalLoading = ref(false); // 能耗统计同环比加载标志
    const showstatisticalNoData = ref(false); // 能耗统计同环比展示缺省
    const statisticalData = ref<AnalysisManageModule.EnergyCompareRes | null>(null); // 能耗统计同环比数据
    const dataDrillingLoading = ref(false); // 数据钻取加载标志
    const showDataDrillingNoData = ref(false); // 数据钻取展示缺省
    const dataDrillingTable = ref<{
      data: AnalysisManageModule.DataDrillList[];
      isLeaf: boolean;
      unit: string;
    }>({
      data: [], // 数据钻取数据源
      isLeaf: false, // 是否叶子节点标志
      unit: '', // 数据单位
    });
    const dataDrillingNameArr = ref<ObjectNameArrItem[]>([]); // 钻取对象数组
    const drillingTime = ref(''); // 钻取日期
    const barSingleDrillingTime = ref(''); // 单个柱子钻取日期
    const barSingleDate = ref([]); // 单个柱子钻取日期数组
    const switchSelect = ref(switchItems[0].value);
    const searchParam = ref<AnalysisManageModule.AnalysisSearchData>({
      endTime: '',
      energyCode: '',
      isSelf: true,
      startTime: '',
      timeUnit: null,
      treeId: 1,
      valueMean: '1',
    });
    const drillingSwitchSearchParam = ref<AnalysisManageModule.GetLineBarChartParam | null>(null);
    /**
     * 头部表单提交
     * @param item
     * @returns
     */
    const timeSection = ref<string[]>([]);
    const timeUnitValue = ref<string>();
    const isDepartment = ref(false); // 当前选择的是不是科室
    /**
     * 表单查询
     */
    const searchSubmit = (item: AnalysisManageModule.AnalysisSearchData, model: energyModel) => {
      unConfigureMessage.value = '暂无数据';
      unConfigureFlag.value = false;
      switchSelect.value = switchItems[0].value;
      // console.log('item===', item);
      timeSection.value = [item.startTime, item.endTime];
      timeUnitValue.value = item.timeUnit ?? '';
      if (!item) {
        barChartLoading.value = false;
        pieChartLoading.value = false;
        statisticalLoading.value = false;
        dataDrillingLoading.value = false;
        showBarChartNoData.value = true;
        showDataDrillingNoData.value = true;
        showstatisticalNoData.value = true;
        showPieChartNoData.value = true;
        return;
      }
      barSingleDrillingTime.value = '';
      barSingleDate.value = [];
      searchParam.value = item;
      const param = searchParam.value;

      isDepartment.value = model === energyModel.科室;

      // type 全部 & 异常 ToDo
      Object.assign(param, { type: switchSelect });
      param.treeId = Number(param.treeId);
      drillingSwitchSearchParam.value = cloneDeep(param);
      dataDrillingNameArr.value = [];
      // 处理请求
      handleQuery(param, model);
    };
    // 处理搜索
    const handleQuery = (param: AnalysisManageModule.AnalysisSearchData, model: energyModel) => {
      if (model !== energyModel.科室) {
        getEnergyAnalyseData(param);
        if (param.valueMean === '1') {
          // 能源指标默认的情况下调用
          getEnergyAnalysePieChartData(param);
          getEnergyCompareData(param);
          if (drillingSwitchSearchParam.value) {
            // console.log(drillingSwitchSearchParam.value);
            getEnergyAnalyseDataDrillData(drillingSwitchSearchParam.value, dataDrillingNameArr.value?.length === 0);
          }
        }
      }
    };
    /**
     * 获取能耗分析图表和能耗明细表格数据
     */
    const getEnergyAnalyseData = async (param: AnalysisManageModule.GetLineBarChartParam) => {
      barChartLoading.value = true;
      showBarChartNoData.value = false;
      const params = cloneDeep(param);
      unConfigureFlag.value = false;
      params.isDevice = 0; // 0 默认 1 查询设备
      try {
        const res = await energyAnalysisService.getEnergyAnalyseBarChart(params);
        if (res && res.code === 200) {
          if (res.success && res.data) {
            barChart.value = res.data.barChart || null;
            energyTableList.value = res.data.energyTableList || [];
            tableUnit.value = res.data.barChart.yaxisItemList[0].unit || '';
            tableColumnName.value = res.data.colName || '';
            tableValueMean.value = param.valueMean || '1';
            showBarChartNoData.value = false;
            if (res.data.energyTableList?.length === 0) {
              showBarChartNoData.value = true;
            }
          } else {
            barChart.value = null;
            energyTableList.value = [];
            tableUnit.value = '';
            tableColumnName.value = '';
            tableValueMean.value = param.valueMean || '1';
            showBarChartNoData.value = true;
          }
        } else {
          if (res.code === VALUE_MEAN_UNCONFIGURE.PER_CAPITA || res.code === VALUE_MEAN_UNCONFIGURE.UNIT_AREA) {
            unConfigureFlag.value = true;
          }
          showBarChartNoData.value = true;
          unConfigureMessage.value = res.message || '暂无数据';
          barChart.value = null;
          energyTableList.value = [];
          tableUnit.value = '';
          tableColumnName.value = '';
          tableValueMean.value = param.valueMean || '1';
        }
      } catch (error) {
        barChart.value = null;
        energyTableList.value = [];
        tableUnit.value = '';
        tableColumnName.value = '';
        tableValueMean.value = param.valueMean || '1';
        showBarChartNoData.value = true;
      } finally {
        barChartLoading.value = false;
      }
    };
    /**
     * 获取能耗分解环形图数据
     */
    const getEnergyAnalysePieChartData = async (param: AnalysisManageModule.GetLineBarChartParam) => {
      pieChartLoading.value = true;
      pieChartAttribute.rangeDate = getDrillingDate(param.startTime, param.endTime) || '';
      try {
        const res = await energyAnalysisService.getEnergyAnalysePieChart(param);
        if (res && res.code === 200) {
          if (res.success && res.data) {
            pieChart.value = res.data.pieChart;
            pieChartAttribute.treeName = res.data.treeName || '';
            pieChartAttribute.hasDirectDevice = res.data.hasDirectDevice;
            pieChartAttribute.deviceNumber = res.data.deviceNumber || 0;
            showPieChartNoData.value = false;
            // if (
            //   res.data.pieChart?.pieChartSeriesList[0]?.pieChartDataList
            //     ?.length === 0
            // ) {
            //   showPieChartNoData.value = true;
            // }
          } else {
            showPieChartNoData.value = true;
            pieChart.value = null;
            pieChartAttribute.treeName = '';
            pieChartAttribute.hasDirectDevice = false;
            pieChartAttribute.deviceNumber = 0;
          }
        } else {
          showPieChartNoData.value = true;
          pieChart.value = null;
          pieChartAttribute.treeName = '';
          pieChartAttribute.hasDirectDevice = false;
          pieChartAttribute.deviceNumber = 0;
        }
      } catch (error) {
        pieChart.value = null;
        pieChartAttribute.treeName = '';
        pieChartAttribute.hasDirectDevice = false;
        pieChartAttribute.deviceNumber = 0;
        showPieChartNoData.value = true;
      } finally {
        pieChartLoading.value = false;
      }
    };
    /**
     * 获取能耗同环比数据
     */
    const getEnergyCompareData = async (param: AnalysisManageModule.GetEnergyCompareParam) => {
      statisticalLoading.value = true;
      showstatisticalNoData.value = false;
      const params = cloneDeep(param);
      params.isDevice = 0; // 0 默认 1 查询设备
      try {
        const res = await energyAnalysisService.getEnergyCompare(params);
        if (res && res.code === 200) {
          if (res.success && res.data) {
            statisticalData.value = res.data;
            showstatisticalNoData.value = false;
          } else {
            statisticalData.value = null;
            showstatisticalNoData.value = true;
          }
        } else {
          statisticalData.value = null;
          showstatisticalNoData.value = true;
        }
      } catch (error) {
        statisticalData.value = null;
        showstatisticalNoData.value = true;
      } finally {
        statisticalLoading.value = false;
      }
    };
    /**
     * 柱状图单个柱子点击事件
     */
    const barClick = (item: any) => {
      dataDrillingNameArr.value = [];
      const param: AnalysisManageModule.GetLineBarChartParam = cloneDeep(searchParam.value);
      param.startTime = item.timeArray && item.timeArray.length > 1 ? item.timeArray[0] : '';
      param.endTime = item.timeArray && item.timeArray.length > 1 ? item.timeArray[1] : '';
      param.isSelf = true;
      barSingleDate.value = item.timeArray;
      barSingleDrillingTime.value = item.drillingTime;
      drillingSwitchSearchParam.value = cloneDeep(param);
      getEnergyAnalyseDataDrillData(param, true);
    };
    /**
     * 获取能耗钻取数据
     */
    const getEnergyAnalyseDataDrillData = async (
      param: AnalysisManageModule.GetLineBarChartParam,
      isSelf: boolean = true,
    ) => {
      const params = cloneDeep(param);
      params.isSelf = isSelf;
      params.type = switchSelect.value;
      dataDrillingLoading.value = true;
      showDataDrillingNoData.value = false;
      if (barSingleDate.value && barSingleDate.value.length > 0) {
        params.startTime = barSingleDate.value[0];
        params.endTime = barSingleDate.value[1];
      }
      drillingTime.value = barSingleDrillingTime.value
        ? barSingleDrillingTime.value
        : getDrillingDate(params.startTime, params.endTime);
      try {
        const res = await energyAnalysisService.getEnergyAnalyseDataDrill(params);
        if (res && res.code === 200) {
          if (res.success && res.data) {
            dataDrillingTable.value = {
              data: res.data.dataDrillList || [],
              isLeaf: res.data.isLeaf,
              unit: res.data.unit,
            };
            showDataDrillingNoData.value = false;
            if (res.data.dataDrillList?.length === 0) {
              showDataDrillingNoData.value = true;
            }
          } else {
            dataDrillingTable.value = {
              data: [],
              isLeaf: false,
              unit: '',
            };
            showDataDrillingNoData.value = true;
          }
        } else {
          dataDrillingTable.value = {
            data: [],
            isLeaf: false,
            unit: '',
          };
          showDataDrillingNoData.value = true;
        }
      } catch (error) {
        dataDrillingTable.value = {
          data: [],
          isLeaf: false,
          unit: '',
        };
        showDataDrillingNoData.value = true;
      } finally {
        dataDrillingLoading.value = false;
      }
    };
    /**
     * 获取钻取标题时间
     */
    const getDrillingDate = (startTime: string, endTime: string) => {
      const start = formatDate(new Date(startTime), 'yyyy.MM.dd');
      const end = formatDate(new Date(endTime), 'yyyy.MM.dd');
      if (start === end) {
        return start;
      } else {
        return start + '-' + end;
      }
    };
    /**
     * 滑块切换事件
     */
    const switchChange = () => {
      if (!drillingSwitchSearchParam.value) {
        return;
      }
      getEnergyAnalyseDataDrillData(drillingSwitchSearchParam.value, dataDrillingNameArr.value.length === 0);
    };
    /**
     * 钻取对象单元格点击事件
     */
    const objectNameClick = (item: ObjectNameArrItem) => {
      dataDrillingNameArr.value.push(item);
      const param: AnalysisManageModule.GetLineBarChartParam = cloneDeep(searchParam.value);
      param.treeId = item.id;
      drillingSwitchSearchParam.value = cloneDeep(param);
      getEnergyAnalyseDataDrillData(param, false);
    };
    /**
     * 钻取面包屑点击事件
     */
    const crumbObjectNameClick = (item: ObjectNameArrItem, index: number) => {
      dataDrillingNameArr.value.splice(index + 1, dataDrillingNameArr.value.length - 1);
      const param: AnalysisManageModule.GetLineBarChartParam = cloneDeep(searchParam.value);
      param.treeId = item.id;
      drillingSwitchSearchParam.value = cloneDeep(param);
      getEnergyAnalyseDataDrillData(param, false);
    };
    /**
     * 钻取home查询自身事件
     */
    const crumbHomeClick = () => {
      dataDrillingNameArr.value = [];
      const param: AnalysisManageModule.GetLineBarChartParam = cloneDeep(searchParam.value);
      drillingSwitchSearchParam.value = cloneDeep(param);
      getEnergyAnalyseDataDrillData(param, true);
    };
    /**
     * 报告导出事件
     */
    const reportExport = async () => {
      if (unConfigureFlag.value) {
        message.error(unConfigureMessage.value);
        return;
      }
      /**
       * 判断是哪里没有数据导致无法导出
       */
      if (
        (searchParam.value.valueMean === '1' &&
          (!pieChart.value || pieChart.value.pieChartSeriesList[0].pieChartDataList?.length === 0)) ||
        !barChart.value ||
        barChart.value?.barChartSeriesList[0].values?.length === 0
      ) {
        message.error('暂无数据！');
        return;
      }
      if (!checkPageSearchParam(searchParam.value)) {
        return;
      }
      if (wordExportLoading.value || pieChartLoading.value || barChartLoading.value || !lingChartRef.value) {
        return;
      }
      wordExportLoading.value = true;
      let params = await (lingChartRef.value as any).onCanvasToImage();
      if (searchParam.value.valueMean === '1') {
        const piePhoto = analysisPieRef.value ? await (analysisPieRef.value as any).getPieChartFile() : null;
        params = {
          ...params,
          piePhoto,
        };
      } else {
        params = {
          ...params,
          piePhoto: params.tbPhoto,
        };
      }
      params = {
        ...searchParam.value,
        ...params,
        ...getCampusParams(),
        isDevice: 0,
      };
      const formData = new FormData();
      if (Object.keys(params)?.length) {
        Object.keys(params).forEach((item) => {
          formData.append(item, params[item]);
        });
      }
      try {
        commonService.getFileStreamDownload<GlobalModule.CommonObject>(
          formData,
          '/energyAnalyse/exportReport',
          '导出',
          () => {
            wordExportLoading.value = false;
          },
          () => {
            wordExportLoading.value = false;
          },
        );
      } catch (error) {
        message.error('导出失败');
        wordExportLoading.value = false;
      }
    };
    /**
     * 导出能耗明细
     */
    const exportTable = async () => {
      try {
        if (exportTableLoading.value) {
          return;
        }
        exportTableLoading.value = true;
        const param: AnalysisManageModule.GetLineBarChartParam = cloneDeep(searchParam.value);
        param.isDevice = 0; // 0 默认 1 查询设备
        await energyAnalysisService.exportTable(param, () => {
          exportTableLoading.value = false;
        });
      } catch (error) {
        exportTableLoading.value = false;
      }
    };
    /**
     * 重置树类型
     * @param treeType
     */
    const resetTreeType = (treeType: energyModel) => {
      isDepartment.value = treeType === energyModel.科室;
    };
    // 开始查询
    const handleSearch = () => {
      barChartLoading.value = true;
      pieChartLoading.value = true;
      statisticalLoading.value = true;
      dataDrillingLoading.value = true;
      switchSelect.value = switchItems[0].value;
    };
    /**
     * 初始值加载失败
     */
    const onInitialValueError = () => {
      barChartLoading.value = false;
      pieChartLoading.value = false;
      statisticalLoading.value = false;
      dataDrillingLoading.value = false;
      showBarChartNoData.value = true;
      showDataDrillingNoData.value = true;
      showstatisticalNoData.value = true;
      showPieChartNoData.value = true;

      window.sessionStorage.removeItem('ems-analysis-query-params');
    };
    return {
      ...toRefs(pieChartAttribute),
      unConfigureFlag,
      unConfigureMessage,
      searchParam,
      barChartLoading,
      showBarChartNoData,
      barChart,
      energyTableList,
      tableUnit,
      tableColumnName,
      tableValueMean,
      pieChart,
      pieChartLoading,
      showPieChartNoData,
      statisticalLoading,
      statisticalData,
      dataDrillingLoading,
      showstatisticalNoData,
      showDataDrillingNoData,
      dataDrillingTable,
      dataDrillingNameArr,
      drillingTime,
      switchSelect,
      switchItems,
      drillingSwitchSearchParam,
      lingChartRef,
      analysisPieRef,
      exportTableLoading,
      wordExportLoading,
      timeSection,
      timeUnitValue,
      isDepartment,
      reportExport,
      switchChange,
      objectNameClick,
      crumbObjectNameClick,
      crumbHomeClick,
      searchSubmit,
      exportTable,
      barClick,
      onInitialValueError,
      handleSearch,
      resetTreeType,
    };
  },
});
