import { defineComponent, onMounted, ref, watch, computed, onUnmounted } from 'vue';
import { init, EChartsOption } from 'echarts';
import EchartsConfig from '@/config/echarts/index';
import { useStore } from 'vuex';
import { format, addMinutes } from 'date-fns';
import { echartsConstant } from '@/config/echarts/constant';
import * as lodash from 'lodash';
import { throttle } from '@/utils/index';
export default defineComponent({
  props: ['averageLineChartData'],
  setup(props) {
    const store = useStore();
    const wrap: string = 'charts_' + (Math.random() * 1000).toFixed(0);
    let line_chart: any;
    const icons = [
      'reat',
      EchartsConfig.echartsConstant.ECHARTS_SOLID_LEGEND_SVG,
      EchartsConfig.echartsConstant.ECHARTS_DASHED_THREE_LEGEND_ICON, //虚线
    ];

    // 接收折线图数据
    const averageLineChartData = computed(() => {
      return props.averageLineChartData;
    });
    const theme = ref(store.getters.theme ? store.getters.theme : 'light');
    const TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR = echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR;
    if (
      averageLineChartData.value.series[0].name == '总平均功率走势' &&
      TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[1] != '#3681FF'
    ) {
      TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR.splice(1, 0, '#3681FF');
    }
    // 监听折线图数据
    watch(
      () => averageLineChartData.value,
      newVal => {
        if (newVal) {
          drawLine();
        }
      },
    );
    // 标题配置
    const legendArr = () => {
      const arr: {
        name: string;
        icon: string;
        textStyle: { color: string };
      }[] = [];
      averageLineChartData.value.series.forEach((item: { data: number[]; name: string }, index: number) => {
        // 且当第一项为总平均功率走势 该项为虚线
        if (item.name == '总平均功率走势' && index == 0) {
          arr.push({
            name: item.name,
            icon: icons[2],
            textStyle: {
              color: TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[index],
            },
          });
        } else {
          arr.push({
            name: item.name,
            icon: 'rect',
            textStyle: {
              color: TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[index],
            },
          });
        }
      });
      return arr;
    };

    // 调整x轴坐标
    const formatXaxis = () => {
      const arr = [];
      for (const item of averageLineChartData.value.xaxisTimes) {
        const arritem = new Date('2020-09-08 ' + format(item, 'HH:mm'));
        const obj = {
          time: arritem.getHours() * 60 * 60 + arritem.getMinutes() * 60 + arritem.getSeconds(),
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

    // 数据部分
    const seriesArr = () => {
      const arr: any[] = [];
      const maxValue = Math.max(...averageLineChartData.value.series[0].data); //最大值
      const maxIndex = averageLineChartData.value.series[0].data.indexOf(maxValue); //最大值下表
      averageLineChartData.value.series.forEach((item: { data: number[]; name: string }, index: number) => {
        arr.push({
          name: item.name,
          type: 'line',
          itemStyle: {
            borderWidth: 20,
          },
          symbol: 'circle',
          symbolSize: 16,
          showSymbol: true,
          emphasis: {
            scale: false,
            itemStyle: EchartsConfig.echartsUtils.getsymbolStyle(TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[index]),
          },
          data: EchartsConfig.echartsUtils.getDataIsShowDot(
            item.data,
            TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[index],
          ),
          lineStyle: {
            width: 2,
            type: item.name == '总平均功率走势' ? 'dashed' : 'solid',
          },
          // 标记点对应实线
          markLine:
            index == 0
              ? {
                  lineStyle: {
                    width: 2,
                    type: 'solid',
                    color: '#F5222D',
                  },
                  emphasis: {
                    width: 2,
                    type: 'solid',
                    color: '#F5222D',
                  },
                  symbol: ['none', 'none'],
                  label: {
                    show: false,
                  },
                  data: [
                    {
                      xAxis: maxIndex,
                    },
                  ],
                }
              : null,
          // 标记点
          markPoint:
            index == 0
              ? {
                  symbol: 'circle',
                  symbolSize: 10,
                  label: {
                    show: true,
                    formatter: '峰值点',
                    fontSize: 14,
                    color: '#F5222D',
                    offset: maxIndex == averageLineChartData.value.series[0].data.length - 1 ? [-40, 0] : [40, 0], //根据情况判断峰值点文字展示位置
                  },
                  itemStyle: {
                    color: '#F5222D',
                    borderColor: 'rgba(245, 34, 45, 0.3)',
                    borderWidth: 6,
                    borderType: 'solid',
                  },
                  data: [
                    {
                      type: 'max',
                    },
                  ],
                }
              : null,
        });
      });
      return arr;
    };

    const drawLine = () => {
      const chartDom: HTMLElement | null = document.getElementById(wrap);
      if (!chartDom) {
        return;
      }
      line_chart = init(chartDom);
      const option: EChartsOption = {
        color: TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR, //引入颜色数组
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(24,144,255,0.8)',
          confine: true,
          transitionDuration: 0.001,
          axisPointer: {
            type: 'line',
            snap: true,
            animation: false,
            lineStyle: {
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
          padding: [8, 12, 8, 12],
          extraCssText:
            'color:#fff;text-align:left;box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15);border-radius:4px;z-index:99;',
          position: (
            //tootip提示位置
            pos,
            params,
            dom,
            rect: any,
            size: any,
          ) => {
            const obj = [];
            if (size.viewSize[0] - (pos[0] + size.contentSize[0] + 30) > 0) {
              obj.push(pos[0] + 30);
            } else {
              obj.push(pos[0] - (size.contentSize[0] + 30));
            }
            obj.push('10%');
            return obj;
          },
          formatter(params: any) {
            let html = '';
            const nowDate = format(averageLineChartData.value.xaxisTimes[params[0].dataIndex], 'yyyy-MM-dd');
            const Hours =
              format(averageLineChartData.value.xaxisTimes[params[0].dataIndex], 'HH:mm') +
              '~' +
              format(addMinutes(averageLineChartData.value.xaxisTimes[params[0].dataIndex], 10), 'HH:mm');
            html += `<div class="tool-box" style="position:relative;">
                                        <div class="tool-title">${nowDate + ' ' + Hours} </div>`;
            params.forEach((item: any) => {
              const Unit = averageLineChartData.value.yaxisItemList[0].unit;
              html +=
                `<div class="tool-item">
                <div><span style="height:8px;width:8px;display:inline-block;margin-right: 8px;border:1px solid #fff;background-color:${
                  TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[item.componentIndex]
                }"></span>${item.seriesName} : ${item.value || item.value === 0 ? item.value : '--'}${Unit}` +
                `</div>
                </div>
                <div>`;
            });
            return html;
          },
        },
        legend: {
          itemHeight: 3,
          itemGap: 24,
          data: legendArr(),
        },
        grid: {
          left: '4%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          // length: 2,
          splitLine: {
            show: false,
            lineStyle: {
              type: 'dotted',
              color: EchartsConfig.themeConstant[theme.value].CHARTS_SPLIT_LINE_COLOR,
            },
          },
          axisLine: {
            //调整x轴坐标轴
            lineStyle: {
              color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR,
            },
          },
          axisTick: {
            show: false,
          },
          boundaryGap: false,
          data: formatXaxis(),
          axisLabel: {
            //调整x轴坐标单位
            color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            margin: 15,
            fontSize: 14,
          },
        },
        yAxis: {
          type: 'value',
          // length: 2,
          //   offset: 10,
          name: `单位(${averageLineChartData.value.yaxisItemList[0].unit})`,
          nameLocation: 'end', //坐标轴名称显示位置
          nameTextStyle: {
            color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            fontSize: 14,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dotted',
              color: EchartsConfig.themeConstant[theme.value].CHARTS_SPLIT_LINE_COLOR,
            },
          },
          axisLine: {
            show: true,
            lineStyle: {
              //   type: 'solid',
              color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR,
            },
          },
          axisLabel: {
            color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            // fontSize: 14,
            formatter: (value: any) => {
              let num;
              if (value >= 1000) {
                num = value / 1000 + 'k';
                return num;
              } else if (value <= -1000) {
                num = value / 1000 + 'k';
                return num;
              } else {
                return value;
              }
            },
          },
        },
        series: seriesArr(),
      };
      //   // 监听主题 重新渲染对应主题颜色 深拷贝解决同一个地址产生的数据过滤问题
      watch(
        () => store.getters.theme,
        (newVal: string) => {
          theme.value = newVal;
          // chartData_copy = cloneDeep(chartData);
          drawLine();
        },
      );
      line_chart && line_chart.setOption(option);
    };
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
    return { averageLineChartData, wrap };
  },
});
