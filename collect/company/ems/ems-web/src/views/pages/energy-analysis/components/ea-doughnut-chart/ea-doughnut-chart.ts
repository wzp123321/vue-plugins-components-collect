import { defineComponent, PropType, computed } from 'vue';
import { SeriesOption, format, EChartsOption } from 'echarts';
import EchartsConfig from '@/config/echarts/index';
import { useStore } from 'vuex';
// utils
import { canvasToFile, thousandSeparation } from '@/utils/index';

export interface ItemCode {
  value: any;
  name: string;
}
export default defineComponent({
  name: 'EaDoughnutChart',
  props: {
    dataList: {
      type: Array as PropType<ItemCode[]>,
      default: [],
    },
    title: {
      type: String,
      default: '',
    },
    yAxisItems: {
      // 标题和单位集合
      type: Array as PropType<AnalysisManageModule.YaxisItemList[]>,
      default: [],
    },
  },
  setup(props) {
    const store = useStore();
    const formatUtil: any = format;
    // 主题
    const theme = computed(() => {
      return store.getters.theme || 'light';
    });
    const getPieEchartsOption = () => {
      const fontColor = EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR;
      const option: EChartsOption = {
        color: EchartsConfig.echartsConstant.CHARTS_PIE_MAIN_COLOR,
        tooltip: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_TOOLTIP_OPTION, {
          borderColor: 'transparent',
          formatter: (params: any) => {
            return `<div style="text-align:left;box-sizing: border-box;border-radius: 4px;">
                  <div style="height: 20px;text-align:left;font-size:14px;box-sizing: border-box;">
                    ${params.name}
                  </div>
                  <div style="height: 20px;text-align:left;font-size:14px;box-sizing: border-box;margin-top: 4px;">
                  ${props.title}：${thousandSeparation(params.value) ?? '--'}${
              props.yAxisItems[0].unit && (params.value ?? '--') !== '--' ? props.yAxisItems[0].unit : ''
            }
                  </div>
                </div>`;
          },
        }),
        legend: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_LEGEND_OPTION, {
          type: 'scroll',
          orient: 'vertical',
          top: 50,
          right: 0,
          bottom: 30,
          itemGap: 20,
          itemWidth: 20,
          itemHeight: 8,
          selectedMode: true,
          pageIconSize: 14,
          // 处理图例过长
          formatter: (name: any) => {
            return formatUtil.truncateText(name, 140, '14px Microsoft Yahei', '…');
          },
          tooltip: {
            show: true,
            backgroundColor: EchartsConfig.echartsConstant.CHARTS_TOOLTIP_BG_COLOR,
            textStyle: {
              color: '#fff',
              fontSize: EchartsConfig.echartsConstant.CHARTS_FONT_SIZE_14,
            },
            padding: [8, 8],
            formatter: '{a}',
          },
        }),
        series: [
          {
            type: 'pie',
            startAngle: 120,
            avoidLabelOverlap: true,
            radius: ['30%', '50%'],
            center: ['40%', '50%'],
            label: {
              formatter: (params: any) => {
                return `${params.data.percent}%`;
              },
              borderWidth: 20,
              borderRadius: 4,
              padding: [0, -48, 20, -48],
              rich: {
                a: {
                  color: fontColor,
                  fontSize: 12,
                  lineHeight: 20,
                },
                b: {
                  color: fontColor,
                  fontSize: 12,
                  lineHeight: 20,
                },
              },
            },
            // 延伸线
            labelLine: {
              length: 10,
              length2: 50,
            },
            data: resetData(props.dataList),
            emphasis: {
              itemStyle: {
                borderWidth: 20,
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      };
      return option;
    };
    const resetData = (data: ItemCode[]) => {
      const arr: any[] = [];
      data.forEach((item: any, index: number) => {
        const arrItem = {
          value: item.value,
          percent: item.percent,
          name: item.name,
          avoidLabelOverlap: false,
          itemStyle: {
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
                    EchartsConfig.echartsConstant.CHARTS_DOUGHNUT_MAIN_COLOR[
                      index % EchartsConfig.echartsConstant.CHARTS_DOUGHNUT_MAIN_COLOR.length
                    ][0], // 0% 处的颜色
                },
                {
                  offset: 1,
                  color:
                    EchartsConfig.echartsConstant.CHARTS_DOUGHNUT_MAIN_COLOR[
                      index % EchartsConfig.echartsConstant.CHARTS_DOUGHNUT_MAIN_COLOR.length
                    ][1], // 100% 处的颜色
                },
              ],
              global: false, // 缺省为 false
            },
          },
        };
        arr.push(arrItem);
      });
      return arr;
    };
    /**
     * 生成文件
     */
    const toFile = () => {
      const options = getPieEchartsOption();
      if (Object.prototype.toString.call(options.series) === '[object Array]') {
        options.series = (options.series as SeriesOption[])?.map((item: SeriesOption) => {
          return {
            ...item,
            animation: false,
          };
        });
      }
      const width = document.getElementsByClassName('ea-doughnutChart-chart')[0].scrollWidth;
      return canvasToFile(options, width, 350);
    };
    return {
      getPieEchartsOption,
      toFile,
    };
  },
});
