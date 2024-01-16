import { computed, defineComponent, reactive, toRefs, ref } from 'vue';
import { useStore } from 'vuex';
// services
import energyRankingService from '@/views/pages/energy-ranking/services/energy-ranking.service';
import CommonService from '@/services/common/common.service';
import useCurrentInstance from '@/utils/use-current-instance';
import { formatEmptyValue, thousandSeparation, onScroll, formatDate } from '@/utils/index';
import EchartsConfig from '@/config/echarts/index';
import { switchSortIcons } from '@/config/config';
import url from '@/api/api-url';
import { EChartsOption, format } from 'echarts';
import { cloneDeep } from 'lodash';
import { isToday } from 'date-fns';
// config
import { VALUE_MEAN_UNCONFIGURE } from '@/config/enum';
// 组件
import PageSearchForm from '@/views/pages/energy-ranking/components/er-page-search-form/er-page-search-form.vue';

interface EnergyRankingState {
  loading: boolean;
  showNoData: boolean;
  showChartNoData: boolean;
  switchIconSelect: number;
  isReverse: boolean;
  tableDataList: EnergyRankingModule.EnergyRankTableVOList[];
  lineChartDataList: EnergyRankingModule.PieChartDataList[];
  pieTotal: number;
  pieChartDataList: EnergyRankingModule.PieChartDataList[];
  searchParams: EnergyRankingModule.EnergyRankingQueryParams;
  energyCodeList: EnergyCodeManageModule.EnergyInfo[];
  treeIdList: TreeManageModule.TreeList[];
  serverDate: Date;
  yaxisShowFlag: boolean; // y轴文本显示与否
  yaxisText: string; // y轴文本
  yPosition: {
    top: string;
    left: string;
  };
  unit: string;
  energyType: string;
  downloadLoading: boolean;
  colName: string;
  customConfig: Array<{
    type: string;
    placeholder: string;
    data: number | string | string[] | number[];
  }>;
}

