import { defineComponent, onMounted, reactive, ref, nextTick, onUnmounted } from 'vue';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
import { isToday } from 'date-fns';
import { formatDate, thousandSeparation, onScroll } from '@/utils/index';
// components
import PageSearch from './components/ra-page-search/ra-page-search.vue';
import RaMultiaxialChart from './components/ra-multiaxial-chart/ra-multiaxial-chart.vue';
import AnalysisParamCard from './components/ra-param-card/ra-param-card.vue';
// config
import { pageSizes } from '@/config/config';
import { relationTypes } from './constant/index';
// services
import relationAnalysisService from '@/views/pages/relation-analysis/services/relation-analysis.service';
import commonService from '@/services/common/common.service';

export interface TreeData {
  [key: string]: any;
}
export default defineComponent({
  components: {
    PageSearch,
    RaMultiaxialChart,
    AnalysisParamCard,
  },
  setup() {
    const { proxy } = useCurrentInstance();
    // 头部表单
    const queryForm = reactive<RelationAnalysisModule.RelationAnalysisQueryParams>({
      browserParamList: null,
      correlationStatus: '1',
      startTime: '',
      endTime: '',
      energyCode: '',
      isSelf: true,
      timeUnit: '',
      treeId: -1,
      type: 1,
      valueMean: 1,
    });
    // 分类分项列表
    const energyCodeList = ref<EnergyCodeManageModule.EnergyInfo[]>([]);
    // 服务器时间
    const serverDate = ref(new Date());
    // loading
    const loading = ref<boolean>(false);
    // 导出loading
    const exportLoading = ref(false);
    // 是否报错
    const hasAbnormal = ref(false);
    // 错误提示
    const errorMessage = ref('暂无数据');
    // 参数列表
    const correlationValueList = ref<RelationAnalysisModule.RelationAnalysisParamVO[]>([]);
    // 图表时间列表
    const xaxisTimes = ref<number[]>([]);
    // y
    const yaxisItemList = ref<Array<{ title: string; unit: string }>>([]);
    // 数据源
    const seriesData = ref<RelationAnalysisModule.SeriesVO[]>([]);
    // 表格数据
    const tableDataSource = ref<RelationAnalysisModule.RelationAnalysisTableVO[]>([]);
    // 单位
    const timeUnitStr = ref<string>('');
    // 表格动态列
    const paramNames = ref<string[]>([]);
    // 时间颗粒度列表
    const timeUnitList = ref<RelationAnalysisModule.UnitVo[]>([]);
    const pageNum = ref(1);
    const pageSize = ref(pageSizes[0]);
    /**
     * 选择参数
     */
    const onParamSelect = (value: RelationAnalysisModule.RelationAnalysisParamVO, index: number) => {
      if (index === 0 && !Array.isArray(queryForm.browserParamList) && !queryForm.browserParamList) {
        queryForm.browserParamList = [];
      } else if (index !== 0 && !Array.isArray(queryForm.browserParamList) && !queryForm.browserParamList) {
        queryForm.browserParamList = [];
        queryForm.browserParamList.push({
          index: 0,
          paramName: correlationValueList.value[0].paramName,
        });
        queryForm.browserParamList.push({
          index,
          paramName: value.paramName,
        });
      } else if (Array.isArray(queryForm.browserParamList)) {
        const paramNameArr = queryForm.browserParamList.map((item) => {
          return item.paramName;
        });
        if (paramNameArr.includes(value.paramName)) {
          queryForm.browserParamList = queryForm.browserParamList?.filter((item) => {
            return item.paramName !== value.paramName;
          });
        } else {
          queryForm.browserParamList.push({
            index,
            paramName: value.paramName,
          });
        }
      }
      onSearch();
    };
    // 初始查询 可能会根据参数列表切换状态
    const initialSearch = async (value: RelationAnalysisModule.RelationAnalysisQueryForm) => {
      hasAbnormal.value = false;
      const { date, energyCode, treeId } = value;
      queryForm.startTime = formatDate(date[0], 'yyyy-MM-dd');
      queryForm.endTime = formatDate(date[1], 'yyyy-MM-dd');
      queryForm.energyCode = energyCode[0];
      queryForm.treeId = treeId[0];
      loading.value = false;
      await onSearch();
      errorMessage.value = '暂无数据';
      if (correlationValueList.value?.length === 0) {
        queryForm.correlationStatus = '2';
        await onSearch();
        if (correlationValueList.value?.length === 0) {
          queryForm.correlationStatus = '1';
          errorMessage.value = '没有极高或者高度相关参数结果，请重新选择查询条件或进行参数绑定';
        }
      }
    };
    // 头部搜索
    const onPageSearch = async (value: RelationAnalysisModule.RelationAnalysisQueryForm) => {
      queryForm.browserParamList = null;
      hasAbnormal.value = false;
      const { date, energyCode, treeId } = value;
      queryForm.startTime = formatDate(date[0], 'yyyy-MM-dd');
      queryForm.endTime = formatDate(date[1], 'yyyy-MM-dd');
      queryForm.energyCode = energyCode[0];
      queryForm.treeId = treeId[0];
      await onSearch();
    };
    // 重置
    const onReset = (value: RelationAnalysisModule.RelationAnalysisQueryForm) => {
      loading.value = false;
      queryForm.correlationStatus = relationTypes[0].value;
      onPageSearch(value);
    };
    // 初始化错误
    const onError = (value: RelationAnalysisModule.RelationAnalysisQueryForm) => {
      loading.value = false;
      hasAbnormal.value = true;

      const { date, energyCode, treeId } = value;
      queryForm.startTime = formatDate(date?.[0], 'yyyy-MM-dd');
      queryForm.endTime = formatDate(date?.[1], 'yyyy-MM-dd');
      queryForm.energyCode = energyCode?.[0];
      queryForm.treeId = treeId?.[0];
    };
    /**
     * 切换关联类型
     */
    const onRelationTypeChange = async (value: number) => {
      queryForm.timeUnit = '';
      timeUnitList.value = [];
      queryForm.type = value;
      queryForm.browserParamList = null;
      await onQueryPageData();
      if (timeUnitList.value && timeUnitList.value.length > 1) {
        queryForm.timeUnit = timeUnitList.value[0].value;
      } else {
        queryForm.timeUnit = '';
      }
    };
    /**
     * 时间颗粒度change
     */
    const onTimeUnitChange = async () => {
      queryForm.browserParamList = null;
      await onQueryPageData();
    };
    // 头部提交
    const onSubmit = () => {
      queryForm.browserParamList = null;
      onSearch();
    };
    /**
     * 查询数据
     */
    const onSearch = async () => {
      errorMessage.value = '暂无数据';
      queryForm.timeUnit = '';
      timeUnitList.value = [];
      await onQueryPageData();
      if (timeUnitList.value && timeUnitList.value.length > 1) {
        queryForm.timeUnit = timeUnitList.value[0].value;
      } else {
        queryForm.timeUnit = '';
      }
    };
    // 请求数据
    const onQueryPageData = async () => {
      if (loading.value) {
        return;
      }
      if (!queryForm.energyCode) {
        loading.value = false;
        hasAbnormal.value = true;
        return;
      }
      if (!queryForm.treeId) {
        proxy.$message.error('分析对象不能为空！');
        loading.value = false;
        hasAbnormal.value = true;
        return;
      }
      if (!queryForm.startTime || !queryForm.endTime) {
        proxy.$message.error('日期不能为空！');
        loading.value = false;
        hasAbnormal.value = true;
        return;
      }
      try {
        loading.value = true;
        hasAbnormal.value = false;
        const res = await relationAnalysisService.queryCorrelationAnalyseChartShow(getQueryParams());
        if (res && res.code === 200 && res.data) {
          if (res.data.correlationValueList?.length) {
            correlationValueList.value = res.data.correlationValueList;
            timeUnitList.value = res.data.unitList;
            tableDataSource.value = res.data.tableVOList;
            paramNames.value = res.data.paramNames;
            // 数据源
            seriesData.value = res.data.barChartVO.series;
            // x轴时间
            xaxisTimes.value = res.data.barChartVO.xaxisTimes || [];
            // y
            yaxisItemList.value = res.data.barChartVO.yaxisItemList || [];
            //  单位
            timeUnitStr.value = res.data.barChartVO.timeUnit;
            hasAbnormal.value = false;
          } else {
            seriesData.value = [];
            tableDataSource.value = [];
            timeUnitList.value = [];
            hasAbnormal.value = true;
            correlationValueList.value = [];
          }
        } else {
          seriesData.value = [];
          tableDataSource.value = [];
          timeUnitList.value = [];
          hasAbnormal.value = false;
          correlationValueList.value = [];
          proxy.$message.error(res.message || '查询数据失败');
        }
      } catch (error) {
        hasAbnormal.value = true;
        proxy.$message.error('查询失败，网络不佳');
      } finally {
        loading.value = false;
      }
    };
    /**
     * 表格数据导出
     */
    const getTableDataExport = async () => {
      if (exportLoading.value) {
        return;
      }
      exportLoading.value = true;
      await commonService.getFileStreamDownload<RelationAnalysisModule.RelationAnalysisQueryParams>(
        getQueryParams(),
        '/correlationAnalyse/exportCorrelationAnalyseExcel',
        '导出',
        () => {
          exportLoading.value = false;
        },
        () => {
          exportLoading.value = false;
        },
      );
    };
    /**
     * 拼接请求入参
     */
    const getQueryParams = () => {
      const {
        browserParamList,
        correlationStatus,
        startTime,
        endTime,
        energyCode,
        isSelf,
        timeUnit,
        type,
        treeId,
        valueMean,
      } = queryForm;
      const isTodayFlag = isToday(new Date(endTime));
      const hour = new Date().getHours();
      const min = new Date().getMinutes();
      return {
        browserParamList:
          browserParamList?.map((item) => {
            return {
              paramName: item.paramName,
            };
          }) ?? [],
        correlationStatus,
        startTime: `${formatDate(new Date(startTime), 'yyyy-MM-dd')} 00:00`,
        endTime: !isTodayFlag
          ? `${formatDate(new Date(endTime), 'yyyy-MM-dd')} 23:59`
          : `${formatDate(new Date(endTime), 'yyyy-MM-dd')} ${hour > 9 ? hour : '0' + hour}:${
              min > 9 ? min : '0' + min
            }`,
        energyCode,
        isSelf,
        timeUnit,
        type,
        treeId,
        valueMean,
      };
    };
    // 每页条数改变
    const onPageSizeChange = (value: number) => {
      pageSize.value = value;
      pageNum.value = 1;
    };
    // 每页改变
    const onCurrentChange = (value: number) => {
      pageNum.value = Math.floor(value);
    };
    /**
     * 初始值加载失败
     */
    const onInitailValueError = () => {
      loading.value = false;
    };
    /**
     * 初始化这里接口地址没换
     * tod:
     * todo
     */
    onMounted(async () => {
      try {
        let params;
        // 如果有能源异常跳转参数
        if (window.sessionStorage.getItem('ems-energyAbnormalParams')) {
          params = JSON.parse(
            JSON.parse(JSON.stringify(window.sessionStorage.getItem('ems-energyAbnormalParams') || '{}')),
          );
          if (params && Object.keys(params)?.length) {
            queryForm.browserParamList = params.browserParamList?.filter(
              (item: { paramName: string; index?: number }) => {
                return item.paramName;
              },
            );
          }
        }

        /**
         * 判断当前类型是否有数据 -- 如果没有切换类型在查询 如果在没有就展示缺省页
         */
        // window.sessionStorage.removeItem('ems-energyAbnormalParams');

        // 数据加载完成后绑定滚动事件
        nextTick(() => {
          document.querySelector('.page-common')?.addEventListener('scroll', onScroll);
        });
      } catch (error) {
        loading.value = false;
      }
    });
    /**
     * 组件销毁
     */
    onUnmounted(() => {
      document.querySelector('.page-common')?.removeEventListener('scroll', onScroll);
    });

    return {
      relationTypes,
      queryForm,
      tableDataSource,
      energyCodeList,
      loading,
      exportLoading,
      hasAbnormal,
      paramNames,
      timeUnitList,
      xaxisTimes,
      yaxisItemList,
      timeUnitStr,
      seriesData,
      correlationValueList,
      pageSizes,
      pageNum,
      serverDate,
      pageSize,
      errorMessage,
      getTableDataExport,
      onRelationTypeChange,
      onSearch,
      onSubmit,
      onTimeUnitChange,
      onParamSelect,
      thousandSeparation,
      onPageSizeChange,
      onCurrentChange,
      onInitailValueError,
      initialSearch,
      onPageSearch,
      onReset,
      onError,
    };
  },
});
