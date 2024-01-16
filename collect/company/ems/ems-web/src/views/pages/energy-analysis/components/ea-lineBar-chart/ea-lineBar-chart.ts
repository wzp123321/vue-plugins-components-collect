import { ITHCompareVO, checkHasTHCompare } from '../../utils/check';
import { defineComponent, PropType, computed, ref } from 'vue';
import { format, addMinutes, addHours, endOfMonth, startOfMonth, endOfYear, startOfYear, isToday } from 'date-fns';
import EchartsConfig from '@/config/echarts/index';
// utils
import { useStore } from 'vuex';
import { cloneDeep } from 'lodash';
import { canvasToFile, thousandSeparation } from '@/utils/index';
import Deffer from '@/utils/index';

export interface BarData {
  barChartSeriesList: SeriesItem[];
  legendDataList: LegendData[];
  xaxisTimes: number[];
  yaxisItemList: GlobalModule.CommonObject;
}
export interface SeriesItem {
  colors: ValueItem[];
  values: ValueItem[];
  lastMonthValues: ValueItem[];
  lastYearValues: ValueItem[];
}
export interface ValueItem {
  value: any;
  name: string;
}
export interface LegendData {
  color: string;
  description: string;
}

// 同环比
interface ThbItem {
  title: string;
  isActive: boolean;
  color: string;
  activeColor: string;
}

