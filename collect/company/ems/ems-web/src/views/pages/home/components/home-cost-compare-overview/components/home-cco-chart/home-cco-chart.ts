import { defineComponent, computed, PropType } from 'vue';
import { EChartsOption } from 'echarts';
import { useStore } from 'vuex';
import EchartsConfig from '@/config/echarts/index';

export default defineComponent({
  name: 'CostCompareChart',
  props: {
    seriesData: {
      type: Object as PropType<CostCompareOverviewModule.Series>,
      default: [],
    },
    xAxisTime: {
      type: Array as PropType<any[]>,
      default: [],
    },
    yAxisItems: {
      type: Object as PropType<CostCompareOverviewModule.YAxisItem[]>,
      default: [],
    },
  },
  setup(props) {
    const store = useStore();
    // 主题
    const theme = computed(() => {
      return store.getters.theme || 'light';
    });
    /**
     * 判断是否所有点位都是异常点位数据
     * @param seriesData 点位数据
     */
    const isDataStatusAllIrregular = (seriesData: CostCompareOverviewModule.Series) => {
      if (!seriesData || !seriesData.data || seriesData.data.length === 0) {
        return false;
      }

      for (const dataItem of seriesData.data) {
        const dataStatus = dataItem;
        if (!dataStatus) {
          return false;
        }
      }

      return true;
    };
    /**
     * 处理左边grid距离
     */
    const getGridLeftMargin = (seriesData: CostCompareOverviewModule.Series) => {
      const LEFT_MARGIN_WITH_DATA = 32;
      const LEFT_MARGIN_WITHOUT_DATA = 60;
      return isDataStatusAllIrregular(seriesData) ? LEFT_MARGIN_WITHOUT_DATA : LEFT_MARGIN_WITH_DATA;
    };
    /**
     * 绘图
     */
    const getLineEchartsOption = () => {
      console.log(props.seriesData.data);
      const fontColor = EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR;
      const splitColor = EchartsConfig.themeConstant[theme.value].CHARTS_SPLIT_LINE_COLOR;
      const lineColor = EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR;
      const option: any = {
        title: {
          text: props.yAxisItems && props.yAxisItems.length > 0 ? props.yAxisItems[0].title : '',
          left: 26,
          top: 9,
          textStyle: {
            color: fontColor,
            lineHeight: 26,
            fontSize: 18,
            fontWeight: 'bold',
          },
        },
        grid: {
          left: getGridLeftMargin(props.seriesData),
          bottom: 32,
          right: 20,
          top: 82,
          containLabel: true,
        },
        tooltip: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_TOOLTIP_OPTION, {
          extraCssText:
            'color:#fff;text-align:left;box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15);border-radius:4px;z-index:999;',
          formatter: (params: any) => {
            let itemHtml = '';
            params.forEach((item: any) => {
              itemHtml += `<div>${item.seriesName} : ${item.value ?? '--'}${
                props.yAxisItems && props.yAxisItems.length > 0 && (item.value ?? '--') !== '--'
                  ? props.yAxisItems[0].unit
                  : ''
              }</div>`;
            });
            const timeArray = props.seriesData.dataAttach;
            const html = `<div class="tool-box" style="position:relative;font-size: 14px;">
                            <div class="tool-title" style="margin-bottom: 8px">${timeArray[params[0].dataIndex]}</div>
                            <div class="tool-item">${itemHtml}</div>
                          <div>`;
            return html;
          },
        }),
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            color: fontColor,
            margin: 12,
            fontSize: 14,
            lineHeight: 20,
          },
          axisLine: {
            lineStyle: {
              color: lineColor,
            },
          },
          data: props.xAxisTime,
        },
        yAxis: {
          type: 'value',
          name: props.yAxisItems && props.yAxisItems.length > 0 ? props.yAxisItems[0].unit : '',
          axisLabel: {
            color: fontColor,
            margin: 16,
            fontSize: 14,
            lineHeight: 20,
          },
          nameTextStyle: {
            fontSize: 14,
            lineHeight: 20,
            align: 'left',
            color: fontColor,
            padding: [0, 0, 0, -26],
          },
          splitLine: {
            lineStyle: {
              color: splitColor,
            },
          },
          axisTick: {
            show: true,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: lineColor,
            },
          },
        },
        series: [
          {
            name: props.seriesData.name,
            type: 'line',
            itemStyle: {
              borderWidth: 20,
            },
            symbol: 'circle',
            symbolSize: 16,
            showSymbol: true,
            emphasis: {
              scale: false,
              itemStyle: EchartsConfig.echartsUtils.getsymbolStyle('#1890ff'),
            },
            data: EchartsConfig.echartsUtils.getDataIsShowDot(props.seriesData.data, '#1890ff'),
            smooth: true,
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(55, 159, 255, 1)', // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: 'rgba(24, 144, 255, 0)', // 100% 处的颜色
                  },
                ],
                global: false, // 缺省为 false
              },
            },
          },
        ],
      };
      return option;
    };
    return {
      getLineEchartsOption,
    };
  },
});
