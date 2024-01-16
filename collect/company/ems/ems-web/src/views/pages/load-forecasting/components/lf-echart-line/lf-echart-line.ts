import { thousandSeparation } from '@/utils/index';
import { defineComponent, onMounted, ref, watch } from 'vue';
import { init, EChartsOption } from 'echarts';
import { format, addMinutes, addHours } from 'date-fns';
import EchartsConfig from '@/config/echarts/index';
import { useStore } from 'vuex';
import echartConfig from '@/config/echarts/index';

export default defineComponent({
  props: ['echartsData', 'echartsUnit'],
  setup(props) {
    const store = useStore();
    const wrap: string = 'charts_' + (Math.random() * 1000).toFixed(0);
    const xaxis: any = props.echartsData.xaxis;
    const productArr: [any] = props.echartsData.productArr;
    const factArr: [any] = props.echartsData.factArr;
    let line_chart;
    const echartsUnit = props.echartsUnit;
    // echartsUnit='m<sup>3</sup>'
    // 主题
    const theme = ref(store.getters.theme ? store.getters.theme : 'light');
    const timestampToTime = (timestamp: number): string => {
      const date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
      const h =
        (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
      const m =
        date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
      return h + m;
    };
    const TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR = ['#3681FF', '#FF9120'];
    const icons = [
      'reat',
      EchartsConfig.echartsConstant.ECHARTS_SOLID_LEGEND_SVG,
    ];
    const legendArr = () => {
      return [
        {
          name: '预测能耗值',
          icon: icons[0],
          textStyle: {
            color: TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[0],
          },
        },
        {
          name: '实际能耗值',
          icon: icons[1],
          textStyle: {
            color: TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[1],
          },
        },
      ];
    };
    let xaxiss: any = [];
    //格式化日期
    const formatTime = (params: number) => {
      if (params && String(params).length > 0) {
        xaxiss = xaxis.map((item: number) => {
          let MM: number | string = new Date(item).getMonth() + 1;
          if (MM < 10) {
            MM = '0' + MM;
          }
          let d: number | string = new Date(item).getDate();
          if (d < 10) d = '0' + d;
          return MM + '-' + d;
        });
      }
    };
    formatTime(xaxis);
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
            const obj = [];
            if (size.viewSize[0] - (pos[0] + size.contentSize[0] + 30) > 0) {
              obj.push(pos[0] + 30);
            } else {
              obj.push(pos[0] - (size.contentSize[0] + 30));
            }
            obj.push('10%');
            // console.log(obj)
            return obj;
          },
          formatter(params: any) {
            let html = '';
            let fortmartData = '';
            const unit: number = 2;
            if (unit || unit === 0) {
              if (unit === 0) {
                fortmartData = 'yyyy-MM-dd HH:mm';
              } else if (unit === 1) {
                fortmartData = 'yyyy-MM-dd HH:mm';
              } else if (unit === 2) {
                fortmartData = 'yyyy-MM-dd';
              } else if (unit === 3) {
                fortmartData = 'yyyy-MM';
              } else if (unit === 4) {
                fortmartData = 'yyyy';
              }
            }
            // const xAxisTimeArr: any[] = props.xAxisTimes;
            let nowDate = '';
            if (unit === 0) {
              nowDate =
                format(1627747200000, fortmartData) +
                '~' +
                format(addMinutes(1627747200000, 10), 'HH:mm');
            } else if (unit === 1) {
              nowDate =
                format(1627747200000, fortmartData) +
                '~' +
                format(addHours(1627747200000, 1), 'HH:mm');
              params.dataIndex;
            } else {
              nowDate = format(xaxis[params[0].dataIndex], fortmartData);
            }
            html += `<div class="tool-box" style="position:relative;">
                                        <div class="tool-title">${nowDate}  </div>`;
            params.forEach((item: any) => {
              const Unit = echartsUnit;
              html +=
                `<div class="tool-item">
                <div><span style="height:8px;width:8px;display:inline-block;margin-right: 8px;border:1px solid #fff;background-color:${
                  TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[item.componentIndex]
                }"></span>${item.seriesName} : ${
                  item.value || item.value === 0
                    ? thousandSeparation(item.value)
                    : '--'
                }${Unit}` +
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
            // 调整x轴坐标轴
            lineStyle: {
              color:
                EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            },
          },
          axisTick: {
            show: false,
          },
          boundaryGap: false,
          data: xaxiss,
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
            // fontSize: 14,
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
              color:
                EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            },
          },
        },
        series: [
          {
            name: '预测能耗值',
            type: 'line',
            symbolSize: 15,
            ...EchartsConfig.echartsUtils.resetLineChartSeriesEmphasisItemStyle(
              TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[0],
            ),
            symbol: 'circle',
            lineStyle: {
              width: 2,
            },
            data: echartConfig.echartsUtils.getDataIsShowDot(
              productArr,
              TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[0],
            ),
          },
          {
            name: '实际能耗值',
            type: 'line',
            data: echartConfig.echartsUtils.getDataIsShowDot(
              factArr,
              TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[1],
            ),
            symbolSize: 15,
            ...EchartsConfig.echartsUtils.resetLineChartSeriesEmphasisItemStyle(
              TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[1],
            ),
            symbol: 'circle',
            lineStyle: {},
          },
        ],
      };
      // console.log("option=>",option.xAxis)
      line_chart && line_chart.setOption(option);
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
    });
    return { drawLine, timestampToTime, wrap };
  },
});
