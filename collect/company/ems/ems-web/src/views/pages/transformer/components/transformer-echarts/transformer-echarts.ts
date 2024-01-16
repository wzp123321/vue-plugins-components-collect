import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  PropType,
  toRefs,
  watch,
  nextTick
} from 'vue';
import { init } from 'echarts';
import { addMinutes, addHours } from 'date-fns';
import {
  formatDate,
  throttle,
  debounce,
  thousandSeparation,
} from '@/utils/index';
import transformerHistogram from '@/assets/img/transformer/transformer-histogram.svg';
import transformerHistogramSelected from '@/assets/img/transformer/transformer-histogram-selected.svg';
import transformerTable from '@/assets/img/transformer/transformer-table.svg';
import transformerTableSelected from '@/assets/img/transformer/transformer-table-selected.svg';
import { useCommonController } from '@/utils/use-common-controller';
import DataNone from '../transformer-data-none/transformer-data-none.vue';
import EchartsConfig from '@/config/echarts/index';
import { useStore } from 'vuex';
import { echartsUtils } from '@/config/echarts/utils';
export default defineComponent({
  name: 'transformerEcharts',
  components: {
    DataNone,
  },
  props: {
    // 模块所需的所有数据集合
    echartData: {
      type: Object as PropType<
        HttpRequestModule.ResTemplate<TransformerModule.EchartAndTableData>
      >,
      default: {},
    },
    // 公共参数
    paramData: {
      type: Array as PropType<TransformerModule.ParamInfo[]>,
      default: [],
    },
    buttonValue: {
      type: String,
      default: '导出',
    },
  },
  setup(props) {
    const { emitter } = useCommonController();
    const { paramData, buttonValue } = toRefs(props);
    const isDataNone = ref(false);
    const tips = ref('');
    const INIT_RIGHT_DIS = 60;
    const YAXIS_OFFET = 65;
    const store = useStore();
    /**
     * 解析echartData,获取图表所需的各种数据
     */
    const mainColor = EchartsConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR;
    let rightDistance: string | number; // 图标距离右侧的距离
    let legendData: string[] = [];
    let xAxisData: number[] = [];
    let yAxisData: any[] = [];
    let yAxisDataOld: any[] = [];
    let seriesData: any[] = [];
    let currentSelectedLegend: any = {};
    /**
     * 生成能效分析表格数据
     */
    const tableHeader = ref<string[]>([]);
    const tableContent = ref<any[]>([]);
    let timeUnit = '10m';
    watch(
      () => props.echartData,
      newV => {
        legendData = [];
        seriesData = [];
        xAxisData = [];
        yAxisData = [];
        currentSelectedLegend = {};
        tableHeader.value = [];
        tableContent.value = [];
        if (newV && newV.code) {
          if (newV.code === 200 && newV.data) {
            isDataNone.value = false;
            legendData = resetLegendData(newV.data.chartsDataVO?.legendList);
            xAxisData = newV.data.chartsDataVO?.timestamp;
            seriesData = resetSeries(newV.data.chartsDataVO?.seriesData);
            yAxisDataOld = newV.data.chartsDataVO?.yaxisData;
            yAxisData = resetYAxis(newV.data.chartsDataVO?.yaxisData);
            rightDistance =
              legendData.length >= 3
                ? YAXIS_OFFET * (legendData.length - 1)
                : INIT_RIGHT_DIS;
            echartsInit();
            tableHeader.value = newV.data.tableDataVO?.colName;
            tableContent.value = newV.data.tableDataVO?.tableData;
          } else if (newV.message !== '') {
            isDataNone.value = true;
            tips.value = newV.message;
          }
        }
      },
    );
    watch(
      () => props.paramData,
      newV => {
        paramsValue.value = newV[0]?.paramId;
      },
    );
    /**
     * 处理图列数据
     * @param ldata 时间颗粒度
     */
    const resetLegendData = (ldata: string[]) => {
      const res: any = [];
      if (ldata.length > 0) {
        ldata.forEach((item, index) => {
          const temp = {
            name: echartsUtils.resetName(index + 1, item),
            textStyle: {
              color: mainColor[index],
            },
          };
          res.push(temp);
        });
      }
      return res;
    };
    /**
     * 处理y轴数据
     * @param ydata y轴传入数据
     */
    const resetYAxis = (ydata: any, selectedLegends?: any, series?: any) => {
      const data: any = [];
      let negativeLegendsNum = 0;
      for (let i = 0; i < ydata.length; i++) {
        const arrItem = {
          type: 'value',
          name: ydata[i].unit,
          nameLocation: 'start',
          nameGap: 0,
          nameTextStyle: {
            color: mainColor[i],
            fontSize: EchartsConfig.echartsConstant.CHARTS_FONT_SIZE_14,
            padding: i === 0 ? [9, 50, 0, 0] : [9, 0, 0, 45],
          },
          position: i === 0 ? 'left' : 'right',
          offset: i === 0 ? 0 : YAXIS_OFFET * (i - 1 - negativeLegendsNum),
          axisLine: {
            show: true,
            lineStyle: {
              color: mainColor[i],
            },
          },
          axisTick: {
            show: true,
          },
          axisLabel: {
            fontSize: EchartsConfig.echartsConstant.CHARTS_FONT_SIZE_14,
            formatter: (value: any) => {
              return echartsUtils.formatter(value);
            },
          },
          show: true,
        };
        if (
          selectedLegends &&
          i !== 0 &&
          selectedLegends[series[i].name] === false
        ) {
          negativeLegendsNum++;
          arrItem.show = false;
          arrItem.offset = 0;
        }
        data.push(arrItem);
      }
      return data;
    };
    /**
     * 处理数据集合
     * @param params 数据集合
     */
    const resetSeries = (params: any) => {
      const arrData: any = [];
      params.forEach((item: any, i: any) => {
        const arrItem = {
          name: echartsUtils.resetName(i + 1, item.paramName),
          type: 'line',
          symbol: 'circle',
          symbolSize: 16,
          showSymbol: true,
          yAxisIndex: i,
          xAxisIndex: 0,
          emphasis: {
            itemStyle: EchartsConfig.echartsUtils.getsymbolStyle(mainColor[i]),
          },
          itemStyle: {
            normal: {
              color: mainColor[i],
            },
          },
          smooth: true,
          data: EchartsConfig.echartsUtils.getDataIsShowDot(
            item.values,
            mainColor[i],
          ),
        };
        arrData.push(arrItem);
      });
      return arrData;
    };
    /**
     * 图表图例点击事件
     * @param item 图例对象
     */
    const onChartLegendSelectChanged = (item: any) => {
      currentSelectedLegend = item.selected;
      yAxisData = resetYAxis(yAxisDataOld, currentSelectedLegend, seriesData);
      let count = 0;
      for (const legend in currentSelectedLegend) {
        if (currentSelectedLegend[legend]) {
          if (seriesData[0].name !== legend) {
            count++;
          }
        }
      }
      if (count > 0) {
        rightDistance = count * YAXIS_OFFET;
      } else {
        rightDistance = INIT_RIGHT_DIS;
      }
      echartsInit();
    };
    /**
     * 生成能效分析折线图表
     */
    let myChart: any = null;
    // 动态生成id
    const echartsContainerId: string =
      'charts_' + (Math.random() * 1000).toFixed(0);
    const isShowEchart = ref(true);
    const isLoading = ref(false);
    let echartOption: any;
    const echartsInit = () => {
      const chartDom = document.getElementById(
        echartsContainerId,
      ) as HTMLElement;
      myChart = init(chartDom);
      myChart.off('legendselectchanged');
      myChart.on('legendselectchanged', (params: any) => {
        onChartLegendSelectChanged(params);
      });
      echartOption = {
        grid: {
          left: INIT_RIGHT_DIS,
          right: rightDistance,
          bottom: 20,
          containLabel: false,
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(24,144,255,0.8)',
          textStyle: {
            color: '#fff',
          },
          formatter(params: any) {
            let result = '';
            if (params?.length) {
              const nowtime = Number(params[0].axisValue);
              const dateTitle = getDateTitle(nowtime);
              result = `<div>${dateTitle}</div>`;
              params.forEach((item: any) => {
                result += `<div><span style="height:8px;width:8px;display:inline-block;margin-right: 8px;border:1px solid #fff;background-color:
                  ${mainColor[item.seriesIndex]};"></span>${item.seriesName}：${
                  Object.prototype.toString.call(item.value) === '[object Null]'
                    ? '--'
                    : thousandSeparation(Number(item.value)) +
                      yAxisDataOld?.[item.seriesIndex]?.unit
                }</div>`;
              });
            }
            return result;
          },
          ...EchartsConfig.echartsOption(store.getters.theme)
            .ECHARTS_LINECHART_TOOLTIP_OPTION,
        },
        legend: {
          type: 'scroll',
          top: 5,
          itemWidth: 20,
          itemHeight: 2,
          itemGap: 24,
          textStyle: {
            fontSize: 14,
          },
          pageIconColor: '#1890ff',
          pageIconInactiveColor: '#d8d8d8',
          pageTextStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
          },
          show: true,
          selected: currentSelectedLegend,
          data: legendData,
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            formatter: getXaxisDataFormatter,
          },
        },
        yAxis: yAxisData,
        // dataZoom: [
        //   {
        //     type: 'slider',
        //     xAxisIndex: [0],
        //     start: 0,
        //     end: 100,
        //     showDataShadow: false,
        //   },
        //   {
        //     type: 'inside',
        //     xAxisIndex: [0],
        //     start: 0,
        //     end: 100,
        //     showDataShadow: false,
        //   },
        // ],
        series: seriesData,
      };
      try {
        if (myChart !== null) {
          myChart.clear();
          myChart.setOption(echartOption, true);
        }
        nextTick(() => {
          if (myChart?.resize) {
            myChart.resize();
          }
        });
      } catch (error) {
        console.log('error=', error);
      } finally {
        isLoading.value = false;
      }
    };
    /**
     * 获取x轴数据
     * 10m ： 每天0点就是MM.dd 后面HH:mm
     * 1h： 每天0点就是MM.dd 后面HH:00
     * 1d： MM.dd
     * 1M： yyyy.MM
     * 1y： yyyy
     * @param value
     * @returns
     */
    const getXaxisDataFormatter = (value: string) => {
      if (!value) {
        return '';
      }
      const time = Number(value);
      let dateStr = ''; // 如果是10m
      switch (timeUnit) {
        case '10m':
        case '1h':
          if (formatDate(time, 'HH:mm') === '00:00') {
            dateStr = `${new Date(time).getMonth() + 1}.${new Date(
              time,
            ).getDate()}`;
          } else {
            dateStr =
              timeUnit === '10m'
                ? formatDate(new Date(time), 'HH:mm')
                : formatDate(new Date(time), 'HH') + ':00';
          }
          break;
        case '1d':
          dateStr = `${new Date(time).getMonth() + 1}.${new Date(
            time,
          ).getDate()}`;
          break;
        case '1M':
          dateStr = `${formatDate(new Date(time), 'yyyy')}.${new Date(
            time,
          ).getMonth() + 1}`;
          break;
        case '1y':
          dateStr = `${new Date(time).getFullYear()}`;
          break;
        default:
          dateStr = '';
          break;
      }
      return dateStr;
    };
    /**
     * 根据颗粒度生成字符串
     * @param nowtime 时间戳
     */
    const getDateTitle = (nowtime: number) => {
      if (!nowtime) {
        return '';
      }
      let dateTitle = '';
      switch (timeUnit) {
        case '10m':
          dateTitle =
            formatDate(nowtime, 'yyyy-MM-dd HH:mm') +
            '~' +
            formatDate(addMinutes(nowtime, 10), 'HH:mm');
          break;
        case '1h':
          dateTitle =
            formatDate(nowtime, 'yyyy-MM-dd HH:mm') +
            '~' +
            formatDate(addHours(nowtime, 1), 'HH:mm');
          break;
        case '1d':
          dateTitle = formatDate(nowtime, 'yyyy-MM-dd');
          break;
        case '1M':
          dateTitle = formatDate(nowtime, 'yyyy-MM');
          break;
        case '1y':
          dateTitle = formatDate(nowtime, 'yyyy');
          break;
        default:
          dateTitle =
            formatDate(nowtime, 'yyyy-MM-dd HH:mm') +
            '~' +
            formatDate(addMinutes(nowtime, 10), 'HH:mm');
          break;
      }
      return dateTitle;
    };
    /**
     * 切换echart图表和表格数据
     */
    const switchSelectIcon = ref<string | number>('1');
    const switchItemsIcon = [
      {
        code: '1',
        imgs: [
          transformerHistogramSelected,
          transformerHistogram,
          transformerHistogram,
        ],
      },
      {
        code: '2',
        imgs: [transformerTableSelected, transformerTable, transformerTable],
      },
    ];
    const switchChangeIcon = (data: any) => {
      if (data === '1') {
        isShowEchart.value = true;
        nextTick(() => {
          if (myChart?.resize) {
            myChart.resize();
          }
        });
      } else {
        isShowEchart.value = false;
      }
    };
    const paramsValue = ref();
    const changeParams = (val: number) => {
      emitter.emit('change-params', val);
    };
    /**
     * 导出表格
     */
    const exportExcel = async () => {
      debounce(() => {
        emitter.emit('transformer-export');
      }, 200);
    };
    const isSingleParam = ref(false);
    onMounted(() => {
      window.addEventListener('resize', () => {
        if (myChart?.resize) {
          throttle(myChart.resize(), 150);
        }
      });
      emitter.on('start-query', (data: any) => {
        isLoading.value = true;
        if (data?.energyEfficiencySelected.length > 1) {
          isSingleParam.value = false;
        } else {
          isSingleParam.value = true;
        }
        switchSelectIcon.value = '1';
        isShowEchart.value = true;
        timeUnit = data.timeUnit;
      });
      // 监听获取公共参数失败，并展示空白页
      emitter.on('no-common-param', (data: any) => {
        isLoading.value = false;
        isDataNone.value = true;
        tips.value = data;
      });
    });
    const isNotNull = (val: any) => {
      if (val === null || val === undefined || val === '') {
        return '--';
      } else {
        return val;
      }
    };
    const processThousandth = (val: any, index: any) => {
      if (isNaN(val)) {
        return val;
      } else {
        if (index === 1) {
          return val;
        } else {
          return thousandSeparation(Number(val));
        }
      }
    };
    // 组件卸载
    onUnmounted(() => {
      window.removeEventListener('resize', () => {
        if (myChart?.resize) {
          throttle(myChart.resize(), 150);
        }
      });
      emitter.off('no-common-param');
    });
    return {
      isDataNone,
      tips,
      echartsContainerId,
      isShowEchart,
      switchSelectIcon,
      switchItemsIcon,
      switchChangeIcon,
      paramsValue,
      paramData,
      buttonValue,
      changeParams,
      isSingleParam,
      exportExcel,
      tableHeader,
      tableContent,
      isNotNull,
      isLoading,
      processThousandth,
    };
  },
});