export default defineComponent({
  components: {
    PageSearchForm,
  },
  setup() {
    const store = useStore();
    const { proxy } = useCurrentInstance();
    const energyRankingState = reactive<EnergyRankingState>({
      loading: false,
      showNoData: false,
      showChartNoData: false,
      switchIconSelect: 1,
      isReverse: false,
      tableDataList: [],
      lineChartDataList: [],
      pieChartDataList: [],
      pieTotal: 0,
      yaxisShowFlag: false,
      yaxisText: '',
      yPosition: {
        left: '',
        top: '',
      },
      unit: '',
      energyType: '',
      colName: '能耗值',
      downloadLoading: false,
      searchParams: {
        energyCode: '',
        startTime: '',
        endTime: '',
        treeIdList: [],
        valueMean: '1',
        withCompare: 0,
        withCount: 1,
      },
      energyCodeList: [],
      treeIdList: [],
      serverDate: new Date(),
      customConfig: [],
    });
    // 未配置提示语
    const unConfigureMessage = ref('暂无数据');
    // 主题
    const theme = computed(() => {
      return store.getters.theme || 'light';
    });
    /**
     * 柱状图正序逆序
     * 1-降序
     * 2-升序
     */
    const switchIconChange = () => {
      energyRankingState.isReverse = !energyRankingState.isReverse;
      energyRankingState.lineChartDataList.reverse();
    };
    // 头部初始化失败
    const onError = () => {
      energyRankingState.loading = false;
      energyRankingState.showNoData = true;

      window.sessionStorage.removeItem('ems-energyRankingLinkParam');
      window.sessionStorage.removeItem('ems-energyAbnormalParams');
    };
    /**
     * 请求页面数据
     */
    const onQueryRankingData = async (params: EnergyRankingModule.EnergyRankingPageForm) => {
      try {
        energyRankingState.switchIconSelect = 1;
        unConfigureMessage.value = '暂无数据';
        if (energyRankingState.isReverse) {
          energyRankingState.isReverse = false;
        }
        energyRankingState.loading = true;
        energyRankingState.showNoData = false;
        energyRankingState.showChartNoData = false;

        const { energyCode, date, treeIdList, valueMean } = params;
        energyRankingState.searchParams.energyCode = energyCode[0];
        energyRankingState.searchParams.valueMean = valueMean;
        energyRankingState.searchParams.startTime = formatDate(date[0], 'yyyy-MM-dd') + ' 00:00';
        energyRankingState.searchParams.endTime = isToday(date[1])
          ? `${formatDate(new Date(), 'yyyy-MM-dd HH:mm')}`
          : formatDate(date[1], 'yyyy-MM-dd 23:59');
        energyRankingState.searchParams.treeIdList = treeIdList;
        const res = await energyRankingService.getEnergyRankingList(energyRankingState.searchParams);
        if (res && res.code === 200 && res.data) {
          const { energyRankTableVOList, lineChart, pieChart, colName } = res.data;
          energyRankingState.colName = colName;
          energyRankingState.tableDataList = energyRankTableVOList;
          energyRankingState.lineChartDataList = lineChart.pieChartSeriesList[0].pieChartDataList.reverse() || [];
          energyRankingState.pieChartDataList = pieChart.pieChartSeriesList[0].pieChartDataList;
          energyRankingState.pieTotal = pieChart.total as number;
          energyRankingState.unit = lineChart.yaxisItemList && lineChart.yaxisItemList[0].unit;
          energyRankingState.energyType =
            lineChart &&
            lineChart.pieChartSeriesList &&
            lineChart.pieChartSeriesList.length > 0 &&
            lineChart.pieChartSeriesList[0].energyType
              ? lineChart.pieChartSeriesList[0].energyType.replace('能耗', '')
              : '';
          if (energyRankingState.lineChartDataList?.length === 0) {
            energyRankingState.showChartNoData = true;
          }
        } else {
          if (res.code === VALUE_MEAN_UNCONFIGURE.PER_CAPITA || res.code === VALUE_MEAN_UNCONFIGURE.UNIT_AREA) {
            unConfigureMessage.value = res.message;
          }
          energyRankingState.showChartNoData = true;
          energyRankingState.tableDataList = [];
          energyRankingState.showNoData = true;
        }
      } catch (error) {
        console.warn('查询能耗排名数据-----------------------', error);
        energyRankingState.showNoData = true;
        energyRankingState.showChartNoData = true;
        energyRankingState.tableDataList = [];
        proxy.$message.error('查询失败，网络不佳！');
      } finally {
        energyRankingState.loading = false;
      }
    };
    /**
     * 导出excel
     */
    const onRankingDataExport = async () => {
      if (energyRankingState.downloadLoading) {
        return;
      }
      energyRankingState.downloadLoading = true;
      await CommonService.getFileStreamDownload<EnergyRankingModule.EnergyRankingQueryParams>(
        energyRankingState.searchParams,
        url.downLoad.energyRankingExportUrl,
        '导出',
        () => {
          energyRankingState.downloadLoading = false;
        },
        () => {
          energyRankingState.downloadLoading = false;
        },
      );
    };
    // charts 鼠标移入
    const onChartMouseEver = (item: GlobalModule.CommonObject) => {
      if (item.componentType === 'yAxis') {
        console.log(item, '----');

        const { event, value } = item;
        energyRankingState.yaxisShowFlag = true;
        energyRankingState.yaxisText = value;
        energyRankingState.yPosition = {
          top: `${event.offsetY + 30}px`,
          left: `${event.offsetX}px`,
        };
      } else {
        energyRankingState.yaxisShowFlag = false;
      }
    };
    // 鼠标移出、
    const onChartMouseOut = () => {
      energyRankingState.yaxisShowFlag = false;
    };
    /**
     * 获取echarts option模块
     */
    const getEchartsOptionsModule = () => {
      /**
       * 获取后缀
       */
      const setArray = (index: number = 1) => {
        const suffixes = [];
        for (let idx = 0; idx < index; idx++) {
          suffixes.push({
            value: 0,
          });
        }
        return suffixes;
      };
      /**
       * 拼接数据源
       */
      const getSeriesData = (): any => {
        return energyRankingState.lineChartDataList.map((item, index) => {
          const { name, value } = item;
          const dataArr = setArray(index + 1);
          dataArr.pop();
          dataArr.push({
            value,
          });
          return {
            name: EchartsConfig.echartsUtils.resetName(index + 1, name),
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series',
            },
            data: dataArr,
          };
        });
      };
      /**
       * 处理y
       */
      const getYData = () => {
        return energyRankingState.lineChartDataList.map((item, index) => {
          const { name } = item;
          return EchartsConfig.echartsUtils.resetName(index + 1, name);
        });
      };
      // 获取柱状图 图例
      const getBarLegendData = () => {
        return energyRankingState.lineChartDataList?.length
          ? energyRankingState.lineChartDataList
              .map((item, index) => {
                return {
                  name: EchartsConfig.echartsUtils.resetName(index + 1, item.name),
                };
              })
              .reverse()
          : [];
      };
      // 获取柱状图配置
      const getEnergyAnalysisEchartsOption = () => {
        const colorArr = EchartsConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR.slice(
          0,
          energyRankingState.lineChartDataList.length,
        ).reverse();
        if (energyRankingState.isReverse) {
          colorArr.reverse();
        }
        const option: EChartsOption = {
          color: colorArr,
          // 悬浮框
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
            },
            backgroundColor: EchartsConfig.themeConstant[theme.value].CHARTS_TOOLTIP_BG_COLOR,
            borderWidth: 0,
            borderColor: EchartsConfig.themeConstant[theme.value].CHARTS_TOOLTIP_BG_COLOR,
            padding: [10, 20],
            textStyle: {
              color: EchartsConfig.themeConstant[theme.value].CHARTS_TOOLTIP_TEXT_COLOR,
              align: 'left',
            },
            formatter: (params: any) => {
              return `${params[0].axisValue}<br/>${energyRankingState.energyType}能耗：${
                thousandSeparation(params[0].data.value) ?? '--'
              }${(params[0].data.value ?? '--') !== '--' ? '' : energyRankingState.unit}`;
            },
          },
          legend: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_LEGEND_OPTION, {
            bottom: 10,
            type: 'scroll',
            formatter: EchartsConfig.echartsUtils.formatterText,
            tooltip: {
              show: true,
            },
            data: getBarLegendData(),
          }),
          grid: EchartsConfig.echartsOption(theme.value).ECHARTS_COMMON_GRID_OPTION,
          xAxis: EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_AXIS_VALUE_OPTION,
          yAxis: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_AXIS_CATEGORY_OPTION, {
            name: '能耗 ' + ' (' + energyRankingState.unit + ')',
            data: getYData(),
            axisLabel: {
              show: true,
              fontSize: 14,
              color: 'rgba(0, 0, 0, 0.65)',
              formatter: EchartsConfig.echartsUtils.formatterText,
              tooltip: {
                show: true,
              },
            },
            triggerEvent: true,
          }),
          series: getSeriesData(),
        };
        console.log('option-----------', option);
        return option;
      };
      // 获取饼图配置
      const getPieEchartsOption = () => {
        const colorArr = EchartsConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR.slice(
          0,
          energyRankingState.lineChartDataList.length,
        );
        const fontColor = EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR;
        const option: EChartsOption = {
          color: colorArr,
          tooltip: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_TOOLTIP_OPTION, {
            borderWidth: 0,
            formatter: (params: any) => {
              return `<div>${params.name}</div><div>${energyRankingState.energyType}：${
                thousandSeparation(params.data.value) ?? '--'
              } ${(params.data.value ?? '--') !== '--' ? energyRankingState.unit : ''}</div>`;
            },
          }),
          legend: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_LEGEND_OPTION, {
            orient: 'vertical',
            top: 'middle',
            right: '8%',
            type: 'scroll',
            itemGap: 12,
            itemWidth: 20,
            itemHeight: 8,
            textStyle: {
              color: 'rgba(0, 0, 0, 0.65)',
              fontSize: 14,
              lineHeight: 22,
              height: 22,
            },
            pageIconSize: 14,
            // 处理图例过长
            formatter: (name: any) => {
              return format.truncateText(name, 196, '14px Microsoft Yahei', '…', {});
            },
            tooltip: {
              show: true,
              backgroundColor: EchartsConfig.echartsConstant.CHARTS_TOOLTIP_BG_COLOR,
              textStyle: {
                color: '#fff',
                fontSize: EchartsConfig.echartsConstant.CHARTS_FONT_SIZE_14,
              },
              padding: [8, 8],
              formatter: '{a}',
            },
          }),
          series: [
            {
              name: '能耗排名',
              type: 'pie',
              radius: ['40%', '60%'],
              center: ['30%', '55%'],
              left: '3%',
              labelLine: {
                length: 10,
                length2: 40,
              },
              label: {
                formatter: (params: any) => {
                  return params.data && params.data.percent && params.data.percent !== 0
                    ? params.data.percent + '%'
                    : '0%';
                },
                borderWidth: 20,
                borderRadius: 4,
                align: 'center',
                padding: [0, -40],
                rich: {
                  a: {
                    color: fontColor,
                    fontSize: EchartsConfig.echartsConstant.CHARTS_FONT_SIZE_14,
                    lineHeight: 20,
                  },
                  b: {
                    color: fontColor,
                    fontSize: EchartsConfig.echartsConstant.CHARTS_FONT_SIZE_14,
                    lineHeight: 20,
                  },
                },
              },
              data: getPieSeriesData(),
              emphasis: {
                itemStyle: {
                  borderWidth: 20,
                },
              },
            },
          ],
        };
        return option;
      };
      /**
       * 处理数据源
       */
      const getPieSeriesData = () => {
        let dataList: EnergyRankingModule.PieChartDataList[] = cloneDeep(energyRankingState.pieChartDataList);
        dataList = dataList.sort((a, b) => {
          return a.value - b.value;
        });
        return energyRankingState.pieChartDataList && energyRankingState.pieChartDataList.length
          ? energyRankingState.pieChartDataList.map((item: EnergyRankingModule.PieChartDataList, index) => {
              const name = item.name;
              const value = item.value;
              const percent = item.percent;
              return {
                name: EchartsConfig.echartsUtils.resetName(index + 1, name),
                value,
                percent,
                avoidLabelOverlap: false,
              };
            })
          : [];
      };

      return { getEnergyAnalysisEchartsOption, getPieEchartsOption };
    };

    const { getEnergyAnalysisEchartsOption, getPieEchartsOption } = getEchartsOptionsModule();
    return {
      unConfigureMessage,
      ...toRefs(energyRankingState),
      switchSortIcons,
      formatEmptyValue,
      thousandSeparation,
      switchIconChange,
      onQueryRankingData,
      onRankingDataExport,
      getEnergyAnalysisEchartsOption,
      getPieEchartsOption,
      onScroll,
      onChartMouseEver,
      onChartMouseOut,
      onError,
    };
  },
});
