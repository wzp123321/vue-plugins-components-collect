import { defineComponent, onMounted, ref, watch, onUnmounted, computed } from 'vue';
import { init, EChartsOption } from 'echarts';
import EchartsConfig from '@/config/echarts/index';
import { useStore } from 'vuex';
import { throttle } from '@/utils/index';
export default defineComponent({
  props: ['echartsData'],
  setup(props) {
    const echartsData = computed(() => {
      return props.echartsData;
    });
    const store = useStore();
    const wrap: string = 'charts_' + (Math.random() * 1000).toFixed(0);
    let line_chart: any;
    const echartsUnit = '次';
    // 主题
    const theme = ref(store.getters.theme ? store.getters.theme : 'light');
    const TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR = ['#F4160F', '#FF8113', '#FFCA00', '#3997D7']; //色卡
    // x轴设置
    const xaxis = () => {
      return echartsData.value.xaxisData;
    };
    //legend设置
    const legendArr = () => {
      const arr: {
        name: string;
        icon: string;
        textStyle: { color: string };
      }[] = [];
      const legendData = echartsData.value.legendData;
      legendData.forEach((item: string, index: number) => {
        arr.push({
          name: item,
          icon: 'reat',
          textStyle: {
            color: TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[index],
          },
        });
      });
      return arr;
    };

    const seriesArr = () => {
      const arr: any[] = [];
      const legendData = echartsData.value.legendData;
      legendData.forEach((item: any, index: number) => {
        arr.push({
          name: item,
          symbolSize: 7,
          ...EchartsConfig.echartsUtils.resetLineChartSeriesEmphasisItemStyle(
            TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[index],
          ),
          lineStyle: {
            width: 2,
            type: 'solid', //'dashed'虚线 'solid'实线
          },
          itemStyle: {
            emphasis: {
              color: TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[index],
              borderColor: TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[index],
              borderWidth: 9,
            },
          },
          symbol: 'circle',
        });
      });
      const seriesData = echartsData.value.seriesData;
      seriesData.forEach((item: any, index: number) => {
        arr[index].type = item.type;
        arr[index].data = item.data;
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
          show: true,
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
            pos: any,
            params: any,
            dom: any,
            rect: any,
            size: any,
          ) => {
            //   console.log(pos,size)
            const obj = [];
            if (size.viewSize[0] - (pos[0] + size.contentSize[0] + 30) > 0) {
              obj.push(pos[0] + 30);
            } else {
              obj.push(pos[0] - (size.contentSize[0] + 30));
            }
            obj.push('10%');
            // console.log(obj);
            return obj;
          },
          formatter(params: any) {
            // console.log(params)
            let html = '';
            const nowDate = params[0].axisValue;
            html += `<div class="tool-box" style="position:relative;">
                                          <div class="tool-title">${nowDate}  </div>`;
            params.forEach((item: any) => {
              const Unit = '次';
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
          show: true,
          top: 18,
          right: 70,
          icon: 'rect',
          itemWidth: 20,
          itemHeight: 2,
          itemGap: 24,
          data: legendArr(),
        },
        grid: {
          left: 30,
          right: 76,
          top: 100,
          bottom: 35,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            interval: 1,
            color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR,
            },
          },
          axisTick: {
            show: true,
            interval: 0,
          },
          splitLine: {
            show: false,
          },
          data: xaxis(),
        },
        yAxis: {
          type: 'value',
          name: `${echartsUnit}`,
          minInterval: 1,
          nameLocation: 'end', //坐标轴名称显示位置
          nameTextStyle: {
            color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            fontSize: 14,
          },
          axisLabel: {
            color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            formatter: (value: any) => {
              if (value >= 1000) {
                value = value / 1000 + 'k';
                return value;
              } else if (value <= -1000) {
                value = value / 1000 + 'k';
                return value;
              } else {
                return value;
              }
            },
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR,
            },
          },
        },
        series: seriesArr(),
      };
      line_chart && line_chart.setOption(option);
    };
    watch(
      () => echartsData.value,
      () => {
        drawLine();
      },
    );
    onMounted(() => {
      window.addEventListener('resize', () => {
        if (!line_chart) {
          return;
        }
        throttle(line_chart.resize(), 150);
      });
    });
    onUnmounted(() => {
      window.removeEventListener('resize', () => {
        throttle(line_chart.resize(), 150);
      });
    });
    return { drawLine, wrap };
  },
});
