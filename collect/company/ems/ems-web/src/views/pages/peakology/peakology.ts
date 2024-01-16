import { defineComponent, ref, onMounted, reactive, computed, nextTick } from 'vue';
// utils
import { useStore } from 'vuex';
import { cloneDeep } from 'lodash';
import { formatDate } from '@/utils/index';
import { FGetElTreeDefaultProps, disabledProps } from '@/utils/token';
import { useCommonController } from '@/utils/use-common-controller';
import { format, subDays } from 'date-fns';

import CommonService from '@/services/common/common.service';
import useCurrentInstance from '@/utils/use-current-instance';

import { switchTableScatterChartIcons } from '@/config/config';
import url from '@/api/api-url';

import peakology from './peakology.service';
import AverageLineCharts from './components/p-average-line-chart/p-average-line-chart.vue';
import EveryDayRankTables from './components/p-every-day-rank-table/p-every-day-rank-table.vue';
import EveryDayScotterCharts from './components/p-every-day-scotter-chart/p-every-day-scotter-chart.vue';
import EveryDayTables from './components/p-every-day-table/p-every-day-table.vue';
import LevelNodePieChart from './components/p-level-node-pie-chart/p-level-node-pie-chart.vue';
import LastNodePieChart from './components/p-last-node-pie-chart/p-last-node-pie-chart.vue';

enum PEAKOLOGY_TYPE {
  ANALYSIS = 1, // 展示峰值分析
  STATISTICS = 0, // 展示峰值统计
}

export interface TreeData {
  [key: string]: any;
}
interface formInlineType {
  analysisObject: number[];
  radioValue: number;
  date1: any[];
  date2: any;
}
interface everyDayRankTableObjType {
  endTime: string;
  energyCode: string;
  exportType: number | string;
  isSelf: boolean;
  startTime: string;
  timeUnit: string;
  treeIds: any[];
  type: number;
  valueMean: number;
}

