/*
 * @Description: 圆环图
 * @Autor: zpwan
 * @Date: 2022-04-26 09:17:06
 * @LastEditors: wanzp
 * @LastEditTime: 2023-07-20 09:41:23
 */
import { defineComponent, PropType, computed, watch, onMounted, onUnmounted } from 'vue';

import { AlarmTrackInfo } from '../services/th-at-api';

import { init, EChartsOption } from 'echarts';

export default defineComponent({
  name: 'ThAtCharts',
  props: {
    alarmTrackVO: {
      type: Object as PropType<AlarmTrackInfo>,
      default: {},
    },
  },
  setup(props) {
    let myChart: any;
    //   自定义ID
    const customChartId = computed(() => {
      return `charts_${(Math.random() * 100000).toFixed(0)}`;
    });
    // 初始化charts
    const initCharts = () => {
      const chartDom = document.getElementById(customChartId.value);
      if (!chartDom) {
        return;
      }
      myChart = init(chartDom);

      const gaugeData = [
        {
          value: props.alarmTrackVO.precent ?? 0,
          name: '',
          title: {
            offsetCenter: ['0%', '10%'],
          },
          detail: {
            valueAnimation: true,
            offsetCenter: ['0%', '10%'],
          },
        },
      ];
      const option: EChartsOption = {
        grid: {
          top: '0',
          left: '0',
          bottom: '0',
          right: '0',
        },
        series: [
          {
            type: 'gauge',
            startAngle: 90,
            endAngle: -270,
            pointer: {
              show: false,
            },
            progress: {
              show: true,
              overlap: false,
              roundCap: false, // 进度条圆角
              clip: false,
              itemStyle: {
                color: props?.alarmTrackVO?.color,
              },
            },
            emphasis: {
              disabled: true, // 禁用高亮
            },
            axisLine: {
              lineStyle: {
                width: formatFontSize(7), // 进度条宽度
                color: [[1, props.alarmTrackVO.backgroundColor]],
              },
            },
            splitLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            data: gaugeData,
            detail: {
              width: formatFontSize(10),
              height: formatFontSize(16),
              color: props.alarmTrackVO.color,
              fontSize: formatFontSize(16),
              fontWeight: 400,
              borderWidth: 0,
              formatter: '{value}%',
            },
          },
        ],
      };

      // const option: EChartsOption = {
      //   series: [
      //     {
      //       type: 'pie',
      //       radius: [formatFontSize(24), formatFontSize(32)],
      //       center: ['50%', '50%'],
      //       data: [
      //         {
      //           value: props.alarmTrackVO.precent,
      //           label: {
      //             position: 'center',
      //             show: true,
      //             fontSize: formatFontSize(16),
      //             color: props.alarmTrackVO.color,
      //             formatter: (params: any) => {
      //               return `${params.value}%`;
      //             },
      //           },
      //           itemStyle: {
      //             color: props.alarmTrackVO.color,
      //           },
      //           emphasis: {
      //             scale: false,
      //           },
      //         },
      //         {
      //           value: 100 - props.alarmTrackVO.precent,
      //           name: 'invisible',
      //           itemStyle: {
      //             color: props.alarmTrackVO.backgroundColor,
      //           },
      //           emphasis: {
      //             scale: false,
      //           },
      //         },
      //       ],
      //     },
      //   ],
      // };

      myChart.setOption(option);
    };
    // 处理字体大小
    const formatFontSize = (value: number): number => {
      const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      if (!clientWidth) return value;
      const fontSize = clientWidth / 1920;
      return value * fontSize;
    };
    // 监听数据源变化
    watch(
      () => props.alarmTrackVO,
      () => {
        initCharts();
      },
    );
    onMounted(() => {
      initCharts();
      window.addEventListener('resize', () => {
        if (myChart) {
          myChart.resize();
        }
      });
    });
    onUnmounted(() => {
      window.removeEventListener('resize', () => {
        if (myChart) {
          myChart.resize();
        }
      });
    });
    return {
      customChartId,
    };
  },
});