export default defineComponent({
  name: 'EaLineBarChart',
  props: {
    barData: {
      // 柱状图数据源
      type: Array as PropType<SeriesItem[]>,
      default: [],
    },
    yAxisItems: {
      // y轴标题和单位集合
      type: Array as PropType<AnalysisManageModule.YaxisItemList[]>,
      default: [],
    },
    xAxisTimes: {
      // x轴数据
      type: Array,
      default: [],
    },
    unit: {
      // 颗粒度
      type: String,
      default: null,
    },
    legendDataException: {
      // 异常图列
      type: Array as PropType<LegendData[]>,
      default: [],
    },
    legendSelected: {
      // 图列是否默认选中
      type: Boolean,
      default: false,
    },
    chartWidth: {
      // 图表宽度，防止弹窗里的图表不能显示正确宽度
      type: String,
      default: '100%',
    },
    compareTitle: {
      // 同环比拼接名称
      type: String,
      default: '',
    },
    valueMean: {
      // 当前的能源指标
      type: String,
      default: '',
    },
    height: {
      type: Number,
      default: 336,
    },
    timeSection: {
      type: Array as PropType<string[]>,
      default: [],
    },
  },

  setup(props, { emit }) {
    const store = useStore();
    const isMH = ref<ITHCompareVO>({
      tbFlag: false,
      hbFlag: false,
    });
    isMH.value = checkHasTHCompare(props.unit, props.timeSection, false);
    // 主题
    const theme = computed(() => {
      return store.getters.theme || 'light';
    });
    // 高度
    const height = computed(() => {
      return props.height;
    });
    // 能源指标
    const valueMean = computed(() => {
      return props.valueMean;
    });
    const thbDataList = ref<ThbItem[]>([
      {
        title: '同比',
        isActive: false,
        color: 'rgba(0, 0, 0, 0.25)',
        activeColor: '#ff9120',
      },
      {
        title: '环比',
        isActive: false,
        color: 'rgba(0, 0, 0, 0.25)',
        activeColor: '#a83bff',
      },
    ]);
    // 生成的随机id
    const echartsContainerId: string = 'charts_' + (Math.random() * 1000).toFixed(0);
    // echarts option
    const echartOption = ref<any>({});
    // 获取配置
    const getBarLineEchartsOption = () => {
      const fontColor = EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR;
      const option: any = {
        tooltip: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_TOOLTIP_OPTION, {
          borderColor: 'transparent',
          extraCssText:
            'color:#fff;text-align:left;box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15);border-radius:4px;z-index:99;',
          formatter: (params: any) => {
            let html = '';
            let fortmartData = '';
            const unit = props.unit;
            if (unit) {
              if (unit === '10m') {
                fortmartData = 'yyyy-MM-dd HH:mm';
              } else if (unit === '1h') {
                fortmartData = 'yyyy-MM-dd HH:mm';
              } else if (unit === '1d') {
                fortmartData = 'yyyy-MM-dd';
              } else if (unit === '1M') {
                fortmartData = 'yyyy-MM';
              } else if (unit === '1y') {
                fortmartData = 'yyyy';
              }
            }
            const xAxisTimeArr: any[] = props.xAxisTimes;
            let nowDate = '';
            if (unit === '10m') {
              nowDate =
                format(xAxisTimeArr[params[0].dataIndex], fortmartData) +
                '~' +
                format(addMinutes(xAxisTimeArr[params[0].dataIndex], 10), 'HH:mm');
            } else if (unit === '1h') {
              nowDate =
                format(xAxisTimeArr[params[0].dataIndex], fortmartData) +
                '~' +
                format(addHours(xAxisTimeArr[params[0].dataIndex], 1), 'HH:mm');
            } else {
              nowDate = format(xAxisTimeArr[params[0].dataIndex], fortmartData);
            }
            html += `<div class="tool-box" style="position:relative;">
                          <div class="tool-title">${nowDate}
                          </div>`;
            params.forEach((item: any) => {
              let Unit = '';
              if (item.value || item.value === 0) {
                Unit = props.yAxisItems[0].unit || '';
              }
              const color = item.color.colorStops
                ? item.color.colorStops[5].color
                : item.name.indexOf('同比') !== -1
                ? '#ff9120'
                : item.name.indexOf('环比') !== -1
                ? '#a83bff'
                : item.color;
              const name =
                item.name.indexOf('同比') !== -1 || item.name.indexOf('环比') !== -1
                  ? item.name.replace('能耗能耗', '能耗') + props.compareTitle
                  : item.name.replace('能耗能耗', '能耗');
              html +=
                `<div class="tool-item">
                    <div>
                      <span style="height:8px;width:8px;display:inline-block;margin-right: 8px;
                        border:1px solid #fff;background-color:${color}">
                      </span>${name} : ${thousandSeparation(item.value) ?? '--'}${Unit}` +
                `</div>
                    </div>
                  <div>`;
            });
            return html;
          },
        }),
        grid: {
          left: '5%',
          right: '2%',
          top: 50,
          bottom: 30,
          containLabel: true,
        },
        legend: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_LEGEND_OPTION, {
          type: 'scroll',
          bottom: 10,
          itemGap: 24,
          pageIconColor: '#1890ff',
          pageIconInactiveColor: '#d8d8d8',
          pageTextStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
          },
          y: 'bottom',
          icon: 'rect',
          selectedMode: false,
          height: 22,
          itemHeight: 8,
          itemWidth: 20,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 14,
            lineHeight: 22,
          },
          data: getLegendData(),
        }),
        xAxis: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_AXIS_CATEGORY_OPTION, {
          data: resetxAxisTime(props.xAxisTimes, props.unit),
        }),
        yAxis: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_AXIS_VALUE_OPTION, {
          offset: 0,
          name: (props.yAxisItems[0].title ? props.yAxisItems[0].title : '') + '(' + props.yAxisItems[0].unit + ')',
          nameLocation: 'end',
          nameTextStyle: {
            align: 'left',
            fontSize: EchartsConfig.echartsConstant.CHARTS_FONT_SIZE_14,
            color: fontColor,
            padding: [0, 0, 10, -10],
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR,
            },
          },
          data: resetxAxisTime(props.xAxisTimes, props.unit),
        }),
        series: resetSeries(props.barData),
      };
      echartOption.value = option;
      return option;
    };
    // 获取图例数据
    const getLegendData = () => {
      const { legendDataException } = props;
      return legendDataException.map((item: LegendData) => {
        return {
          name: item.description,
        };
      });
    };
    /**
     * 图表点击事件
     */
    const chartClick = (item: any) => {
      if (!item || (isNaN(item.dataIndex) && !item.dataIndex)) {
        return;
      }
      const time: any = props.xAxisTimes[item.dataIndex];
      const timeArray = getTimeArray(time);
      const param = {
        timeArray: timeArray[0] ? timeArray[0] : [],
        drillingTime: timeArray[1] ? timeArray[1] : '',
      };
      emit('bar-chart-click', param);
    };
    // 获取时间数组
    const getTimeArray = (time: number) => {
      let data: any[] = [];
      let fortmartData = '';
      const { unit } = props;
      if (unit) {
        if (unit === '10m') {
          fortmartData = 'yyyy-MM-dd HH:mm';
        } else if (unit === '1h') {
          fortmartData = 'yyyy-MM-dd HH:mm';
        } else if (unit === '1d') {
          fortmartData = 'yyyy-MM-dd';
        } else if (unit === '1M') {
          fortmartData = 'yyyy-MM';
        } else if (unit === '1y') {
          fortmartData = 'yyyy';
        }
      } else {
        return [null, null];
      }
      if (unit === '10m') {
        data = [
          [format(time, fortmartData), format(addMinutes(time, 9), fortmartData)],
          format(time, fortmartData) + '-' + format(addMinutes(time, 10), 'HH:mm'),
        ];
      } else if (unit === '1h') {
        data = [
          [format(time, fortmartData), format(addMinutes(time, 59), fortmartData)],
          format(time, fortmartData) + '-' + format(addMinutes(time, 60), 'HH:mm'),
        ];
      } else if (unit === '1d') {
        const istoday = isToday(time);
        const end = istoday ? format(new Date(), 'yyyy-MM-dd HH:mm') : format(time, 'yyyy-MM-dd') + ' 23:59';
        data = [[format(time, 'yyyy-MM-dd HH:mm'), end], format(time, fortmartData)];
      } else if (unit === '1M') {
        const isToMonth = time && new Date(time).getMonth() === new Date().getMonth();
        const end = isToMonth
          ? format(new Date(), 'yyyy-MM-dd HH:mm')
          : `${format(endOfMonth(new Date(time)), 'yyyy-MM-dd')} 23:59`;
        data = [[format(startOfMonth(time), 'yyyy-MM-dd HH:mm'), end], format(time, fortmartData)];
      } else if (unit === '1y') {
        const isToYear = time && new Date(time).getFullYear() === new Date().getFullYear();
        const end = isToYear
          ? format(new Date(), 'yyyy-MM-dd') + ' 23:59'
          : format(endOfYear(time), 'yyyy-MM-dd HH:mm');
        data = [[format(startOfYear(time), 'yyyy-MM-dd HH:mm'), end], format(time, fortmartData)];
      } else {
        data = [[format(time, fortmartData), format(time, fortmartData)], format(time, fortmartData)];
      }
      return data;
    };
    // 同环比选择
    const onThbSelect = (index: number) => {
      thbDataList.value[index].isActive = !thbDataList.value[index].isActive;
    };
    /**
     * 处理x轴时间戳
     * @param param timeArr x轴数据源
     * @param param Unit 时间颗粒 （0 10分钟 1小时  2天  3月  4年）
     */
    const resetxAxisTime = (timeArr: any, Unit: any) => {
      let data = [];
      if (Unit) {
        switch (Unit) {
          case '10m':
            data = timeArr.map((item: any) => {
              return format(item, 'HH:mm') === '00:00' ? format(item, 'M.d') : format(item, 'HH:mm');
            });
            break;
          case '1h':
            data = timeArr.map((item: any) => {
              return format(item, 'HH:mm') === '00:00' ? format(item, 'M.d') : format(item, 'HH:mm');
            });
            break;
          case '1d':
            data = timeArr.map((item: any) => format(item, 'M.d'));
            break;
          case '1M':
            data = timeArr.map((item: any) => format(item, 'yyyy.M'));
            break;
          case '1y':
            data = timeArr.map((item: any) => format(item, 'yyyy'));
            break;
          case 'default':
            break;
        }
      } else {
        data = timeArr;
      }
      return data;
    };
    /**
     * 处理y轴数据源
     */
    const resetSeries = (sData: any[]) => {
      const data: any[] = [];
      sData.forEach((item: any, i: any) => {
        let arrItem = {};
        if (item.values) {
          arrItem = {
            type: 'bar',
            barMaxWidth: '14px',
            name: props.legendDataException?.length ? props.legendDataException[0].description : '',
            itemStyle: {
              color: props.legendDataException?.length ? props.legendDataException[0].color : '',
            },
            animation: !thbDataList.value[0].isActive || !thbDataList.value[0].isActive,
            stack: 'stack',
            data: resetSeriesBorder(item.values, i, item.colors),
          };
          data.push(arrItem);
          //   如果legend数组大于1条
          if (props.legendDataException?.length > 1) {
            props.legendDataException.forEach((item, index) => {
              if (index !== 0) {
                data.push({
                  type: 'bar',
                  barMaxWidth: '14px',
                  animation: !thbDataList.value[0].isActive || !thbDataList.value[0].isActive,
                  name: props.legendDataException?.length ? props.legendDataException[index].description : '',
                  itemStyle: {
                    color: props.legendDataException?.length ? props.legendDataException[index].color : '',
                  },
                  stack: 'stack',
                  data: [],
                });
              }
            });
          }
        }
        if (item.lastYearValues) {
          arrItem = {
            type: 'line',
            name: item.lastYearValues[0] && item.lastYearValues[0].name ? item.lastYearValues[0].name : '',
            data: thbDataList.value[0].isActive ? getDataIsShowDot(item.lastYearValues, '#ff9120') : [],
            symbol: 'circle',
            symbolSize: 15,
            smooth: true,
            showSymbol: false, // symbol默认不展示
            cursor: 'default',
            itemStyle: resetItemStyle('#ff9120'),
            lineStyle: {
              width: 1,
            },
          };
          data.push(arrItem);
        }
        if (item.lastMonthValues) {
          arrItem = {
            type: 'line',
            name: item.lastMonthValues[0] && item.lastMonthValues[0].name ? item.lastMonthValues[0].name : '',
            data: thbDataList.value[1].isActive ? getDataIsShowDot(item.lastMonthValues, '#a83bff') : [],
            symbol: 'circle',
            symbolSize: 15,
            showSymbol: false, // symbol默认不展示
            smooth: true,
            cursor: 'default',
            itemStyle: resetItemStyle('#a83bff'),
            lineStyle: {
              width: 1,
            },
          };
          data.push(arrItem);
        }
      });
      return data;
    };
    const resetItemStyle = (color: string) => {
      const style = {
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
              color,
            },
            {
              offset: 0.5,
              color,
            },
            {
              offset: 1,
              color,
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
              color,
            },
          ],
          globalCoord: false, // 缺省为 false
        },
        borderWidth: 5,
      };
      return {
        normal: { color },
        emphasis: style,
      };
    };
    /**
     * 处理y轴数据源border样式
     * @param param bData y轴数据源data
     */
    const resetSeriesBorder = (bData: any[], i: any, colors: string[]) => {
      const data: any[] = [];
      bData.forEach((item: any, index: number) => {
        let arrItem = {};
        let seat = '\uFEFF';
        for (let s = 0; s < index; s++) {
          seat = seat + '\uFEFF';
        }
        if (!item && item !== 0) {
          arrItem = {
            name: item.name + seat,
            value: item.value,
          };
        } else {
          arrItem = {
            name: item.name + seat,
            value: item.value,
            itemStyle: {
              color: colors[index],
              borderRadius: item.value >= 0 ? [11, 11, 0, 0] : [0, 0, 11, 11],
            },
          };
        }
        data.push(arrItem);
      });
      return data;
    };
    const getDataIsShowDot = (data: any, color: any) => {
      if (data && data.length && data.length > 0) {
        let arrItem = {};
        const arrData: any[] = [];
        data.forEach((item: any, index: any) => {
          if (
            index === 0 &&
            item.value !== null &&
            ((data.length > 1 && data[1].value === null) || data.length === 1)
          ) {
            arrItem = {
              value: item.value,
              name: item.name,
              itemStyle: {
                color,
              },
            };
            arrData.push(arrItem);
          } else if (
            item.value !== null &&
            data.length > 1 &&
            index === data.length - 1 &&
            data[data.length - 2].value === null
          ) {
            arrItem = {
              value: item.value,
              name: item.name,
              itemStyle: {
                color,
              },
            };
            arrData.push(arrItem);
          } else if (
            item.value !== null &&
            index > 0 &&
            data[index - 1].value === null &&
            data[index + 1].value === null
          ) {
            arrItem = {
              value: item.value,
              name: item.name,
              itemStyle: {
                color,
              },
            };
            arrData.push(arrItem);
          } else {
            arrItem = {
              value: item.value,
              name: item.name,
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
     * 报告导出 --- 生成图片
     */
    const onCanvasToImage = () => {
      const deffer = new Deffer();
      const options = cloneDeep(echartOption.value);
      options.series = options.series.map((item: any) => {
        return {
          ...item,
          animation: false,
        };
      });
      const ratioOption = cloneDeep(options);
      // 同比
      const yoyOption = cloneDeep(options);
      yoyOption.series[props.legendDataException.length].data = getDataIsShowDot(
        props.barData[0].lastYearValues,
        '#ff9120',
      );
      yoyOption.series[props.legendDataException.length + 1].data = [];
      // 环比
      ratioOption.series[props.legendDataException.length].data = [];
      ratioOption.series[props.legendDataException.length + 1].data = getDataIsShowDot(
        props.barData[0].lastMonthValues,
        '#a83bff',
      );
      let hbPhoto: any = null;
      let tbPhoto: any = null;
      const width = Number(document.getElementsByClassName('ea-line-bar-chart')[0].scrollWidth);
      switch (props.valueMean) {
        case '1':
          tbPhoto = canvasToFile(yoyOption, width, props.height);
          hbPhoto = canvasToFile(ratioOption, width, props.height);
          deffer.resolve({
            hbPhoto,
            tbPhoto,
          });
          break;
        default:
          tbPhoto = canvasToFile(options, width, props.height);
          deffer.resolve({
            tbPhoto,
            hbPhoto: tbPhoto,
          });
      }
      return deffer.promise;
    };
    return {
      thbDataList,
      height,
      echartsContainerId,
      valueMean,
      isMH,
      getBarLineEchartsOption,
      chartClick,
      onCanvasToImage,
      onThbSelect,
    };
  },
});
