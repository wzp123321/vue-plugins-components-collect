import {
  defineComponent,
  onMounted,
  ref,
  watch,
  computed,
  onUnmounted,
} from 'vue';
import {
  init,
  EChartsOption,
  format,
} from 'echarts';
import EchartsConfig from '@/config/echarts/index';
import { useStore } from 'vuex';
// import { format, addMinutes } from 'date-fns';
import { throttle } from '@/utils/index';

export default defineComponent({
  props: ['levelNodePieChartData'],
  setup(props) {
    const store = useStore();
    const formatUtil: any = format;
    const wrap: string = 'charts_' + (Math.random() * 1000).toFixed(0);
    let pie_chart: any;
    // 主题
    // 主题
    const theme = ref(store.getters.theme ? store.getters.theme : 'light');
    const fontColor =
      EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR;
    // 接收下级节点饼图数据
    const levelNodePieChartData = computed(() => {
      return props.levelNodePieChartData;
      return {
        series: [
          { name: '锅炉房2号', value: 111.42, percent: 1.91 },
          { name: '你好年后@#', value: 111.42, percent: 1.91 },
          { name: '科室121', value: 111.36, percent: 1.91 },
          {
            name: '新增二级节点2_测试最大长度111111',
            value: 110.7,
            percent: 1.9,
          },
          { name: '食堂2', value: 110.58, percent: 1.89 },
          { name: '锅炉房1号', value: 110.04, percent: 1.89 },
          { name: '附属服务综合1F', value: 110.04, percent: 1.89 },
          { name: '员工宿舍楼3', value: 109.38, percent: 1.87 },
          { name: '污水处理站1', value: 109.32, percent: 1.87 },
          { name: '锅炉房3号', value: 109.26, percent: 1.87 },
          { name: '其他', value: 4732.08, percent: 81.09 },
        ],
        timeUnit: '',
        yaxisItemList: [{ title: '功率', unit: 'kW' }],
      };
    });

    const resetData = (data: any[]) => {
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
                      index %
                        EchartsConfig.echartsConstant.CHARTS_DOUGHNUT_MAIN_COLOR
                          .length
                    ][0], // 0% 处的颜色
                },
                {
                  offset: 1,
                  color:
                    EchartsConfig.echartsConstant.CHARTS_DOUGHNUT_MAIN_COLOR[
                      index %
                        EchartsConfig.echartsConstant.CHARTS_DOUGHNUT_MAIN_COLOR
                          .length
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
    // 监听饼图图数据
    watch(
      () => levelNodePieChartData.value,
      newVal => {
        if (newVal) {
          drawPie();
        }
      },
    );

    // legend 图例位置
    const getTop = (data: any[]) => {
      if (data.length > 10) {
        return '50';
      } else {
        return 'middle';
      }
    };

    // 角度
    // const getAngle = (data: any[]) => {
    //   console.log(data);
    //   if (data.length > 10) {
    //     return 90;
    //   } else {
    //     return 90;
    //   }
    // };

    const drawPie = () => {
      const chartDom: HTMLElement | null = document.getElementById(wrap);
      if (!chartDom) {
        return;
      }
      pie_chart = init(chartDom);
      const option: EChartsOption = {
        color: EchartsConfig.echartsConstant.CHARTS_PIE_MAIN_COLOR, // 引入颜色组
        tooltip: Object.assign(
          EchartsConfig.echartsOption(theme.value).ECHARTS_TOOLTIP_OPTION,
          {
            formatter: (params: any) => {
              return (
                `<div style="text-align:left;box-sizing: border-box;border-radius: 4px;">
                                <div style="height: 20px;text-align:left;font-size:14px;box-sizing: border-box;">${params.name}</div>
                                <div style="height: 20px;text-align:left;font-size:14px;box-sizing: border-box;margin-top: 4px;">
                                    ` +
                '功率' +
                ':  ' +
                params.value +
                ` ${
                  levelNodePieChartData.value.yaxisItemList[0].unit
                    ? levelNodePieChartData.value.yaxisItemList[0].unit
                    : ''
                }
                                </div>
                                </div>
                                `
              );
            },
          },
        ),
        legend: Object.assign(
          EchartsConfig.echartsOption(theme.value)
            .ECHARTS_LINECHART_LEGEND_OPTION,
          {
            orient: 'vertical',
            top: getTop(levelNodePieChartData.value.series),
            bottom: 0,
            right: '3%',
            type: 'scroll',
            padding: [0, 0, 30, 0],
            itemGap: 20,
            itemWidth: 20,
            itemHeight: 8,
            textStyle: {
              color: 'rgba(0, 0, 0, 0.65)',
              fontSize: 14,
            },
            // 翻页页码文字样式
            pageTextStyle: {
              color: 'rgba(0, 0, 0, 0.65)',
              fontSize: 14,
              lineHeight: 22,
            },
            pageIconSize: 16,
            pageButtonPosition: 'end', // 翻页的位置。'start'：控制块在左或上,end控制块在右或下。
            pageIconColor: '#1890ff', // 可以点击的翻页按钮颜色
            pageIconInactiveColor: '#d8d8d8', // 禁用的按钮颜色
            // 处理图例文字过长
            formatter: (name: any) => {
              return formatUtil.truncateText(
                name,
                110,
                '14px Microsoft Yahei',
                '…',
                {},
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
            startAngle: 120,
            // startAngle: getAngle(levelNodePieChartData.value.series),
            avoidLabelOverlap: true,
            radius: ['40%', '60%'],
            center: ['35%', '55%'],
            // left: '1%',
            label: {
              minMargin: 5,
              edgeDistance: 10,
              lineHeight: 15,
              formatter: (params: any) => {
                return `${params.data.percent}%`;
              },
              borderWidth: 20,
              borderRadius: 4,
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
              length: 20,
              length2: 0,
            },
            labelLayout: (params: any) => {
              const isLeft = params.labelRect.x < pie_chart.getWidth() / 2;
              const points = params.labelLinePoints;
              // Update the end point.
              if (points !== undefined) {
                if (params.align === 'left') {
                  points[2][0] = params.labelRect.x + params.labelRect.width;
                } else {
                  points[2][0] = isLeft
                    ? params.labelRect.x
                    : params.labelRect.x + params.labelRect.width;
                }
                points[1][1] = params.labelRect.y + params.labelRect.height;
                points[2][1] = params.labelRect.y + params.labelRect.height;
              }
              return {
                labelLinePoints: points,
              };
            },
            emphasis: {
              itemStyle: {
                borderWidth: 20,
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
            data: resetData(levelNodePieChartData.value.series),
          },
        ],
      };
      // 监听主题 重新渲染对应主题颜色 深拷贝解决同一个地址产生的数据过滤问题
      watch(
        () => store.getters.theme,
        (newVal: string) => {
          theme.value = newVal;
          drawPie();
        },
      );
      pie_chart && pie_chart.setOption(option);
    };

    onMounted(() => {
      drawPie();
      window.addEventListener('resize', () => {
        throttle(pie_chart.resize(), 150);
      });
    });

    onUnmounted(() => {
      window.removeEventListener('resize', () => {
        throttle(pie_chart.resize(), 150);
      });
    });

    return { levelNodePieChartData, wrap };
  },
});
