import {
  defineComponent,
  onMounted,
  computed,
  watch,
  ref,
  onUnmounted,
} from 'vue';
import { init } from 'echarts';
import EchartsConfig from '@/config/echarts/index';
import { useStore } from 'vuex';
import { format, addMinutes } from 'date-fns';
import * as lodash from 'lodash';
import { cloneDeep } from 'lodash';
import { throttle } from '@/utils/index';
export default defineComponent({
  props: ['everyDayScotterChartData'],
  setup(props) {
    let markLineUnitArea: string | null = '';
    const store = useStore();
    const wrap: string = 'charts_' + (Math.random() * 1000).toFixed(0);
    let line_chart: any;
    const mainColor = [
      ['rgba(86, 174, 255, 0.7)', 'rgba(24, 144, 255, 0.7)'],
      ['rgba(255, 123, 88, 0.7)', 'rgba(255, 29, 0, 0.7)'],
      ['rgba(255, 202, 97, 0.7)', 'rgba(255, 153, 1, 0.7)'],
      ['rgba(226, 255, 141, 0.7)', 'rgba(108, 164, 10, 0.7)'],
    ];

    const scatterShadowColor = [
      'rgba(24, 144, 255, 0.35)',
      'rgba(250, 100, 0, 0.35)',
      'rgba(247, 181, 0, 0.35)',
      'rgba(109, 212, 0, 0.35)',
    ];

    const scatterTextColor = ['#1890FF', '#FF4500', '#F7B500', '#68CA00'];

    // 主题
    const theme = ref(store.getters.theme ? store.getters.theme : 'light');

    // 获取散点图数据
    const chartData: any = computed(() => {
      return props.everyDayScotterChartData || [];
    });
    let chartData_copy: any = cloneDeep(chartData);
    // 监听改变来重新渲染散点图
    watch(
      () => chartData.value,
      () => {
        chartData_copy = cloneDeep(chartData);
        drawLine();
      },
    );

    //处理x轴数据
    const resetXAxis = (data: number[]) => {
      const arr = [];
      for (const item of data) {
        const arritem = new Date('2020-09-08 ' + format(item, 'HH:mm'));
        const obj = {
          time:
            arritem.getHours() * 60 * 60 +
            arritem.getMinutes() * 60 +
            arritem.getSeconds(),
          date: format(item, 'HH:mm'),
        };
        arr.push(obj);
      }
      let arrNow = lodash.uniqBy(arr, 'date');
      arrNow = lodash.sortBy(arrNow, 'time');
      const uniqArr = [];
      for (const timeItem of arrNow) {
        uniqArr.push(timeItem.date);
      }
      return uniqArr;
    };

    // 处理标题数据
    const setLegend = (series: { name: string; data: string[] }[]) => {
      const arr: any = [];
      const iconDot =
        'M304.43 532.76H221.4c-11.47 0-20.76-9.3-20.76-20.76s9.29-20.76 20.76-20.76h83.03c11.47 0 20.76 9.3 20.76 20.76s-9.29 20.76-20.76 20.76zM581.19 532.76H442.81c-11.47 0-20.76-9.3-20.76-20.76s9.29-20.76 20.76-20.76h138.38c11.47 0 20.76 9.3 20.76 20.76s-9.3 20.76-20.76 20.76zM802.59 532.76h-83.03c-11.47 0-20.76-9.3-20.76-20.76s9.29-20.76 20.76-20.76h83.03c11.47 0 20.76 9.3 20.76 20.76s-9.29 20.76-20.76 20.76z';
      if (series && series.length) {
        series.forEach(
          (item: { name: string; data: string[] }, index: number) => {
            const arrItem = {
              name: item.name,
              icon: index === 0 ? iconDot : 'circle',
              textStyle: {
                // tslint:disable-next-line
                color:
                  index === 0
                    ? '#1890FF'
                    : series.length === 4 && index === 3
                    ? scatterTextColor[index]
                    : scatterTextColor[index - 1],
              },
            };
            arr.push(arrItem);
          },
        );
      }
      return arr;
    };

    const resetSeriesData = (data: any, name: string) => {
      const arr = [];
      for (const item of data) {
        const oldItem = lodash.cloneDeep(item);
        const arritem = item;
        if (arritem[0].indexOf(':') == -1) {
          arritem[0] = format(Number(arritem[0]), 'HH:mm');
        }
        const itemObj = {
          value: arritem,
          name: name + ',' + oldItem[0],
        };
        arr.push(itemObj);
      }
      return arr;
    };

    const setSeries = (series: { name: string; data: string[] }[]) => {
      const arr: any = [];
      series.forEach(
        (item: { name: string; data: string[] }, index: number) => {
          let arrItem = {};
          if (index === 0) {
            markLineUnitArea = item.data[0][1];
            arrItem = {
              name: item.name,
              type: 'line',
              symbolSize: 0,
              itemStyle: {
                normal: {
                  color: '#1890FF',
                  lineStyle: {
                    color: '#1890FF',
                  },
                },
              },
              markLine: {
                symbol: 'none',
                lineStyle: {
                  width: 2,
                  color: 'rgba(24, 144, 255, 0.8)',
                  type: 'dashed',
                },
                emphasis: {
                  lineStyle: {
                    width: 2,
                    color: 'rgba(24, 144, 255, 1)',
                    type: 'dashed',
                  },
                },
                data: [
                  {
                    name: item.name,
                    yAxis: [item.data[0][0]],
                    label: {
                      show: false,
                    },
                  },
                ],
              },
              data: [item.data[0][0]],
            };
          } else {
            arrItem = {
              name: item.name,
              data: resetSeriesData(item.data, item.name),
              type: 'scatter',
              symbolSize: 20,
              itemStyle: {
                normal: {
                  shadowBlur: 8,
                  shadowColor:
                    series.length === 4 && index === 3
                      ? scatterShadowColor[index]
                      : scatterShadowColor[index - 1],
                  shadowOffsetY: 6,
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color:
                          series.length === 4 && index === 3
                            ? mainColor[index][0]
                            : mainColor[index - 1][0],
                      },
                      {
                        offset: 1,
                        color:
                          series.length === 4 && index === 3
                            ? mainColor[index][1]
                            : mainColor[index - 1][1],
                      },
                    ],
                  },
                  global: false,
                },
              },
            };
          }
          arr.push(arrItem);
        },
      );
      return arr;
    };

    const drawLine = () => {
      const chartDom: HTMLElement | null = document.getElementById(wrap);
      if (!chartDom) {
        return;
      }
      line_chart = init(chartDom);
      getPieEchartsOption();
    };

    const getPieEchartsOption = () => {
      const options = {
        grid: {
          right: 16,
          left: 16,
          top: 60,
          bottom: 10,
          containLabel: true,
        },
        legend: {
          icon: 'circle',
          top: 16,
          itemGap: 24,
          itemHeight: 10,
          textStyle: {
            fontSize: 14,
          },
          data: setLegend(chartData_copy.value.seriesData),
        },
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'none',
          },
          backgroundColor: 'rgba(24,144,255,0.8)',
          lineStyle: {
            color: '#85E3A5',
          },
          padding: [8, 12, 8, 12],
          extraCssText:
            'color:#fff;box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15);border-radius:4px;',
          formatter(params: any) {
            let itemHtml = '';
            if (params.componentType === 'markLine') {
              let unitArea = '--';
              if (markLineUnitArea) {
                unitArea =
                  markLineUnitArea +
                  ' ' +
                  chartData.value.yaxisItemList[0].unit +
                  '/m²';
              }
              itemHtml += `<div style="color:">${params.name} : ${params.value[0]} ${chartData.value.yaxisItemList[0].unit}</div>
                          <div>单位面积功率 : ${unitArea}</div>`;
              if (itemHtml !== '') {
                const html = `<div class="tool-box" style="position:relative;">
                                <div class="tool-item">${itemHtml}</div>
                              <div>`;
                return html;
              }
            } else {
              const unit = chartData.value.minUnit || 0;
              const date = Number(params.name.split(',')[1]);
              let titleTime = format(date, 'yyyy-MM-dd HH:mm');
              if (unit === 0) {
                titleTime =
                  format(date, 'yyyy-MM-dd HH:mm') +
                  '~' +
                  format(addMinutes(date, 10), 'HH:mm');
              } else {
                titleTime =
                  format(date, 'yyyy-MM-dd HH:mm') +
                  '~' +
                  format(addMinutes(date, 60), 'HH:mm');
              }
              let unitArea = '--';
              if (params.value[2]) {
                unitArea =
                  params.value[2] +
                  ' ' +
                  chartData.value.yaxisItemList[0].unit +
                  '/m²';
              }
              itemHtml += `<div style="margin-top: 8px">${params.seriesName} : ${params.value[1]} ${chartData.value.yaxisItemList[0].unit}</div>
                          <div style="margin-top: 8px">单位面积功率 : ${unitArea}</div>`;
              if (itemHtml !== '') {
                const html = `<div class="tool-box" style="position:relative;">
                                <div class="tool-title">${titleTime}</div>
                                <div class="tool-item">${itemHtml}</div>
                              <div>`;
                return html;
              }
            }
          },
        },
        xAxis: {
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dotted',
              color:
                EchartsConfig.themeConstant[theme.value]
                  .CHARTS_SPLIT_LINE_COLOR,
            },
          },
          axisLine: {
            //调整x轴坐标轴
            lineStyle: {
              color:
                EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR,
            },
          },
          axisLabel: {
            fontSize: 14,
            margin: 16,
            color:
              EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
          },
          axisTick: {
            show: false,
          },
          data: resetXAxis(chartData_copy.value.xaxisTimes),
        },
        yAxis: {
          name:
            chartData.value.yaxisItemList[0].title +
            '（' +
            chartData.value.yaxisItemList[0].unit +
            '）',
          nameTextStyle: {
            color:
              EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            fontSize: 14,
            align: 'left',
            padding: [0, 0, 10, -16],
          },
          axisLine: {
            show: true,
            lineStyle: {
              //   type: 'solid',
              color:
                EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR,
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dotted',
              color:
                EchartsConfig.themeConstant[theme.value]
                  .CHARTS_SPLIT_LINE_COLOR,
            },
          },
          axisLabel: {
            fontSize: 14,
            margin: 16,
            color:
              EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            formatter: (value: number | string) => {
              const valueNum = Number(value);
              if (Math.abs(valueNum) >= 1000) {
                return `${valueNum / 1000}k`;
              }
              return value;
            },
          },
          axisTick: {
            show: false,
          },
          scale: true,
        },
        series: setSeries(chartData_copy.value.seriesData),
      };
      line_chart && line_chart.setOption(options);
      return options;
    };
    // 监听主题 重新渲染对应主题颜色 深拷贝解决同一个地址产生的数据过滤问题
    watch(
      () => store.getters.theme,
      (newVal: string) => {
        theme.value = newVal;
        chartData_copy = cloneDeep(chartData);
        drawLine();
      },
      {
        immediate: true,
      },
    );
    onMounted(() => {
      drawLine();
      window.addEventListener('resize', () => {
        throttle(line_chart.resize(), 150);
      });
    });
    onUnmounted(() => {
      window.removeEventListener('resize', () => {
        throttle(line_chart.resize(), 150);
      });
    });
    return {
      getPieEchartsOption,
      chartData,
      wrap,
    };
  },
});
