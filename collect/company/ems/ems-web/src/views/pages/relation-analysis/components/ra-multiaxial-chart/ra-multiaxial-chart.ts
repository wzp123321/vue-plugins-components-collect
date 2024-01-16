import { defineComponent, ref, PropType, toRefs, onMounted, computed, reactive, watch, onUnmounted } from 'vue';
import EchartsConfig from '@/config/echarts/index';
import { format } from 'date-fns';
import { init, EChartsOption } from 'echarts';
import { useStore } from 'vuex';
import { useCommonController } from '@/utils/use-common-controller';
import { throttle, thousandSeparation } from '@/utils/index';
export interface SeriesItem {
  data: [];
  name: string;
  type: string;
  yaxis: 0;
  markPoint?: MarkPointItem[];
}
export interface MarkPointItem {
  time: string;
  xAxis: number | null;
  yaxis: number | null;
}
export interface YaxisItemList {
  title: string;
  unit: string;
}
export type RAChartResetData = {
  rightDistance?: number | null;
  selectedLegend: any[] | null;
};
export interface MarkPoint {
  markUpImg: string;
  markDownImg: string;
  markUpTime: string;
  markDownTime: string;
  markName: string;
  markColor: string;
}
export default defineComponent({
  name: 'RaMultiaxialChart',
  props: {
    seriesData: {
      // 数据源
      type: Array,
      default: Array as PropType<SeriesItem[]>,
    },
    unit: {
      // 颗粒度
      type: String,
      default: null,
    },
    xAxisTime: {
      // x轴数据
      type: Array as PropType<string[]>,
      default: [],
    },
    yAxisItems: {
      // y轴标题和单位集合
      type: Array as PropType<YaxisItemList[]>,
      default: [],
    },
  },
  setup(props) {
    const store = useStore();
    const { emitter } = useCommonController();
    let myChart = ref<any>(null);
    // 生成的随机id
    const echartsContainerId: string = 'charts_' + (Math.random() * 1000).toFixed(0);
    // 主题
    const theme = computed(() => {
      return store.getters.theme || 'light';
    });
    // 选中图列和右边距状态
    let resetData = reactive<RAChartResetData>({
      rightDistance: null,
      selectedLegend: null,
    });
    const markIndex = ref<any>(1); // 当前打点线
    const defaultLineIndex = ref(1); // 默认折线
    const currentLineIndex = ref(1); // 当前折线index
    const currentSelectedLegend = ref(null); // 已选图例
    const mainColor = EchartsConfig.echartsConstant.CHARTS_MULTIPLE_MAIN_COLOR; // 色卡
    const configArrowState = reactive<MarkPoint>({
      markUpImg: '', // 最大值打点图片
      markDownImg: '', // 最小值打点图片
      markUpTime: '', // 当前最大值打点时间
      markDownTime: '', // 当前最小值打点时间
      markName: '', // 当前打点对象名
      markColor: mainColor[1], // 当前颜色
    });

    /**
     * 初始化
     */
    const initEcharts = () => {
      const chartDom: HTMLElement | null = document.getElementById(echartsContainerId);
      if (!chartDom) {
        return;
      }
      const option = getEchartsOption();
      myChart = init(chartDom) as any;
      if (!option) {
        throw new Error('获取echarts配置错误！');
      }
      (myChart as any).clear(); // 清空绘画内容，清空后实例可用
      (myChart as any).setOption(option);
    };
    // 获取数据源
    const chartSeriesData = computed(() => {
      return props.seriesData;
    });
    /**
     * 监听数据源变化
     */
    watch(chartSeriesData, () => {
      currentLineIndex.value = defaultLineIndex.value;
      markIndex.value = defaultLineIndex.value;
      configArrowState.markColor = mainColor[markIndex.value];
      resetData = {
        rightDistance: null,
        selectedLegend: null,
      };
      initEcharts();
      setMarkPoint(props.seriesData, props.xAxisTime, 1); // 初始化打点
    });
    /**
     * 图表图例点击事件
     * @param item 图例对象
     */
    const onChartLegendSelectChanged = (item: any) => {
      currentSelectedLegend.value = item.selected;
      const optionData = adaptChartData();
      resetData.selectedLegend = item.selected;
      resetData.rightDistance = getDynamicRightDistance(optionData.seriesData, item.selected, []);

      const { seriesData, legendData, xAxisData } = optionData;
      if (legendData[currentLineIndex.value - 1] === item.name) {
        if (item.selected[item.name] === false) {
          markIndex.value = null;
          initEcharts();
          setMarkPoint(seriesData, xAxisData, null);
        } else {
          markIndex.value = currentLineIndex.value;
          initEcharts();
          setMarkPoint(seriesData, xAxisData, currentLineIndex.value);
        }
      } else {
        if (item.selected[legendData[currentLineIndex.value - 1]] === true) {
          markIndex.value = currentLineIndex.value;
          initEcharts();
          setMarkPoint(seriesData, xAxisData, currentLineIndex.value);
        } else {
          markIndex.value = null;
          initEcharts();
          setMarkPoint(seriesData, xAxisData, null);
        }
      }
    };
    /**
     * 折线点击事件
     *  @param item 折线对象
     */
    const onChartClick = (item: any) => {
      const { seriesData, xAxisData } = adaptChartData();
      resetMarkPoint(currentSelectedLegend.value, item, seriesData, xAxisData);
    };
    /**
     * 重置打点
     */
    const resetMarkPoint = (selectedLegend: any, param: any, seriesData: any, xAxisData: any) => {
      if (param.seriesType === 'line') {
        if (currentLineIndex.value !== param.seriesIndex) {
          currentLineIndex.value = param.seriesIndex;
          markIndex.value = currentLineIndex.value;
          resetData.rightDistance = null;
          resetData.selectedLegend = selectedLegend;
          setMarkPoint(seriesData, xAxisData, currentLineIndex.value);
          initEcharts();
        }
      }
    };
    /**
     * 设置打点底部文案说明
     * @param optionData 数据源
     * @param markIndex 当前打点下标
     */
    const setMarkPoint = (optionData: any, xAxisData: any, markIndex: any) => {
      if (typeof markIndex !== 'number') {
        configArrowState.markDownImg = '';
        configArrowState.markUpImg = '';
        configArrowState.markUpTime = '';
        configArrowState.markDownTime = '';
        return;
      }
      const seriesData = optionData;
      const data = seriesData[markIndex];
      configArrowState.markName = data.name;
      configArrowState.markColor = mainColor[markIndex];
      const markIndexData =
        data && data.markPoint && data.markPoint.length && data.markPoint.length > 0 ? data.markPoint : null;
      if (markIndexData === null) {
        configArrowState.markDownImg = '';
        configArrowState.markUpImg = '';
        configArrowState.markUpTime = '';
        configArrowState.markDownTime = '';
      } else {
        xAxisData.forEach((item: any, i: any) => {
          if (markIndexData[0].xAxis === i) {
            // 最大差值点
            if (markIndexData[1].xAxis === markIndexData[0].xAxis) {
              // 相同点
              configArrowState.markUpImg = require('@/assets/img/relation-analysis/ra-arrow-up-' + markIndex + '.png');
              configArrowState.markDownImg = require('@/assets/img/relation-analysis/ra-arrow-down-' +
                markIndex +
                '.png');
              configArrowState.markUpTime = markIndexData[0].time;
              configArrowState.markDownTime = markIndexData[1].time;
            } else {
              configArrowState.markUpImg = require('@/assets/img/relation-analysis/ra-arrow-up-' + markIndex + '.png');
              configArrowState.markUpTime = markIndexData[0].time;
            }
          } else if (markIndexData[1].xAxis === i) {
            // 最小差值点
            configArrowState.markDownImg = require('@/assets/img/relation-analysis/ra-arrow-down-' +
              markIndex +
              '.png');
            configArrowState.markDownTime = markIndexData[1].time;
          }
        });
      }
    };
    /**
     * 适配后端传入chart数据
     * @param optionData 表格数据
     */
    const adaptChartData = () => {
      const { seriesData, unit, xAxisTime, yAxisItems } = props;
      const optionData = {
        legendData: adaptLegendData(seriesData),
        xAxisData: adaptXAxisData(unit, xAxisTime),
        yAxisData: adaptYAxisData(yAxisItems),
        tooltipTimeData: createTooltipTime(unit, xAxisTime),
        seriesData,
        yAxisItems,
      };
      return optionData;
    };
    /**
     * 适配echart legend data
     * @param yAxisItems y轴数据
     */
    const adaptLegendData = (seriesData: any[]) => {
      if (!seriesData || seriesData.length < 2) {
        return [];
      }

      const legends = [];
      for (const item of seriesData.slice(1)) {
        legends.push(item.name);
      }

      return legends;
    };
    /**
     * 获取tooltip时间
     * @param timeUnit 时间颗粒度
     * @param xAxisItem 时间戳数据
     */
    const createTooltipTime = (timeUnit: string, xAxisItem: any[]) => {
      const tooltipTimeData = [];
      const dateFormatMap: any = {
        '10m': 'yyyy.MM.dd HH:mm',
        '1h': 'yyyy.MM.dd HH:mm',
        '1d': 'yyyy.MM.dd',
        '1M': 'yyyy.M',
        '1y': 'yyyy',
      };

      for (const item of xAxisItem) {
        tooltipTimeData.push(format(item, dateFormatMap[timeUnit]));
      }

      return tooltipTimeData;
    };
    /**
     * 适配y轴数据
     * @param yAxisItems y轴名称 单位
     */
    const adaptYAxisData = (yAxisItems: YaxisItemList[]) => {
      if (!yAxisItems || yAxisItems.length < 1) {
        return [];
      }

      const yAxisData = [];
      for (const item of yAxisItems) {
        yAxisData.push(item.unit);
      }

      return yAxisData;
    };
    /**
     * 适配X轴时间数据
     * @param timeUnit 时间颗粒度
     * @param xAxisItem x轴数据 时间戳
     */
    const adaptXAxisData = (timeUnit: string, xAxisItem: any[]) => {
      const xAxisData = [];
      const dateFormatMap: any = {
        '10m': 'HH:mm',
        '1h': 'HH:mm',
        '1d': 'M.d',
        '1M': 'yyyy.M',
        '1y': 'yyyy',
      };

      for (const item of xAxisItem) {
        xAxisData.push(format(item, dateFormatMap[timeUnit]));
      }
      return xAxisData;
    };
    /**
     * 计算图表左间距
     */
    const getGridLeftDistance = (seriesData: any[]) => {
      const GRID_LEFT_DISTANCE_WITH_BAR_DATA = 70;
      const GRID_LEFT_DISTANCE_WITHOUT_BAR_DATA = 110;
      if (
        !seriesData ||
        (seriesData && seriesData.length === 0) ||
        (seriesData && seriesData.length > 0 && !seriesData[0])
      ) {
        return GRID_LEFT_DISTANCE_WITHOUT_BAR_DATA;
      }

      const barDataStatus: any = seriesData && seriesData.length > 0 ? seriesData[0].data : [];
      // 当柱状图有正常数据时，则Y轴坐标可以正常展示，返回较小的Grid左间距
      for (const item of barDataStatus) {
        if (item || item === 0) {
          return GRID_LEFT_DISTANCE_WITH_BAR_DATA;
        }
      }

      return GRID_LEFT_DISTANCE_WITHOUT_BAR_DATA;
    };
    /**
     * 多轴间距算法
     */
    const getGridRightMarginBySeriesData = (seriesData: SeriesItem[]) => {
      const baseDistance = 40;
      const unitDistanceWithEmptyData = 65;
      let rightMargin = 0;
      for (const item of seriesData) {
        if (isEmptySeriesData(item.data)) {
          rightMargin += unitDistanceWithEmptyData;
        } else {
          rightMargin += baseDistance;
        }
      }

      return rightMargin;
    };
    /**
     * 计算图表右间距
     *  @param optionData 图表数据
     * @param selectedLegend 当前选中图例
     */
    const getDynamicRightDistance = (optionData: any, selectedLegend: any, legendData: any) => {
      const minDistance = 60;
      if (!selectedLegend) {
        return legendData.length <= 1 ? minDistance : getGridRightMarginBySeriesData(optionData.slice(1));
      }
      return getGridRightMarginBySelectedData(optionData.slice(1), selectedLegend);
    };
    /**
     * 计算选中图表右间距
     *  @param seriesData 图表数据
     * @param selectedLegend 当前选中图例
     */
    const getGridRightMarginBySelectedData = (seriesData: any, selectedLegend: any) => {
      const minDistance = 60;
      const baseDistance = 40;
      const unitDistanceWithEmptyData = 65;
      let rightMargin = 0;
      for (const legend in selectedLegend) {
        if (selectedLegend[legend]) {
          const itemData = seriesData.filter((item: any) => item.name === legend);
          const itemMargin = isEmptySeriesData(itemData && itemData.length > 0 ? itemData[0].data : null)
            ? unitDistanceWithEmptyData
            : baseDistance;
          rightMargin += itemMargin;
        }
      }

      return Math.max(minDistance, rightMargin);
    };
    /**
     * 判断数据是否全为null
     */
    const isEmptySeriesData = (data: any) => {
      if (!data) {
        return true;
      }
      for (const item of data) {
        if (item || item === 0) {
          return false;
        }
      }

      return true;
    };
    /**
     * 根据图例选择刷新图表
     * @param legendData 图例数据
     */
    const resetSelect = (legendData: any[]) => {
      const selectArr: any = {};
      legendData.forEach((item: any) => {
        selectArr[item.name] = true;
      });
      return selectArr;
    };
    /**
     * 处理图列数据
     * @param param plegendData （数据格式如：['温度', '湿度', '照度']）
     */
    const resetLegendData = (plegendData: any) => {
      const data: any[] = [];
      plegendData.forEach((item: any, i: any) => {
        const arrItem = {
          name: item,
          textStyle: {
            color: mainColor[i + 1],
          },
        };
        data.push(arrItem);
      });
      return data;
    };
    /**
     * 处理箭头打点
     * @param xData x轴数据源
     * @param markIndex 当前打点
     * @param markData 数据源
     */
    const resetArrowBg = (xData: any, markIndex: any, markData: any) => {
      const arr: any = [];
      if (markIndex === null) {
        configArrowState.markDownImg = '';
        configArrowState.markUpImg = '';
        configArrowState.markUpTime = '';
        configArrowState.markDownTime = '';
        xData.forEach(() => {
          const arrItem = {
            value: 22,
          };
          arr.push(arrItem);
        });
        return arr;
      }
      const data = markData[markIndex];
      const markIndexData =
        data && data.markPoint && data.markPoint.length && data.markPoint.length > 0 ? data.markPoint : null;
      if (markIndexData === null) {
        configArrowState.markDownImg = '';
        configArrowState.markUpImg = '';
        configArrowState.markUpTime = '';
        configArrowState.markDownTime = '';
        xData.forEach(() => {
          const arrItem = {
            value: '11',
          };
          arr.push(arrItem);
        });
        return arr;
      }
      xData.forEach((item: any, i: any) => {
        let arrItem = {};
        if (markIndexData[0].xaxis === i) {
          // 最大差值点
          if (markIndexData[1].xaxis === markIndexData[0].xaxis) {
            // 相同点
            configArrowState.markUpImg = require('@/assets/img/relation-analysis/ra-arrow-up-' + markIndex + '.png');
            configArrowState.markDownImg = require('@/assets/img/relation-analysis/ra-arrow-down-' +
              markIndex +
              '.png');
            configArrowState.markUpTime = markIndexData[0].time;
            configArrowState.markDownTime = markIndexData[1].time;
            arrItem = {
              value: '1111',
              textStyle: {
                backgroundColor: {
                  image: require('@/assets/img/relation-analysis/ra-same-' + markIndex + '.png'),
                },
              },
            };
          } else {
            configArrowState.markUpImg = require('@/assets/img/relation-analysis/ra-arrow-up-' + markIndex + '.png');
            configArrowState.markUpTime = markIndexData[0].time;
            arrItem = {
              value: '11',
              textStyle: {
                backgroundColor: {
                  image: configArrowState.markUpImg,
                },
              },
            };
          }
        } else if (markIndexData[1].xaxis === i) {
          // 最小差值点
          configArrowState.markDownImg = require('@/assets/img/relation-analysis/ra-arrow-down-' + markIndex + '.png');
          configArrowState.markDownTime = markIndexData[1].time;
          arrItem = {
            value: '11',
            textStyle: {
              backgroundColor: {
                image: configArrowState.markDownImg,
              },
            },
          };
        } else {
          arrItem = {
            value: '11',
          };
        }
        arr.push(arrItem);
      });
      return arr;
    };
    /**
     * 处理x轴数据
     * @param xData x轴数据源
     * @param markIndex 当前打点
     * @param markData 数据源
     */
    const resetxAxis = (xData: any, markIndex: any, markData: any) => {
      const arr: any = [];
      if (markIndex === null) {
        xData.forEach((item: any) => {
          const arrItem = {
            value: item,
          };
          arr.push(arrItem);
        });
        return arr;
      }
      const data = markData[markIndex];
      const markIndexData =
        data && data.markPoint && data.markPoint.length && data.markPoint.length > 0 ? data.markPoint : null;
      if (markIndexData === null) {
        xData.forEach((item: any) => {
          const arrItem = {
            value: item,
          };
          arr.push(arrItem);
        });
        return arr;
      }
      xData.forEach((item: any, i: any) => {
        let arrItem = {};
        if (markIndexData[0].xAxis === i || markIndexData[1].xAxis === i) {
          arrItem = {
            value: item,
            textStyle: {
              color: mainColor[markIndex],
            },
          };
        } else {
          arrItem = {
            value: item,
          };
        }
        arr.push(arrItem);
      });
      return arr;
    };
    /**
     * 处理y轴数据
     * @param param pdata y轴传入数据 （数据格式如： ['能耗值 kwh', '°C', '%rh', 'lux']）
     */
    const resetYAxis = (pdata: any, selectedLegends: any, seriesData: any) => {
      const data: any = [];
      let negativeLegendsNum = 0;
      for (let i = 0; i < pdata.length; i++) {
        const arrItem = {
          type: 'value',
          name: i === 0 ? `能耗${pdata[i]}` : pdata[i],
          nameLocation: 'start',
          nameTextStyle: {
            color: mainColor[i],
            fontSize: EchartsConfig.echartsConstant.CHARTS_FONT_SIZE_14,
            padding: i === 0 ? [9, 100, 0, 0] : [9, 0, 0, 45],
          },
          position: i === 0 ? 'left' : 'right',
          offset: i === 0 ? 0 : 65 * (i - 1 - negativeLegendsNum),
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
          },
          splitLine: {
            // 去除网格线
            show: i === 0,
          },
          show: true,
        };

        if (selectedLegends && i !== 0 && selectedLegends[seriesData[i].name] === false) {
          negativeLegendsNum++;
          arrItem.show = false;
          arrItem.offset = 0;
        }

        data.push(arrItem);
      }
      return data;
    };
    /**
     * 处理柱状图数据
     * @param chartData 数据
     */
    const adaptSeriesData = (chartData: any) => {
      const originData = chartData;
      const data = [];
      for (let i = 0; i < originData.length; i++) {
        const arrItem = {
          value: originData[i],
          itemStyle: {
            barBorderRadius: originData[i] >= 0 ? [30, 30, 0, 0] : [0, 0, 30, 30],
          },
        };
        data.push(arrItem);
      }
      return data;
    };
    /**
     * 处理数据集合
     * @param param params 数据集合
     * （数据格式如： [{name: '能耗值',data: [121, 114, 124, 148, 211, 438, 314, 338, 223, 318, 328, 218]}]）
     * @param param markPoint 打点数据 (数据格式如：[{time: '2020-03-17 06:00', xaxis: 2, yaxis: 1.8}])
     */
    const resetSeries = (params: any, markIndex?: number) => {
      console.log(markIndex);
      const arrData: any = [];
      params.forEach((item: any, i: any) => {
        let arrItem: any;
        if (item.type === 'bar') {
          arrItem = {
            name: item.name,
            type: item.type,
            barWidth: '',
            barMaxWidth: '14px',
            yAxisIndex: 0,
            xAxisIndex: 1,
            itemStyle: {
              normal: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 1,
                      color: '#9DD2FF', // 0% 处的颜色
                    },
                    {
                      offset: 0,
                      color: '#2899FF', // 100% 处的颜色
                    },
                  ],
                  global: false, // 缺省为 false
                },
                barBorderRadius: [30, 30, 0, 0],
                shadowBlur: 0,
              },
            },
            data: adaptSeriesData(item.data),
          };
        } else {
          arrItem = {
            name: item.name,
            type: item.type,
            symbol: 'circle',
            symbolSize: 15,
            showSymbol: true,
            yAxisIndex: i,
            xAxisIndex: 1,
            itemStyle: {
              normal: {
                color: mainColor[i],
              },
              emphasis: {
                color: {
                  type: 'radial',
                  x: 0.5,
                  y: 0.5,
                  r: 0.5,
                  colorStops: [
                    {
                      offset: 0,
                      color: '#FFFFFF',
                    },
                    {
                      offset: 0.2,
                      color: '#FFFFFF',
                    },
                    {
                      offset: 0.3,
                      color: '#FFFFFF',
                    },
                    {
                      offset: 0.4,
                      color: mainColor[i],
                    },
                    {
                      offset: 0.5,
                      color: mainColor[i],
                    },
                    {
                      offset: 1,
                      color: mainColor[i],
                    },
                  ],
                  globalCoord: false, // 缺省为 false
                },
                borderColor: {
                  type: 'radial',
                  x: 0.5,
                  y: 0.5,
                  r: 0.5,
                  colorStops: [
                    {
                      offset: 0,
                      color: '#FFFFFF',
                    },
                    {
                      offset: 0.8,
                      color: '#FFFFFF',
                    },
                    {
                      offset: 1,
                      color: mainColor[i],
                    },
                  ],
                  globalCoord: false, // 缺省为 false
                },
                borderWidth: 5,
              },
            },
            smooth: true,
            data: getDataIsShowDot(item.data, mainColor[i]),
          };
        }
        arrData.push(arrItem);
      });
      return arrData;
    };
    const getDataIsShowDot = (data: any, color: any) => {
      if (data && data.length && data.length > 0) {
        let arrItem = {};
        const arrData: any[] = [];
        data.forEach((item: any, index: any) => {
          if (index === 0 && item !== null && ((data.length > 1 && data[1] === null) || data.length === 1)) {
            arrItem = {
              value: item,
              itemStyle: {
                color,
              },
            };
            arrData.push(arrItem);
          } else if (item !== null && data.length > 1 && index === data.length - 1 && data[data.length - 2] === null) {
            arrItem = {
              value: item,
              itemStyle: {
                color,
              },
            };
            arrData.push(arrItem);
          } else if (item !== null && index > 0 && data[index - 1] === null && data[index + 1] === null) {
            arrItem = {
              value: item,
              itemStyle: {
                color,
              },
            };
            arrData.push(arrItem);
          } else {
            arrItem = {
              value: item,
              itemStyle: {
                color: 'transparent',
              },
            };
            arrData.push(arrItem);
          }
        });
        return arrData;
      } else {
        return data;
      }
    };
    /**
     * 获取图表option
     */
    const getEchartsOption = () => {
      const fontColor = EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR;
      const { selectedLegend } = resetData;
      const { legendData, xAxisData, yAxisData, tooltipTimeData, seriesData } = adaptChartData();
      let isMarkPoint = false;
      const nowData: any = markIndex.value ? seriesData[markIndex.value] : null;
      if (markIndex.value && nowData && nowData.markPoint && nowData.markPoint.length && nowData.markPoint.length > 0) {
        isMarkPoint = true;
      }
      const option: EChartsOption = {
        grid: {
          top: 85,
          bottom: isMarkPoint ? 50 : 10,
          right: getDynamicRightDistance(props.seriesData, selectedLegend, legendData),
          left: getGridLeftDistance(props.seriesData),
          containLabel: true,
        },
        legend: {
          icon: 'rect',
          top: 20,
          itemWidth: 20,
          itemHeight: 2,
          textStyle: {
            fontSize: EchartsConfig.echartsConstant.CHARTS_FONT_SIZE_14,
          },
          selected: selectedLegend ? selectedLegend : resetSelect(legendData),
          data: resetLegendData(legendData),
        },
        tooltip: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_TOOLTIP_OPTION, {
          extraCssText:
            'color:#fff;text-align:left;box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15);border-radius:4px;z-index:99;',
          formatter: (params: any) => {
            let itemHtml = '';
            params.forEach((item: any) => {
              const value =
                item.value || item.value === 0
                  ? `${thousandSeparation(item.value)}${
                      Object.prototype.toString.call(yAxisData[item.seriesIndex]) === '[object Null]'
                        ? ''
                        : yAxisData[item.seriesIndex]
                    }`
                  : '--';
              itemHtml += `<div><span style="height:8px;width:8px;display:inline-block;margin-right: 8px;border:1px solid #fff;background:${
                mainColor[item.componentIndex]
              }"></span>${item.seriesName} : ${value ?? '--'}</div>`;
            });
            const html = `<div class="tool-box" style="position:relative;">
                          <div class="tool-title">${tooltipTimeData[params[0].dataIndex]}</div>
                          <div class="tool-item">${itemHtml}</div>
                        <div>`;
            return html;
          },
        }),
        xAxis: [
          {
            offset: 0,
            position: 'bottom',
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              color: 'transparent',
              padding: [0, 2, 0, 2],
              fontSize: 10,
              verticalAlign: 'middle',
            },
            data: resetArrowBg(xAxisData, markIndex.value, seriesData),
          },
          {
            offset: 8,
            position: 'bottom',
            type: 'category',
            axisLine: {
              lineStyle: {
                color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR,
              },
            },
            axisLabel: {
              color: fontColor,
              margin: 16,
              fontSize: EchartsConfig.echartsConstant.CHARTS_FONT_SIZE_14,
            },
            axisTick: {
              show: false,
            },
            data: resetxAxis(xAxisData, markIndex.value, seriesData),
          },
        ],
        yAxis: resetYAxis(yAxisData, selectedLegend, seriesData),
        series: resetSeries(seriesData, markIndex.value),
      };
      console.log(option);
      return option;
    };
    /**
     * 初始化
     */
    onMounted(() => {
      markIndex.value = defaultLineIndex.value;
      // 初始 打点 --- 节点名称后面的参数名
      setMarkPoint(props.seriesData, props.xAxisTime, 1); // 初始化打点
      initEcharts();
      (myChart as any).on('legendselectchanged', (params: any) => {
        onChartLegendSelectChanged(params);
      });
      (myChart as any).on('click', (params: any) => {
        onChartClick(params);
      });
      emitter.on('onThemeSwitch', () => {
        initEcharts();
      });
      window.addEventListener('resize', () => {
        throttle((myChart as any).resize(), 150);
      });
    });
    // 组件卸载
    onUnmounted(() => {
      emitter.off('onThemeSwitch');
      window.removeEventListener('resize', () => {
        throttle((myChart as any).resize(), 150);
      });
    });

    return {
      ...toRefs(configArrowState),
      echartsContainerId,
      getEchartsOption,
      onChartLegendSelectChanged,
      onChartClick,
    };
  },
});
