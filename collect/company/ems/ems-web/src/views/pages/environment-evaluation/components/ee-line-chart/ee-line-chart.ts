import { defineComponent, onMounted, ref, watch, computed, onUnmounted } from 'vue';
import { init, EChartsOption, EChartsType, number } from 'echarts';
import EchartsConfig from '@/config/echarts/index';
import { useStore } from 'vuex';
import { format, addMinutes } from 'date-fns';
import { echartsConstant } from '@/config/echarts/constant';
import * as lodash from 'lodash';
import { throttle } from '@/utils/index';
import { cloneDeep } from 'lodash';
export default defineComponent({
  props: ['averageLineChartData'],
  setup(props) {
    const store = useStore();
    const wrap: string = 'charts_' + (Math.random() * 1000).toFixed(0);
    let line_chart: any;
    // icon线的样式
    const icons = [
      'reat',
      EchartsConfig.echartsConstant.ECHARTS_SOLID_LEGEND_SVG,
      EchartsConfig.echartsConstant.ECHARTS_DASHED_THREE_LEGEND_ICON, //虚线
    ];
    // 接收折线图数据
    const averageLineChartData = computed(() => {
      return props.averageLineChartData;
    });

    const symbolStyle: { [key: string]: any } = {
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
            color: '#3681FF',
          },
          {
            offset: 0.5,
            color: '#3681FF',
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
            color: '#3681FF',
          },
        ],
      },
    };

    /**
     * 处理y轴数据源
     */
    const resetSeries = (sData: any) => {
      const data: any[] = [];
      if (sData.scoreList?.length) {
        data.push({
          type: 'line',
          name: '综合评分',
          emphasis: {
            scale: false,
            itemStyle: symbolStyle,
          },
          data: EchartsConfig.echartsUtils.getDataIsShowDot(sData.scoreList, colorArr[0]),
          symbol: 'circle',
          symbolSize: 15,
          showSymbol: true,
          smooth: false,
          cursor: 'default',
          itemStyle: resetItemStyle(colorArr[0]),
          lineStyle: {
            width: 2,
          },
        });
      }
      if (sData.withCompareList?.length) {
        data.push({
          type: 'line',
          name: '同比值',
          connectNulls: false,
          emphasis: {
            scale: false,
            itemStyle: symbolStyle,
          },
          data: EchartsConfig.echartsUtils.getDataIsShowDot(sData.withCompareList, colorArr[1]),
          symbol: 'circle',
          symbolSize: 15,
          showSymbol: true, // 默认为true显示所有数据点 false隐藏所有数据点
          smooth: true,
          cursor: 'default',
          itemStyle: resetItemStyle(colorArr[1]),
          lineStyle: {
            width: 2,
          },
        });
      }
      if (sData.ringCompareList?.length) {
        data.push({
          type: 'line',
          name: '环比值',
          emphasis: {
            scale: false,
            itemStyle: symbolStyle,
          },
          data: EchartsConfig.echartsUtils.getDataIsShowDot(sData.ringCompareList, colorArr[2]),
          symbol: 'circle',
          symbolSize: 15,
          showSymbol: true,
          smooth: true,
          cursor: 'default',
          itemStyle: resetItemStyle(colorArr[2]),
          lineStyle: {
            width: 2,
          },
        });
      }
      console.log(data);
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
    // 主题
    const theme = ref(store.getters.theme ? store.getters.theme : 'light');
    // echarts颜色组
    const TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR = echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR;
    const colorArr = ['rgba(54, 129, 255, 1)', 'rgba(255, 145, 32, 1)', 'rgba(168, 59, 255, 1)'];
    const legendArr = () => {
      const legendData = [];
      if (props.averageLineChartData?.scoreList) {
        legendData.push({
          name: '综合评分',
          icon: icons[0],
          textStyle: {
            color: colorArr[0],
          },
        });
      }
      if (props.averageLineChartData?.withCompareList) {
        legendData.push({
          name: '同比值',
          icon: icons[1],
          textStyle: {
            color: colorArr[1],
          },
        });
      }
      if (props.averageLineChartData?.ringCompareList) {
        legendData.push({
          name: '环比值',
          icon: icons[1],
          textStyle: {
            color: colorArr[2],
          },
        });
      }
      return legendData;
    };
    const drawLine = () => {
      const chartDom: HTMLElement | null = document.getElementById(wrap);
      if (!chartDom) {
        return;
      }
      line_chart = init(chartDom);
      const option: EChartsOption = {
        color: colorArr,
        // color: TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR, //引入颜色数组
        tooltip: {
          trigger: 'axis',
          padding: [8, 12, 8, 12],
          backgroundColor: 'rgba(24,144,255,0.8)',
          confine: true,
          transitionDuration: 0.001,
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
            html += `<div class="tool-box" style="position:relative;">
                                          <div class="tool-title">${
                                            averageLineChartData.value.timeList[params[0].dataIndex]
                                          }</div>`;
            params.forEach((item: any) => {
              html +=
                `<div class="tool-item">
                  <div>${item.seriesName} : ${item.value || item.value === 0 ? item.value : '--'}` +
                `</div>
                  </div>
                  <div>`;
            });
            return html;
          },
        },
        legend: {
          padding: [20, 0, 0, 0],
          show: true,
          itemHeight: 2,
          itemGap: 20,
          icon: 'rect',
          // data: ['综合评分', '同比值', '环比值']
          data: legendArr(),
        },
        grid: {
          left: '2%',
          right: '2%',
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
          boundaryGap: true,
          data: averageLineChartData.value.xaxis,
          axisLabel: {
            //调整x轴坐标单位
            color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            margin: 15,
            fontSize: 14,
          },
        },
        yAxis: {
          type: 'value',
          length: 2,
          // offset: 10,
          name: '分值',
          nameLocation: 'end', //坐标轴名称显示位置
          nameTextStyle: {
            padding: [0, 0, 10, -10],
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
              // type: 'solid',
              color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR,
            },
          },
          axisLabel: {
            color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            fontSize: 14,
          },
        },
        series: resetSeries(averageLineChartData.value),
      };
      // 监听折线图数据
      watch(
        () => averageLineChartData.value,
        (newVal) => {
          if (newVal) {
            drawLine();
          }
        },
      );
      // 监听主题 重新渲染对应主题颜色 深拷贝解决同一个地址产生的数据过滤问题
      // watch(
      //   () => store.getters.theme,
      //   (newVal: string) => {
      //     theme.value = newVal;
      //     // chartData_copy = cloneDeep(chartData);
      //     drawLine();
      //   }
      // );
      line_chart && line_chart.setOption(option);
    };

    // 调整x轴坐标
    // 数据部分
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