export default defineComponent({
  components: {
    AverageLineCharts,
    EveryDayRankTables,
    EveryDayScotterCharts,
    EveryDayTables,
    // BarCharts,
    LevelNodePieChart,
    LastNodePieChart,
  },
  setup() {
    const store = useStore();
    const treeTypeList = [
      { value: 1, label: '区域' },
      { value: 3, label: '支路' },
    ];
    let serverDate;
    const { proxy } = useCurrentInstance();
    const { getTreeListWithExpandKeys } = useCommonController();
    const radioData = treeTypeList;
    const formInline = reactive<formInlineType>({
      analysisObject: [], //选中的分析对象
      radioValue: radioData[0].value,
      date1: [], // 多选日期
      date2: '', // 单选日期
    });
    const lightOrDark = computed(() => {
      return store.getters.theme === 'light' ? true : false;
    });
    const selected = ref<number>(1); // 图标switch按钮选中
    const switchIconSelect = ref<number>(1);
    let formInline_copy: formInlineType;
    const abnormal = ref<boolean>(true);

    const analysisObjectExpanedKeys = ref([]);
    const analysisObjectData = ref<TreeData[]>([]);
    const treeLoading = ref<boolean>(false);

    const activeName = ref<string>('first');
    const loadings = ref<boolean>(true);
    const everyDayRankTableData = ref([]); // 散点图 每日功率峰值排名列表
    const everyDayTableData = ref([]); // 散点图  每日功率峰值散点图对应列表
    const everyDayScotterChartData = ref([]); // 散点图数据
    const averageLineChartData = ref<any>({}); // 折线图数据
    let everyDayRankTableObj: everyDayRankTableObjType; // 散点图 每日功率峰值排名列表 导出参数
    const flag = ref<number>(PEAKOLOGY_TYPE.ANALYSIS); // 判断当前是折现还是散点 0不显示饼图

    const nums = ref<number>(1); // 解决平均功率走势图可能出血线不更新问题
    const levelNodePieChartData = ref<any>({}); // 下级节点饼图数据
    const lastNodePieChartData = ref<any>({}); // 末级节点饼图数据
    const showLastNodeChart = ref<boolean>(true);
    let sTime: string = ''; // 折线图峰值点时间
    const lineRemark = ref<boolean>(true); // 单对象，日期为同一天或者多对象但日期 展示折线图
    const scatterRemark = ref<boolean>(false); // 单对象 日期不为同一天 展示散点图和表格
    // 导出loading
    const exportLoading = ref(false);
    // chart导出
    const chartExportLoading = ref(false);

    const childNodePieNodataTitle = ref<string>('暂无数据');
    const lastNodePieNodataTitle = ref<string>('暂无数据');

    const treeRaidoChange = async () => {
      try {
        await getAnalysisTreeData();
        abnormal.value = true;
      } catch (err) {
        abnormal.value = false;
      }
    };

    // 默认禁止选择日期
    const disabledDate = (time: Date) => {
      return time.getTime() > Date.now();
    };

    // 初始化日期
    const pageInit = async () => {
      try {
        serverDate = await CommonService.getServerDate();
        formInline.date1 = [serverDate, serverDate];
        formInline.date2 = serverDate;
        abnormal.value = true;
      } catch (err) {
        abnormal.value = true;
      }
    };

    // 获取分析对象
    const getAnalysisTreeData = async () => {
      try {
        treeLoading.value = true;
        const res = await getTreeListWithExpandKeys(formInline.radioValue, '01000');
        // const res = await CommonService.getEmsTreeInfo(param);
        console.log('分析对象', res);
        if (res && res.data) {
          analysisObjectExpanedKeys.value = res.expandTreeIds;
          analysisObjectData.value = res.data || [];
          formInline.analysisObject = res.data?.length
            ? !res.data[0]?.lockFlag
              ? [res.data[0].id]
              : res.data[0]?.childTree?.length
              ? [res.data[0]?.childTree[0].id]
              : []
            : [];
        } else {
          analysisObjectExpanedKeys.value = [];
          analysisObjectData.value = [];
          formInline.analysisObject = [];
        }
        abnormal.value = true;
      } catch (err) {
        analysisObjectExpanedKeys.value = [];
        analysisObjectData.value = [];
        formInline.analysisObject = [];
        abnormal.value = false;
      } finally {
        treeLoading.value = false;
      }
    };

    // 获取平均走势折线图峰值点时间 通过时间峰值点时间获取下级节点和末级节点饼图
    const getMaxPoint = (data: any) => {
      const maxValue = Math.max(...data.series[0].data); //最大值
      const maxIndex = data.series[0].data.indexOf(maxValue); //最大值下标
      const time = data.xaxisTimes[maxIndex];
      // 平均走势折线图 峰值点的时间
      sTime = formatDate(time, 'yyyy-MM-dd HH:mm');
      return sTime;
    };

    const getTableList = async () => {
      try {
        loadings.value = true;
        // 判断是否是当天 当天就传当天的年月日时分 不是当天就传整天;
        const date = formatDate(new Date(), 'yyyy-MM-dd');
        const obj = {
          // endTime: formatDate(formInline.date1[1], 'yyyy-MM-dd HH:mm'),
          endTime:
            date === formatDate(formInline.date1[1], 'yyyy-MM-dd')
              ? formatDate(new Date(), 'yyyy-MM-dd HH:mm')
              : formatDate(formInline.date1[1], 'yyyy-MM-dd') + ' 23:59',
          energyCode: '01000',
          exportType: '',
          isSelf: true,
          startTime: formatDate(formInline.date1[0], 'yyyy-MM-dd') + ' 00:00',
          timeUnit: '',
          treeIds: [...formInline.analysisObject],
          type: 1,
          valueMean: 1,
        };
        everyDayRankTableObj = cloneDeep(obj);
        // return
        // 获取单对象单日期折线图   多对象单日期折线图 单对象多日期折线图
        if (flag.value == PEAKOLOGY_TYPE.ANALYSIS && formInline.analysisObject.length <= 1) {
          try {
            const res = await peakology.queryPeakLineChart(obj);
            if (res && res.code == 200 && res.success) {
              console.log(res, '单对象单日期折线图');
              averageLineChartData.value = res.data || {};
              // 最大峰值点时间
              if (res.data) {
                sTime = getMaxPoint(res.data);
              }
              nums.value++;
              lineRemark.value = true;
              scatterRemark.value = false;
              abnormal.value = true;
            } else {
              abnormal.value = true;
            }
          } catch (error) {
            loadings.value = false;
          } finally {
            loadings.value = false;
          }
        } else if (flag.value == PEAKOLOGY_TYPE.ANALYSIS && formInline.analysisObject.length > 1) {
          try {
            obj.startTime = formatDate(formInline.date2, 'yyyy-MM-dd') + ' 00:00';
            obj.endTime =
              date === formatDate(formInline.date2, 'yyyy-MM-dd')
                ? formatDate(new Date(), 'yyyy-MM-dd HH:mm')
                : formatDate(formInline.date2, 'yyyy-MM-dd') + ' 23:59';
            const res = await peakology.queryPeakLineChart(obj);
            if (res && res.code == 200 && res.success) {
              nums.value++;
              console.log(res, '多对象单日期折线图');
              averageLineChartData.value = res.data || {};
              // 最大峰值点时间
              if (res.data) {
                sTime = getMaxPoint(res.data);
              }
              lineRemark.value = true;
              scatterRemark.value = false;
              loadings.value = false;
              abnormal.value = true;
            } else {
              abnormal.value = true;
            }
          } catch (error) {
            loadings.value = false;
          } finally {
            loadings.value = false;
          }
        } else {
          try {
            const res = await peakology.queryPeakStatistics(obj);
            if (res.code == 200 && res.success) {
              console.log(res, '单对象多日期散点图');
              everyDayRankTableData.value = (res.data && res.data.barChartVO.tableVOList) || [];
              everyDayTableData.value = (res.data && res.data.scatterVO.tableVOList) || [];
              everyDayScotterChartData.value = (res.data && res.data.scatterVO.chartVO) || [];
              lineRemark.value = false;
              scatterRemark.value = true;
              // selected.value = 1;
              loadings.value = false;
              abnormal.value = true;
            } else {
              abnormal.value = true;
            }
          } catch (error) {
            loadings.value = false;
          } finally {
            loadings.value = false;
          }
        }
      } catch (err) {
        console.log(err);
        loadings.value = false;
        abnormal.value = false;
      }
    };

    // 下级节点饼图数据
    const getLevelPieList = async (time: string) => {
      try {
        childNodePieNodataTitle.value = '暂无数据';
        loadings.value = true;
        const obj = {
          endTime: time,
          energyCode: '01000',
          exportType: '',
          isSelf: true,
          startTime: time,
          timeUnit: '',
          treeIds: [...formInline.analysisObject],
          type: 1,
          valueMean: 1,
          treeType: formInline.radioValue,
        };
        const resLevel = await peakology.queryPeakPieChart(obj);
        if (resLevel.code == 200 && resLevel?.success && resLevel?.data) {
          levelNodePieChartData.value = resLevel.data || {};
          loadings.value = false;
        } else {
          levelNodePieChartData.value = {};
          loadings.value = false;
          childNodePieNodataTitle.value =
            resLevel.message && !resLevel.message.includes('操作') ? resLevel.message : '暂无数据';
        }
      } catch (err) {
        levelNodePieChartData.value = {};
        loadings.value = false;
      }
    };

    // 末级节点饼图数据
    const getLastPieList = async (time: string) => {
      try {
        lastNodePieNodataTitle.value = '暂无数据';
        loadings.value = true;
        showLastNodeChart.value = true;
        const obj = {
          endTime: time,
          energyCode: '01000',
          exportType: '',
          isSelf: true,
          startTime: time,
          timeUnit: '',
          treeIds: [...formInline.analysisObject],
          type: 1,
          treeType: formInline.radioValue,
          valueMean: 1,
        };
        const resLast = await peakology.queryPeakLastPieChart(obj);
        console.log('resLast-=-----', resLast);
        if (resLast.code == 200 && resLast.success && resLast?.data) {
          showLastNodeChart.value = true;
          lastNodePieChartData.value = resLast.data || {};
        } else {
          showLastNodeChart.value = false;
          lastNodePieChartData.value = {};
          lastNodePieNodataTitle.value =
            resLast.message && !resLast.message.includes('操作') ? resLast.message : '暂无数据';
        }
      } catch (err) {
        showLastNodeChart.value = false;
        lastNodePieChartData.value = {};
      } finally {
        loadings.value = false;
      }
    };

    const onSubmit = async () => {
      showLastNodeChart.value = false;
      sTime = '';
      if (formInline.analysisObject.length < 1) {
        return proxy.$message.error('分析对象不能为空！');
      }

      if (!formInline.date1 || formInline.date1?.length === 0 || !formInline.date2) {
        return proxy.$message.error('请选择日期！');
      }

      // 单个日期对象 选择时间不是同一天 散点图展示 不然展示折线图和表格  flag.value为0展示散点图 不然则展示折线图
      flag.value =
        formInline.analysisObject.length <= 1 &&
        String(format(formInline.date1[0], 'yyyy-MM-dd hh:mm:ss')) !=
          String(format(formInline.date1[1], 'yyyy-MM-dd hh:mm:ss'))
          ? PEAKOLOGY_TYPE.STATISTICS
          : PEAKOLOGY_TYPE.ANALYSIS;
      await getTableList();
      // 重置饼图数据
      if (sTime === '') {
        levelNodePieChartData.value = {};
        lastNodePieChartData.value = {};
      }
      if (flag.value == PEAKOLOGY_TYPE.ANALYSIS && sTime !== '') {
        getLevelPieList(sTime);
        getLastPieList(sTime);
      }
    };

    const onReset = () => {
      showLastNodeChart.value = false;
      pageInit();
      formInline_copy.radioValue = radioData[0].value;
      formInline_copy.date1 = [new Date(), new Date()];
      Object.assign(formInline, formInline_copy);
      lineRemark.value = true;
      scatterRemark.value = false;
      flag.value = PEAKOLOGY_TYPE.ANALYSIS;
      if (formInline.analysisObject.length < 1) {
        return proxy.$message.error('分析对象不能为空');
      }
      onSubmit();
      treeRaidoChange();
    };

    const switchIconChange = (date: number) => {
      nextTick(() => {
        window.dispatchEvent(new Event('resize'));
      });
      selected.value = date;
    };

    // 导出
    const exportData = async (params: number) => {
      if (exportLoading.value && params === 1) {
        return;
      }
      if (chartExportLoading.value && params === 0) {
        return;
      }
      if (params === 0) {
        chartExportLoading.value = true;
      }
      if (params === 1) {
        exportLoading.value = true;
      }
      everyDayRankTableObj.exportType = params;
      await CommonService.getFileStreamDownload(
        everyDayRankTableObj,
        url.downLoad.exportPeakStatistics,
        '导出',
        () => {
          if (params === 0) {
            chartExportLoading.value = false;
          }
          if (params === 1) {
            exportLoading.value = false;
          }
        },
        () => {
          if (params === 0) {
            chartExportLoading.value = false;
          }
          if (params === 1) {
            exportLoading.value = false;
          }
        },
      );
    };

    onMounted(async () => {
      showLastNodeChart.value = false;

      setTimeout(() => {
        loadings.value = false;
      }, 2000);
      await getAnalysisTreeData();
      await pageInit();
      formInline_copy = cloneDeep(formInline);
      if (window.sessionStorage.getItem('ems-energyAbnormalParams')) {
        const params = JSON.parse(
          JSON.parse(JSON.stringify(window.sessionStorage.getItem('ems-energyAbnormalParams'))),
        );
        if (params && params.treeId) {
          formInline.analysisObject = [params.treeId];
          formInline.date1 = [new Date(subDays(new Date(), 1)), new Date(subDays(new Date(), 1))];
          if (params.transferDate) {
            formInline.date1 = [
              new Date(subDays(new Date(params.transferDate), 1)),
              new Date(subDays(new Date(params.transferDate), 1)),
            ];
          }
          window.sessionStorage.removeItem('ems-energyAbnormalParams');

          if (params?.treeType) {
            formInline.radioValue = params?.treeType;
          }
        }
      }
      if (formInline.analysisObject.length < 1) return;
      await onSubmit();
    });

    return {
      formInline,
      analysisObjectData,
      radioData,
      analysisObjectExpanedKeys,
      activeName,
      switchTableScatterChartIcons,
      switchIconSelect,
      disabledProps,

      selected,
      lineRemark,
      scatterRemark,
      lightOrDark,
      everyDayRankTableData,
      everyDayTableData,
      everyDayScotterChartData,
      averageLineChartData,
      nums,
      loadings,
      abnormal,
      levelNodePieChartData, // 下级节点饼图数据
      lastNodePieChartData, // 末级节点饼图数据
      showLastNodeChart,
      flag,
      PEAKOLOGY_TYPE,
      exportLoading,
      chartExportLoading,
      lastNodePieNodataTitle,
      childNodePieNodataTitle,
      treeLoading,

      onSubmit,
      onReset,
      treeRaidoChange,
      disabledDate,
      switchIconChange,
      FGetElTreeDefaultProps,
      exportData,
    };
  },
});
