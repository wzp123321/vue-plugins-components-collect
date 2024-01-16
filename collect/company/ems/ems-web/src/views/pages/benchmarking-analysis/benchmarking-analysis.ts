import { defineComponent, reactive, toRefs, onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
// config
import { pageSizes, switchTableLineChartIcons } from '@/config/config';
import { INPUT_TYPES } from '@/config/enum';
import { timeTypes, TIME_TYPE, getBuildingAvatar } from './constant/index';
import echartConfig from '@/config/echarts/index';
// services
import benchMarkingService from '@/views/pages/benchmarking-analysis/services/benchmarking-analysis.service';
import CommonService from '@/services/common/common.service';
// utils
import { useRouter } from 'vue-router';
import useCurrentInstance from '@/utils/use-current-instance';
import { thousandSeparation, onScroll, formatDate, openBlankUrl } from '@/utils/index';
import { getCampusParams } from '@/utils/token';

const compTableChartSwitchIcons = switchTableLineChartIcons.reverse();

interface BenchMarkingState {
  total: number;
  loading: boolean;
  showNoData: boolean;
  showRedirection: boolean;
  exportLoading: boolean;
  detailExportLoading: boolean;
  buildId: number;
  buildName: string;
  queryParams: BenchMarkingAnalysis.BenchMarkingForm;
  parentList: BenchMarkingAnalysis.ParentVO[];
  childList: BenchMarkingAnalysis.ChildVO[];
  buildList: BenchMarkingAnalysis.BenchMarkingBuildVO[];
  dataType: number;
  benchMarkingBuildDetail: BenchMarkingAnalysis.BenchMarkingBuildDetail;
  detailPageNum: number;
  detailPageSize: number;
}

export default defineComponent({
  name: 'BenchMarkingAnalysis',
  setup() {
    const store = useStore();
    // 路由
    const router = useRouter();
    const { proxy } = useCurrentInstance();
    // 错误提示
    const errorMessage = ref('暂无数据');
    const benchMarkingState = reactive<BenchMarkingState>({
      total: 0,
      loading: false,
      showNoData: false,
      showRedirection: false,
      exportLoading: false,
      detailExportLoading: false,
      buildId: 0,
      buildName: '',
      dataType: compTableChartSwitchIcons[0].code,
      queryParams: {
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        pageNum: 1,
        pageSize: pageSizes[0],
        searchCount: true,
        name: '',
        date: [new Date(new Date().getFullYear(), 0), new Date()],
        sonId: null,
        parentId: null,
        timeType: timeTypes[0].value,
      },
      parentList: [],
      childList: [],
      buildList: [],
      detailPageNum: 1,
      detailPageSize: pageSizes[0],
      benchMarkingBuildDetail: {
        benchmarkingBuildingDetailListVOTreeList: [],
        benchmarkingBuildingDetailVO: {
          address: '',
          airConditionedArea: 111,
          area: 10,
          buildingType: '',
          buildingYear: 0,
          coolingMode: '',
          curtainType: '',
          glassType: '',
          heatingArea: 0,
          heatingMode: '',
          layers: 12389,
          name: '我是建筑名称1',
          shapeCoefficient: 0,
          structure: '',
          treeId: 1432534850207776,
          treeName: '南京天溯',
          wallMaterial: '',
          wallWarmMode: '',
          windowMaterialType: '',
        },
      },
    });
    // 主题
    const theme = computed(() => {
      return store.getters.theme;
    });
    const mergeArrUnit = ref<string>('');
    // 详情表格数据
    const compDetailTableList = computed(() => {
      const { detailPageNum, detailPageSize } = benchMarkingState;
      return benchMarkingState.benchMarkingBuildDetail.benchmarkingBuildingDetailListVOTreeList.slice(
        (detailPageNum - 1) * detailPageSize,
        detailPageNum * detailPageSize,
      );
    });
    // 标杆类型change
    const onTimeTypeChange = () => {
      benchMarkingState.queryParams.date = [new Date(new Date().getFullYear(), 0), new Date()];
    };
    // 日期禁用
    const disabledDate = (date: Date) => {
      return date && date.getTime() > new Date().getTime();
    };
    // 搜索
    const onSearch = async () => {
      if (benchMarkingState.loading) {
        return;
      }
      await getBenchMarkingBuildList();
      if (benchMarkingState.buildList?.length === 0) {
        benchMarkingState.loading = false;
        benchMarkingState.showNoData = true;
        return;
      }
      await getBuildDetail();
    };
    // 重置
    const onReset = async () => {
      benchMarkingState.queryParams = {
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        pageNum: 1,
        pageSize: pageSizes[0],
        searchCount: true,
        name: '',
        date: [new Date(new Date().getFullYear(), 0), new Date()],
        sonId: null,
        parentId: null,
        timeType: timeTypes[0].value,
      };
      benchMarkingState.detailPageNum = 1;
      benchMarkingState.detailPageSize = pageSizes[0];
      benchMarkingState.dataType = compTableChartSwitchIcons[0].code;
      errorMessage.value = '暂无数据';
      benchMarkingState.loading = true;
      await getParentList();
      if (!benchMarkingState.queryParams.parentId) {
        benchMarkingState.loading = false;
        benchMarkingState.showNoData = true;
        return;
      }
      await getChildList();
      if (!benchMarkingState.queryParams.sonId) {
        benchMarkingState.loading = false;
        benchMarkingState.showNoData = true;
        return;
      }
      benchMarkingState.loading = false;
      await onSearch();
    };
    // 导出
    const onExport = async () => {
      if (benchMarkingState.exportLoading) {
        return;
      }
      const { name, timeType, date, parentId, sonId } = benchMarkingState.queryParams;
      if (!parentId) {
        proxy.$message.error('请选择父体系');
        return;
      }
      if (!sonId) {
        proxy.$message.error('请选择子体系');
        return;
      }
      if (!date || date?.length !== 2 || !date[0] || !date[1]) {
        proxy.$message.error('请选择日期');
        return;
      }
      benchMarkingState.exportLoading = true;
      const startDate = formatDate(date[0], timeType === TIME_TYPE.MONTH ? 'yyyy-MM' : 'yyyy');
      const endDate = formatDate(date[1], timeType === TIME_TYPE.MONTH ? 'yyyy-MM' : 'yyyy');
      await CommonService.getFileStreamDownload<BenchMarkingAnalysis.ExportBuildListParams>(
        {
          name,
          timeType,
          startDate,
          endDate,
          sonId,
          ...getCampusParams(),
        },
        '/benchmarking/analysis/exportBenchmarkingBuild',
        '导出',
        () => {
          benchMarkingState.exportLoading = false;
        },
        () => {
          benchMarkingState.exportLoading = false;
        },
      );
    };
    // 查询父体系列表
    const getParentList = async () => {
      try {
        const res = await benchMarkingService.getParentList();
        if (res && res.code === 200 && res.data) {
          benchMarkingState.parentList = res.data;
          if (res.data.length) {
            benchMarkingState.queryParams.parentId = res.data[0].parentId;
          } else {
            benchMarkingState.showNoData = true;
            benchMarkingState.queryParams.parentId = null;
          }
        } else {
          benchMarkingState.showNoData = true;
          benchMarkingState.parentList = [];
        }
      } catch (error) {
        benchMarkingState.showNoData = true;
        benchMarkingState.parentList = [];
        benchMarkingState.loading = false;
      }
    };
    // 查询子体系列表
    const getChildList = async () => {
      try {
        const { parentId } = benchMarkingState.queryParams;
        if (!parentId) {
          return;
        }
        const res = await benchMarkingService.getChildListByParentId({
          parentId,
        });
        if (res && res.code === 200 && res.data) {
          benchMarkingState.childList = res.data;
          if (res.data.length) {
            benchMarkingState.queryParams.sonId = res.data[0].sonId;
          } else {
            benchMarkingState.queryParams.sonId = null;
            benchMarkingState.showNoData = true;
          }
        } else {
          benchMarkingState.childList = [];
          benchMarkingState.showNoData = true;
        }
      } catch (error) {
        benchMarkingState.childList = [];
        benchMarkingState.showNoData = true;
        benchMarkingState.loading = false;
      }
    };
    // 页面pagesize切换
    const onPageSizeChange = (value: number) => {
      benchMarkingState.queryParams.pageNum = 1;
      benchMarkingState.queryParams.pageSize = value;
      onSearch();
    };
    // 分页
    const onPageChange = (value: number) => {
      benchMarkingState.queryParams.pageNum = Math.floor(value);
      onSearch();
    };
    // 页面pagesize切换
    const onDetailPageSizeChange = (value: number) => {
      benchMarkingState.detailPageNum = 1;
      benchMarkingState.detailPageSize = value;
    };
    // 分页
    const onDetailPageChange = (value: number) => {
      benchMarkingState.detailPageNum = value;
    };
    /**
     * 查询建筑信息列表
     */
    const getBenchMarkingBuildList = async () => {
      const {
        pageSize,
        pageNum,
        orders,
        searchCount,
        name,
        timeType,
        date,
        parentId,
        sonId,
      } = benchMarkingState.queryParams;
      if (!parentId) {
        proxy.$message.error('请选择父体系！');
        return;
      }
      if (!sonId) {
        proxy.$message.error('请选择子体系！');
        return;
      }
      if (!date || date?.length !== 2) {
        proxy.$message.error('请选择日期！');
        return;
      }
      const startDate = formatDate(date[0], timeType === TIME_TYPE.MONTH ? 'yyyy-MM' : 'yyyy');
      const endDate = formatDate(date[1], timeType === TIME_TYPE.MONTH ? 'yyyy-MM' : 'yyyy');
      benchMarkingState.loading = true;
      errorMessage.value = '暂无数据';
      try {
        const res = await benchMarkingService.getBenchmarkingBuildList({
          pageSize,
          pageNum,
          orders,
          searchCount,
          name,
          timeType,
          startDate,
          endDate,
          parentId,
          sonId,
        });
        benchMarkingState.showRedirection = false;
        if (res && res.code === 200 && res.data) {
          if (res.data.list && res.data.list.length) {
            benchMarkingState.buildList = res.data.list;
            benchMarkingState.total = res.data.total;
            benchMarkingState.buildId = res.data.list[0].buildId;
            benchMarkingState.buildName = res.data.list[0].buildName;
          } else {
            errorMessage.value = '未配置关联了节点的建筑信息，请确认！';
            benchMarkingState.showRedirection = true;
            benchMarkingState.showNoData = true;
            benchMarkingState.buildList = [];
            benchMarkingState.total = 0;
          }
        } else {
          errorMessage.value = res.message || '暂无数据';
          benchMarkingState.showNoData = true;
          benchMarkingState.buildList = [];
          benchMarkingState.total = 0;
        }
      } catch (error) {
        benchMarkingState.showNoData = true;
        benchMarkingState.buildList = [];
        benchMarkingState.total = 0;
        proxy.$message.error('查询失败，网络不佳！');
        benchMarkingState.loading = false;
      }
    };
    // 选择建筑
    const onQueryBuildDetail = async (buildId: number, buildName: string) => {
      benchMarkingState.dataType = 2;
      benchMarkingState.buildId = buildId;
      benchMarkingState.buildName = buildName;
      benchMarkingState.loading = true;
      benchMarkingState.showNoData = false;
      await getBuildDetail();
    };
    // 获取建筑详情
    const getBuildDetail = async () => {
      errorMessage.value = '暂无数据';
      benchMarkingState.dataType = 2;
      benchMarkingState.detailPageNum = 1;
      benchMarkingState.detailPageSize = pageSizes[0];
      const { buildId } = benchMarkingState;
      const { timeType, date, sonId, parentId } = benchMarkingState.queryParams;
      if (!parentId) {
        return;
      }
      if (!sonId) {
        return;
      }
      if (!date || date?.length !== 2) {
        return;
      }
      const startDate = formatDate(date[0], timeType === TIME_TYPE.MONTH ? 'yyyy-MM' : 'yyyy');
      const endDate = formatDate(date[1], timeType === TIME_TYPE.MONTH ? 'yyyy-MM' : 'yyyy');
      try {
        const res = await benchMarkingService.getBenchMarkingBuildDetail({
          buildId,
          sonId: Number(sonId),
          startDate,
          endDate,
          timeType,
        });
        if (res && res.code === 200 && res.data) {
          benchMarkingState.benchMarkingBuildDetail = res.data;
          benchMarkingState.showNoData = false;
        } else {
          errorMessage.value = res.message || '暂无数据';
          benchMarkingState.benchMarkingBuildDetail.benchmarkingBuildingDetailListVOTreeList = [];
        }
      } catch (error) {
        benchMarkingState.benchMarkingBuildDetail.benchmarkingBuildingDetailListVOTreeList = [];
      } finally {
        benchMarkingState.loading = false;
      }
    };
    // 初始化图表
    const onInitCharts = () => {
      const { benchMarkingBuildDetail } = benchMarkingState;
      let options = {};
      if (benchMarkingBuildDetail && benchMarkingBuildDetail.benchmarkingBuildingDetailListVOTreeList?.length) {
        const unit = benchMarkingBuildDetail.benchmarkingBuildingDetailListVOTreeList[0].unit;

        // x轴
        const getXaxisData = () => {
          return benchMarkingState.benchMarkingBuildDetail.benchmarkingBuildingDetailListVOTreeList.map(
            (item: BenchMarkingAnalysis.BenchmarkingBuildingDetailListVOTreeList) => {
              return item.date ? formatDate(new Date(item.date), 'yyyy.MM') : '';
            },
          );
        };
        const actualValueList = benchMarkingState.benchMarkingBuildDetail.benchmarkingBuildingDetailListVOTreeList.map(
          (item: BenchMarkingAnalysis.BenchmarkingBuildingDetailListVOTreeList) => {
            return item.actualValue;
          },
        );
        const averageValueList = benchMarkingState.benchMarkingBuildDetail.benchmarkingBuildingDetailListVOTreeList.map(
          (item: BenchMarkingAnalysis.BenchmarkingBuildingDetailListVOTreeList) => {
            return item.averageValue;
          },
        );
        const benchmarkValueList = benchMarkingState.benchMarkingBuildDetail.benchmarkingBuildingDetailListVOTreeList.map(
          (item: BenchMarkingAnalysis.BenchmarkingBuildingDetailListVOTreeList) => {
            return item.benchmarkValue;
          },
        );

        const merge = [...actualValueList, ...averageValueList, ...benchmarkValueList];
        // tslint:disable-next-line:only-arrow-functions
        let mergeArrMaxNum: any = merge.reduce((a, b) => {
          return b > a ? b : a;
        });
        if (
          mergeArrMaxNum !== '--' &&
          mergeArrMaxNum !== '' &&
          mergeArrMaxNum !== null &&
          mergeArrMaxNum !== undefined
        ) {
          mergeArrMaxNum = Number(mergeArrMaxNum);
          if (mergeArrMaxNum?.toFixed(0).length > 5 && mergeArrMaxNum?.toFixed(0).length < 8) {
            mergeArrUnit.value = 'k';
          } else if (mergeArrMaxNum?.toFixed(0).length >= 8 && mergeArrMaxNum?.toFixed(0).length < 11) {
            mergeArrUnit.value = 'M';
          } else if (mergeArrMaxNum?.toFixed(0).length >= 11 && mergeArrMaxNum?.toFixed(0).length < 14) {
            mergeArrUnit.value = 'G';
          } else if (mergeArrMaxNum?.toFixed(0).length >= 14 && mergeArrMaxNum?.toFixed(0).length < 17) {
            mergeArrUnit.value = 'T';
          } else if (mergeArrMaxNum?.toFixed(0).length >= 17 && mergeArrMaxNum?.toFixed(0).length < 20) {
            mergeArrUnit.value = 'P';
          } else if (mergeArrMaxNum?.toFixed(0).length >= 20) {
            mergeArrUnit.value = 'E';
          }
        }
        options = {
          color: echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR,
          title: {
            text: `单位（${unit}）`,
            textStyle: {
              color: 'rgba(0, 0, 0, 0.45)',
              fontSize: 14,
            },
            top: 20,
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: echartConfig.themeConstant[theme.value].CHARTS_TOOLTIP_BG_COLOR,
            padding: echartConfig.echartsConstant.CHARTS_TOOLTIP_PADDING,
            shadowColor: echartConfig.echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_COLOR,
            shadowOffsetX: echartConfig.echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_OFFSETX,
            shadowOffsetY: echartConfig.echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_OFFSETY,
            textStyle: {
              color: echartConfig.themeConstant[theme.value].CHARTS_TOOLTIP_TEXT_COLOR,
              align: 'left',
            },
            axisPointer: {
              type: 'line',
              snap: true,
              animation: false,
              lineStyle: {
                type: 'solid',
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 1,
                      color: 'rgba(24, 144, 255, 0.01)', // 0% 处的颜色
                    },
                    {
                      offset: 0,
                      color: '#1890ff', // 100% 处的颜色
                    },
                  ],
                  global: false, // 缺省为 false
                },
              },
            },
            formatter: (params: any) => {
              let htmlStr = `<span style="margin-bottom:10px">${params[0].axisValue || '--'}</span></br>`;
              params.forEach((item: any) => {
                htmlStr += `<span style="line-height:23px">
                                <span style="display:inline-block;padding-right:6px">${item.seriesName ||
                                  '--'}：</span>${
                  Object.prototype.toString.call(item.value) !== '[object Null]' &&
                  Object.prototype.toString.call(item.value) !== '[object Undefined]'
                    ? thousandSeparation(item.value)
                    : '--'
                }
                                <span style="display:inline-block">${
                                  Object.prototype.toString.call(item.value) !== '[object Null]' &&
                                  Object.prototype.toString.call(item.value) !== '[object Undefined]'
                                    ? unit
                                    : ''
                                }</span></span></br>`;
              });
              htmlStr += '</span>';
              return htmlStr;
            },
          },
          legend: {
            type: 'scroll',
            itemWidth: 20,
            itemHeight: 2,
            icon: 'rect',
            itemGap: 60,
          },
          grid: {
            left: '1%',
            right: '0%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis: Object.assign(echartConfig.echartsOption(theme.value).ECHARTS_LINECHART_AXIS_CATEGORY_OPTION, {
            data: getXaxisData(),
          }),
          yAxis: {
            type: 'value',
            offset: 0,
            axisLine: {
              show: true,
              lineStyle: {
                color: echartConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR,
              },
            },
            axisTick: {
              lineStyle: {
                color: echartConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
              },
              length: 2,
            },
            axisLabel: {
              color: echartConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
              fontSize: echartConfig.echartsConstant.CHARTS_FONT_SIZE_14,
              lineHeight: 22,
              formatter(value: number, index: number) {
                let texts;
                if (mergeArrUnit.value === 'k') {
                  texts = Number(value / 1000) + 'k';
                } else if (mergeArrUnit.value === 'M') {
                  texts = Number(value / 1000000) + 'M';
                } else if (mergeArrUnit.value === 'G') {
                  texts = Number(value / 1000000000) + 'G';
                } else if (mergeArrUnit.value === 'T') {
                  texts = Number(value / 1000000000000) + 'T';
                } else if (mergeArrUnit.value === 'P') {
                  texts = Number(value / 1000000000000000) + 'P';
                } else if (mergeArrUnit.value === 'E') {
                  texts = Number(value / 1000000000000000000) + 'E';
                } else {
                  texts = Number(value);
                }
                return texts;
              },
            },
            splitLine: {
              show: true,
            },
            boundaryGap: [0, 0.01],
          },
          series: [
            {
              name: '实际值',
              type: 'line',
              itemStyle: {
                borderWidth: 20,
              },
              symbol: 'circle',
              symbolSize: 16,
              showSymbol: true,
              emphasis: {
                scale: false,
                itemStyle: echartConfig.echartsUtils.getsymbolStyle(
                  echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[0],
                ),
              },
              data: echartConfig.echartsUtils.getDataIsShowDot(
                actualValueList,
                echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[0],
              ),
            },
            {
              name: '平均值',
              type: 'line',
              itemStyle: {
                borderWidth: 20,
              },
              symbol: 'circle',
              symbolSize: 16,
              showSymbol: true,
              emphasis: {
                scale: false,
                itemStyle: echartConfig.echartsUtils.getsymbolStyle(
                  echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[1],
                ),
              },
              data: echartConfig.echartsUtils.getDataIsShowDot(
                averageValueList,
                echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[1],
              ),
            },
            {
              name: '标杆值',
              type: 'line',
              itemStyle: {
                borderWidth: 20,
              },
              emphasis: {
                scale: false,
                itemStyle: echartConfig.echartsUtils.getsymbolStyle(
                  echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[2],
                ),
              },
              symbolSize: 16,
              symbol: 'circle',
              showSymbol: true,
              data: echartConfig.echartsUtils.getDataIsShowDot(
                benchmarkValueList,
                echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[2],
              ),
            },
          ],
        };
      }
      return options;
    };
    // 跳转配置快捷入口配置
    const toConfigurePage = () => {
      router.push('/benchmarkingManage');
    };
    // 导出详情表格数据
    const onExportBuildDetailTable = async () => {
      if (errorMessage.value !== '暂无数据') {
        proxy.$message.error(errorMessage.value);
        return;
      }
      if (benchMarkingState.detailExportLoading) {
        return;
      }
      const { buildId } = benchMarkingState;
      const { timeType, date, sonId, parentId } = benchMarkingState.queryParams;
      if (!parentId) {
        proxy.$message.error('请选择父体系');
        return;
      }
      if (!sonId) {
        proxy.$message.error('请选择子体系');
        return;
      }
      if (!date || date?.length !== 2) {
        proxy.$message.error('请选择日期');
        return;
      }
      benchMarkingState.detailExportLoading = true;
      const startDate = formatDate(date[0], timeType === TIME_TYPE.MONTH ? 'yyyy-MM' : 'yyyy');
      const endDate = formatDate(date[1], timeType === TIME_TYPE.MONTH ? 'yyyy-MM' : 'yyyy');
      await CommonService.getFileStreamDownload<BenchMarkingAnalysis.QueryBuildTreeParams>(
        {
          buildId,
          timeType,
          startDate,
          endDate,
          sonId: Number(sonId),
        },
        '/benchmarking/analysis/exportBenchmarkingBuildingDetail',
        '导出',
        () => {
          benchMarkingState.detailExportLoading = false;
        },
        () => {
          benchMarkingState.detailExportLoading = false;
        },
      );
    };
    // 跳转后台配置页
    const onLinkTo = () => {
      openBlankUrl('/buildingInformation', 'admin');
    };
    /**
     * 初始化
     */
    onMounted(async () => {
      errorMessage.value = '暂无数据';
      benchMarkingState.loading = true;
      await getParentList();
      if (!benchMarkingState.queryParams.parentId) {
        benchMarkingState.loading = false;
        benchMarkingState.showNoData = true;
        return;
      }
      await getChildList();
      if (!benchMarkingState.queryParams.sonId) {
        benchMarkingState.loading = false;
        benchMarkingState.showNoData = true;
        return;
      }
      benchMarkingState.loading = false;
      await onSearch();
    });

    return {
      ...toRefs(benchMarkingState),
      errorMessage,
      timeTypes,
      INPUT_TYPES,
      pageSizes,
      compTableChartSwitchIcons,
      compDetailTableList,
      getBuildingAvatar,
      onSearch,
      onReset,
      onPageSizeChange,
      onPageChange,
      getChildList,
      thousandSeparation,
      onExport,
      onExportBuildDetailTable,
      onInitCharts,
      onQueryBuildDetail,
      onDetailPageSizeChange,
      onDetailPageChange,
      disabledDate,
      onScroll,
      toConfigurePage,
      onTimeTypeChange,
      onLinkTo,
    };
  },
});
