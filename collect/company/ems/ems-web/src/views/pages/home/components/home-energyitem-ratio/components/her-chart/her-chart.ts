import { defineComponent, computed, PropType, onMounted } from 'vue';
import { format, EChartsOption } from 'echarts';
import EchartsConfig from '@/config/echarts/index';
import { useStore } from 'vuex';
export default defineComponent({
  name: 'EnergyItemRatioChart',
  props: {
    dataList: {
      type: Array as PropType<EnergyItemRatioModule.ItemCode[]>,
      default: [],
    },
    nodeName: {
      type: String,
      default: '',
    },
    yAxisItems: {
      // 标题和单位集合
      type: Array as PropType<EnergyItemRatioModule.YaxisItemList[]>,
      default: [],
    },
  },
  setup(props, { emit }) {
    const formatUtil: any = format;
    const store = useStore();
    // 主题
    const theme = computed(() => {
      return store.getters.theme || 'light';
    });
    const onChartEvent = (item: any) => {
      if (item && item.data) {
        emit('chartClick', item);
      }
    };
    const getBarEchartsOption = () => {
      const fontColor =
        EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR;
      const titleColor =
        EchartsConfig.themeConstant[theme.value].PIE_TITLE_TEXT_COLOR;
      const option: EChartsOption = {
        color: EchartsConfig.echartsConstant.CHARTS_PIE_MAIN_COLOR,
        title: {
          text: [
            '{a| —}',
            '{b|  ' + props.nodeName + '用能分项占比图 }',
            '{a| —}',
          ].join(''),
          bottom: 10,
          left: '40%',
          textAlign: 'center',
          textStyle: {
            rich: {
              a: {
                color: '#1890ff',
                lineHeight: 1,
                width: 8,
                fontSize: 12,
              },
              b: {
                padding: [0, 4],
                fontSize: 16,
                color: titleColor,
              },
              x: {
                fontSize: 16,
                fontFamily: 'Microsoft YaHei',
              },
            },
          },
        },
        tooltip: Object.assign(
          EchartsConfig.echartsOption(theme.value).ECHARTS_TOOLTIP_OPTION,
          {
            trigger: 'item',
            formatter: (params: any) => {
              return `${props.yAxisItems[0].title} <br/> ${params.name}: ${
                params.value
              } ${props.yAxisItems[0].unit ? props.yAxisItems[0].unit : ''} (${
                params.percent
              }%)`;
            },
          },
        ),
        legend: Object.assign(
          EchartsConfig.echartsOption(theme.value)
            .ECHARTS_LINECHART_LEGEND_OPTION,
          {
            type: 'scroll',
            orient: 'vertical',
            height: 180,
            top: 'middle',
            right: 30,
            bottom: 0,
            itemGap: 24,
            itemWidth: 20,
            itemHeight: 8,
            selectedMode: true,
            pageIconSize: 14,
            // 处理图例过长
            formatter: (name: any) => {
              return formatUtil.truncateText(
                name,
                140,
                '14px Microsoft Yahei',
                '…',
              );
            },
            tooltip: {
              show: true,
              backgroundColor:
                EchartsConfig.echartsConstant.CHARTS_TOOLTIP_BG_COLOR,
              textStyle: {
                color: '#fff',
                fontSize: EchartsConfig.echartsConstant.CHARTS_FONT_SIZE_14,
              },
              padding: [8, 8],
              formatter: '{a}',
            },
          },
        ),
        series: [
          {
            type: 'pie',
            startAngle: 0,
            avoidLabelOverlap: true,
            radius: '60%',
            center: ['40%', '50%'],
            label: {
              fontSize: 14,
              borderWidth: 20,
              color: fontColor,
            },
            // 延伸线
            labelLine: {
              length: 16,
              length2: 24,
            },
            data: props.dataList,
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
    return {
      getBarEchartsOption,
      onChartEvent,
    };
  },
});
