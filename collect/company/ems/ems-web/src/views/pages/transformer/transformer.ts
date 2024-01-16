import { defineComponent, onMounted, onUnmounted, reactive, ref } from 'vue';
import transformerForm from '@/views/pages/transformer/components/transformer-form/transformer-form.vue';
import transformerEcharts from '@/views/pages/transformer/components/transformer-echarts/transformer-echarts.vue';
import transformerTables from '@/views/pages/transformer/components/transformer-tables/transformer-tables.vue';
import TransformerService from './services/transformer.services';
import { useCommonController } from '@/utils/use-common-controller';
import DataNone from './components/transformer-data-none/transformer-data-none.vue';
import { debounce, formatDate } from '@/utils/index';
import commonService from '@/services/common/common.service';
import { isToday, endOfMonth, isThisMonth, isThisYear } from 'date-fns';
export default defineComponent({
  name: 'transformer',
  components: {
    transformerForm,
    transformerEcharts,
    transformerTables,
    DataNone,
  },
  setup() {
    const { emitter, proxy } = useCommonController();
    const isDataNone = ref(false);
    const loading = ref(true);
    const size = ref('250');
    const tips = ref('能效节点不能为空，至少有1个能效节点！');
    const resTips = ref('');
    const getAllInfoLoading = ref(false);
    const getParamsLoading = ref(false);
    /**
     * 下方表格模块数据和echarts模块数据
     */
    const tableData = ref<TransformerModule.AllTableData>();
    const paramRank = ref<string[]>([]);
    const echartData = ref<
      HttpRequestModule.ResTemplate<TransformerModule.EchartAndTableData | TransformerModule.MultiResponse | null>
    >();
    const queryParam = reactive<TransformerModule.QueryParams>({
      beginDate: '',
      endDate: '',
      groupFlag: '',
      transObjs: [],
      objType: '',
      objectId: 0,
      paramId: 0,
      timeGranularity: '',
    });
    /**
     * 获取单个设备的数据
     */
    const querySingconstransData = async () => {
      if (getAllInfoLoading.value === true) {
        return;
      }
      getAllInfoLoading.value = true;
      try {
        const res = await TransformerService.getSigleTransData({
          beginDate: queryParam.beginDate,
          endDate: queryParam.endDate,
          groupFlag: queryParam.groupFlag,
          objType: queryParam.objType,
          objectId: queryParam.objectId,
          paramId: queryParam.paramId,
          timeGranularity: queryParam.timeGranularity,
          transObjs: queryParam.transObjs,
        });
        if (res && res.code === 200) {
          if (res.data.chartsAndTableVO) {
            echartData.value = res.data.chartsAndTableVO;
          }
          if (res.data.loadDetailsVO) {
            const obj = {
              loadDetailsVO: res.data.loadDetailsVO,
              lossRatioDetailsVO: res.data.lossRatioDetailsVO,
              paramLevelLists: res.data.paramLevelLists,
            };
            tableData.value = obj;
          }
        } else {
          echartData.value = {
            code: 500,
            message: '',
            success: true,
            data: null,
          };
          tableData.value = {} as TransformerModule.AllTableData;
          emitter.emit('no-common-param', res.message);
        }
      } catch (error) {
        emitter.emit('no-common-param', '');
        proxy.$message.error('获取数据失败！');
      } finally {
        getAllInfoLoading.value = false;
      }
    };
    /**
     * 获取多个设备数据
     */
    const queryMultiTransData = async () => {
      if (getAllInfoLoading.value === true) {
        return;
      }
      getAllInfoLoading.value = true;
      try {
        const res = await TransformerService.getMultiTransData(queryParam);
        if (res && res.code === 200) {
          const obj = {
            code: 200,
            message: '',
            success: true,
            data: res.data.chartsAndTableVO,
          };
          echartData.value = obj;
          paramRank.value = res.data.rankList;
        } else {
          echartData.value = res;
          emitter.emit('no-common-param', res.message);
        }
      } catch (error) {
        echartData.value = {
          code: 500,
          message: '',
          success: true,
          data: null,
        };
        paramRank.value = [];
        emitter.emit('no-common-param', '');
        proxy.$message.error('获取数据失败！');
      } finally {
        getAllInfoLoading.value = false;
      }
    };
    /**
     * 获取公共参数
     */
    const paramData = ref<TransformerModule.ParamInfo[]>([]);
    const queryParamData = async () => {
      if (getParamsLoading.value === true) {
        return;
      }
      getParamsLoading.value = true;
      paramData.value = [];
      try {
        const res = await TransformerService.getParamData(queryParam);
        if (res && res.code === 200) {
          paramData.value = res.data;
          queryParam.paramId = res.data[0].paramId;
          queryMultiTransData();
        } else {
          emitter.emit('no-common-param', res.message);
        }
        getParamsLoading.value = false;
      } catch (error) {
        emitter.emit('no-common-param', '获取公共参数失败！');
        getParamsLoading.value = false;
      }
    };
    /**
     * 报告导出事件
     */
    let endDateReport = formatDate(new Date(), 'yyyy-MM');
    const reportButtonValue = ref('报告导出');
    const dateChange = (data: any) => {
      if (data && data[1]) {
        endDateReport = formatDate(data[1], 'yyyy-MM');
      } else {
        endDateReport = formatDate(new Date(), 'yyyy-MM');
      }
    };
    const wordExportLoading = ref(false);
    const reportExport = async () => {
      debounce(async () => {
        if (getAllInfoLoading.value === false) {
          if (wordExportLoading.value === true) {
            return;
          }
          reportButtonValue.value = '报告正在导出';
          wordExportLoading.value = true;
          const params: any = {
            reportDate: endDateReport,
            timeGranularity: '1M',
          };
          try {
            commonService.getFileStreamDownload<GlobalModule.CommonObject>(
              params,
              '/transformer/shower/loadRatio/word/export',
              '导出',
              () => {
                reportButtonValue.value = '报告导出';
                wordExportLoading.value = false;
              },
              () => {
                reportButtonValue.value = '报告导出';
                wordExportLoading.value = false;
              },
            );
          } catch (error) {
            proxy.$message.error('导出失败');
            reportButtonValue.value = '报告导出';
            wordExportLoading.value = false;
          }
        }
      }, 200);
    };
    /**
     * 能效分析导出表格
     */
    const excelButtonValue = ref('导出');
    interface ExportParams extends TransformerModule.QueryParams {
      paramName: string;
      paramUnit: string;
    }
    const excelExportLoading = ref(false);
    const exportExcel = async () => {
      debounce(async () => {
        if (excelExportLoading.value === true) {
          return;
        }
        excelButtonValue.value = '正在导出';
        excelExportLoading.value = true;
        let paramName = '';
        let paramUnit = '';
        try {
          // 多对象
          if (queryParam.transObjs.length > 1) {
            paramData.value.forEach(item => {
              if (item.paramId === queryParam.paramId) {
                paramName = item.paramName;
                paramUnit = item.unit;
              }
            });
            const param: ExportParams = {
              ...queryParam,
              paramName,
              paramUnit,
            };
            commonService.getFileStreamDownload<GlobalModule.CommonObject>(
              param,
              '/transformer/shower/multi/energyEfficiencyAnalysis/excel/export',
              '导出',
              () => {
                excelButtonValue.value = '导出';
                excelExportLoading.value = false;
              },
              () => {
                excelButtonValue.value = '导出';
                excelExportLoading.value = false;
              },
            );
            // 单对象
          } else {
            const param: ExportParams = {
              ...queryParam,
              paramName,
              paramUnit,
            };
            commonService.getFileStreamDownload<GlobalModule.CommonObject>(
              param,
              '/transformer/shower/energyEfficiencyAnalysis/excel/export',
              '导出',
              () => {
                excelButtonValue.value = '导出';
                excelExportLoading.value = false;
              },
              () => {
                excelButtonValue.value = '导出';
                excelExportLoading.value = false;
              },
            );
          }
        } catch (error) {
          proxy.$message.error('导出失败');
          excelButtonValue.value = '导出';
          excelExportLoading.value = false;
        }
      }, 200);
    };
    /**
     * 根据时间颗粒度进行格式化
     * @param timeUnit
     * @param dates
     * @returns { startDate, endDate }
     */
    const getFormatDateByTimeUnit = (timeUnit: string, dates: Date[]) => {
      let startDate = '';
      let endDate = '';

      switch (String(timeUnit)) {
        case '10m':
          startDate =
            dates && dates?.length === 2 && !!dates[0] ? `${formatDate(dates[0], 'yyyy-MM-dd HH:mm')}:00` : '';
          endDate = dates && dates?.length === 2 && !!dates[1] ? formatDate(dates[1], 'yyyy-MM-dd HH:mm:ss') : '';

          break;
        case '1h':
          startDate =
            dates && dates?.length === 2 && !!dates[0] ? `${formatDate(dates[0], 'yyyy-MM-dd HH')}:00:00` : '';
          endDate = dates && dates?.length === 2 && !!dates[1] ? `${formatDate(dates[1], 'yyyy-MM-dd HH:mm:ss')}` : '';
          break;
        case '1d':
          const istoDay = isToday(dates[1]);
          startDate =
            dates && dates?.length === 2 && !!dates[0] ? `${formatDate(dates[0], 'yyyy-MM-dd')} 00:00:00` : '';
          endDate =
            dates && dates?.length === 2 && !!dates[1]
              ? istoDay
                ? `${formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')}`
                : `${formatDate(dates[1], 'yyyy-MM-dd')} 23:59:00`
              : '';
          break;
        case '1M':
          const isToMonth = dates && dates?.length === 2 && !!dates[1] && isThisMonth(dates[1]);
          startDate =
            dates && dates?.length === 2 && !!dates[0] ? `${formatDate(dates[0], 'yyyy-MM')}-01 00:00:00` : '';
          endDate =
            dates && dates?.length === 2 && dates[1]
              ? isToMonth
                ? formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')
                : formatDate(endOfMonth(dates[1]), 'yyyy-MM-dd HH:mm:ss')
              : '';
          break;
        case '1y':
          const isToYear = dates && dates?.length === 2 && !!dates[1] && isThisYear(dates[1]);
          startDate =
            dates && dates?.length === 2 && !!dates[0] ? `${formatDate(dates[0], 'yyyy')}-01-01 00:00:00` : '';
          endDate =
            dates && dates?.length === 2 && !!dates[1]
              ? isToYear
                ? formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')
                : `${formatDate(dates[1], 'yyyy')}-12-31 23:59:00`
              : '';
          break;
      }
      return { startDate, endDate };
    };
    onMounted(() => {
      // 监听查询事件
      emitter.on('start-query', (data: TransformerModule.FormData) => {
        const { startDate, endDate } = getFormatDateByTimeUnit(data.timeUnit.toString(), data.date);

        queryParam.transObjs = [];
        queryParam.beginDate = startDate;
        queryParam.endDate = endDate;
        queryParam.timeGranularity = data.timeUnit;
        data.energyEfficiencySelectedInfo?.forEach(item => {
          const obj = {
            id: item.id,
            type: item.groupFlag,
          };
          queryParam.transObjs.push(obj);
        });

        if (data.energyEfficiencySelected.length === 1) {
          queryParam.objType = queryParam.transObjs[0].type;
          queryParam.objectId = queryParam.transObjs[0].id;
          isDataNone.value = false;
          querySingconstransData();
        } else if (data.energyEfficiencySelected.length > 1) {
          queryParam.objType = '';
          queryParam.objectId = 0;
          isDataNone.value = false;
          queryParamData();
        } else {
          isDataNone.value = true;
        }
        loading.value = false;
      });
      // 监听公共参数更换选择事件
      emitter.on('change-params', (data: any) => {
        queryParam.paramId = data;
        queryMultiTransData();
      });
      emitter.on('transformer-export', exportExcel);
    });
    onUnmounted(() => {
      emitter.off('start-query');
      emitter.off('change-params');
      emitter.off('transformer-export');
    });
    return {
      tableData,
      paramRank,
      echartData,
      paramData,
      isDataNone,
      loading,
      tips,
      resTips,
      size,
      reportExport,
      dateChange,
      excelButtonValue,
      reportButtonValue,
    };
  },
});
