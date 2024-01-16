import {
  defineComponent,
  onMounted,
  ref,
  watch,
  onUnmounted,
  PropType,
} from 'vue';
import { init, EChartsOption } from 'echarts';
import EchartsConfig from '@/config/echarts/index';
import { useStore } from 'vuex';
import { echartsConstant } from '@/config/echarts/constant';
import { echartsUtils } from '@/config/echarts/utils';
import { throttle, formatDate, thousandSeparation } from '@/utils/index';

export default defineComponent({
  props: {
    echartsData: {
      type: Object as PropType<GlobalModule.CommonObject>,
      default: {},
    },
    searchDate: {
      type: Date,
      default: new Date(),
    },
  },
  setup(props) {
    const store = useStore();
    const wrap: string = 'charts_' + (Math.random() * 1000).toFixed(0);
    let line_chart: any;
    const echartsUnit = props.echartsData.yunit;
    // 主题
    const theme = ref(store.getters.theme ? store.getters.theme : 'light');
    const TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR =
      echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR; // 色卡
    TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[2] = '#FE4B4E';
    const icons = [
      'rect',
      EchartsConfig.echartsConstant.ECHARTS_SOLID_LEGEND_SVG,
      EchartsConfig.echartsConstant.ECHARTS_DASHED_THREE_LEGEND_ICON, // 虚线
    ];
    // 获取symbolStyle
    const getsymbolStyle = (color: string) => {
      return {
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
              offset: 0.6,
              color: '#FFFFFF',
            },
            {
              offset: 0.7,
              color: '#FFFFFF',
            },
            {
              offset: 0.8,
              color: '#FFFFFF',
            },
            {
              offset: 0.9,
              color: '#FFFFFF',
            },
            {
              offset: 1,
              color,
            },
          ],
        },
      };
    };
    // legend设置
    const legendArr = () => {
      const arr: Array<{
        name: string;
        icon: string;
        textStyle: { color: string };
      }> = [];
      props.echartsData.legendData.forEach((item: any, index: number) => {
        arr.push({
          name: item,
          icon: icons[index],
          textStyle: {
            color: TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[index],
          },
        });
      });
      return arr;
    };
    /**
     * 获取series数据
     * @returns
     */
    const getSeriesData = () => {
      return props.echartsData.legendData &&
        props.echartsData.legendData?.length
        ? props.echartsData.legendData.map((item: any, index: number) => {
            return {
              name: item,
              type: 'line',
              symbolSize: 16,
              symbol: 'circle',
              connectNulls: false,
              showSymbol: true,
              emphasis: {
                scale: false,
                itemStyle: getsymbolStyle(
                  TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[index],
                ),
              },
              data: echartsUtils.getDataIsShowDot(
                props.echartsData.seriesData[index].data,
                TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[index],
              ),
            };
          })
        : [];
    };
    /**
     * 获取x轴
     */
    const getXaxis = () => {
      console.log(props.searchDate, props.echartsData);
      return props.echartsData.xaxisData?.length > 0
        ? props.echartsData.xaxisData.map((item: string) => {
            return `${formatDate(props.searchDate, 'yyyy')}.${item}`;
          })
        : [];
    };
    /**
     * 初始化echarts
     * @returns
     */
    const drawLine = () => {
      const chartDom: HTMLElement | null = document.getElementById(wrap);
      if (!chartDom) {
        return;
      }
      line_chart = init(chartDom);
      const option: EChartsOption = {
        color: TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR, // 引入颜色数组
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
            // tootip提示位置
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
            html += `<div class="tool-box" style="position:relative;"><div class="tool-title">${formatDate(
              props.searchDate,
              'yyyy',
            )}.01-${nowDate}  </div>`;
            params.forEach((item: any) => {
              const Unit = props.echartsData.unit;
              html +=
                `<div class="tool-item">
                <div><span style="height:8px;width:8px;display:inline-block;margin-right: 8px;border:1px solid #fff;background-color:${
                  TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[item.componentIndex]
                }"></span>${item.seriesName} : ${
                  item.value || item.value === 0
                    ? thousandSeparation(item.value)
                    : '--'
                }${
                  Object.prototype.toString.call(item.value) ===
                    '[object Null]' ||
                  Object.prototype.toString.call(item.value) ===
                    '[object Undefined]'
                    ? ''
                    : Unit
                }` +
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
          axisLine: {
            lineStyle: {
              color:
                EchartsConfig.themeConstant[theme.value]
                  .CHARTS_SPLIT_LINE_COLOR,
            },
          },
          axisTick: {
            show: false,
          },
          boundaryGap: false,
          data: getXaxis(),
          axisLabel: {
            // 调整x轴坐标单位
            color:
              EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            margin: 15,
            fontSize: 14,
          },
        },
        yAxis: {
          type: 'value',
          name: `单位(${echartsUnit})`,
          nameLocation: 'end', // 坐标轴名称显示位置
          nameTextStyle: {
            color:
              EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            fontSize: 14,
          },
          axisLabel: {
            color:
              EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            formatter: EchartsConfig.echartsUtils.formatter,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color:
                EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR,
            },
          },
        },
        series: getSeriesData(),
      };
      console.log('option---------', option);
      if (!line_chart) {
        return;
      }
      line_chart.setOption(option);
    };
    watch(
      () => store.getters.theme,
      (newVal: string) => {
        theme.value = newVal;
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
    return { drawLine, wrap };
  },
});
