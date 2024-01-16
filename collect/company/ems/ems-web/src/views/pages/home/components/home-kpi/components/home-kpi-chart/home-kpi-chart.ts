import { defineComponent, computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { init, EChartsOption } from 'echarts';
import EchartsConfig from '@/config/echarts/index';
import { useStore } from 'vuex';
import { useCommonController } from '@/utils/use-common-controller';
import { throttle } from '@/utils/index';
export default defineComponent({
  name: 'KpiChart',
  props: {
    percent: {
      type: String,
      default: '',
    },
    unitName: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const kpiChartWrap = ref();
    const unitTop = ref('70%');
    const store = useStore();
    const { emitter } = useCommonController();
    let myChart = ref<any>(null);
    // 生成的随机id
    const echartsContainerId: string = 'charts_' + (Math.random() * 1000).toFixed(0);
    // 主题
    const theme = computed(() => {
      return store.getters.theme || 'light';
    });
    const percentData: any = computed(() => {
      return props.percent;
    });
    let splitColorData = [
      {
        splitDot: 0.5,
        color: ['#00A9E9', '#00E9D1'],
      },
      {
        splitDot: 0.7,
        color: ['#F8CD3E', '#F89F0B'],
      },
      {
        splitDot: 0.98,
        color: ['#E874AE', '#E83E82'],
      },
      {
        splitDot: 1,
        color: ['#BBC5CC', '#BBC5CC'],
      },
    ];
    const splitValueData = ['0%', '90%', '120%', '≥180%'];
    onMounted(() => {
      initEcharts();
      emitter.on('onThemeSwitch', () => {
        initEcharts();
      });
      window.addEventListener('resize', () => {
        throttle((myChart as any).resize(), 150);
        initEcharts();
      });
    });
    // 组件卸载
    onUnmounted(() => {
      emitter.off('onThemeSwitch');
      window.removeEventListener('resize', () => {
        throttle((myChart as any).resize(), 150);
      });
    });
    /**
     * 初始化
     */
    const initEcharts = () => {
      const chartDom: HTMLElement | null = document.getElementById(echartsContainerId);
      if (!chartDom) {
        return;
      }
      const option = getGaugeEchartsOption();
      (myChart as any) = init(chartDom);
      if (!option) {
        throw new Error('获取echarts配置错误！');
      }
      (myChart as any).clear(); // 清空绘画内容，清空后实例可用
      (myChart as any).setOption(option);
    };
    /**
     * 监听数据源变化
     */
    watch(
      percentData,
      (newVal, oldVal) => {
        initEcharts();
      },
      {
        immediate: true,
      },
    );
    /**
     * 设置环形图颜色分布
     */
    const resetGaugeColor = () => {
      const arrData: any[] = [];
      const itemValue = Number(percentData.value) / 100;
      const themeValue = theme.value;
      if (itemValue <= 0.9) {
        splitColorData = [
          {
            splitDot: itemValue / 1.8,
            color: ['#00A9E9', '#00E9D1'],
          },
          {
            splitDot: 1,
            color: themeValue === 'light' ? ['#BBC5CC', '#BBC5CC'] : ['#393C3F', '#393C3F'],
          },
        ];
      } else if (itemValue > 0.9 && itemValue <= 1.2) {
        splitColorData = [
          {
            splitDot: 0.5,
            color: ['#00A9E9', '#00E9D1'],
          },
          {
            splitDot: itemValue / 1.8,
            color: ['#F8CD3E', '#F89F0B'],
          },
          {
            splitDot: 1,
            color: themeValue === 'light' ? ['#BBC5CC', '#BBC5CC'] : ['#393C3F', '#393C3F'],
          },
        ];
      } else if (itemValue > 1.2 && itemValue < 1.8) {
        splitColorData = [
          {
            splitDot: 0.5,
            color: ['#00A9E9', '#00E9D1'],
          },
          {
            splitDot: 0.66,
            color: ['#F8CD3E', '#F89F0B'],
          },
          {
            splitDot: itemValue / 1.8,
            color: ['#E874AE', '#E83E82'],
          },
          {
            splitDot: 1,
            color: themeValue === 'light' ? ['#BBC5CC', '#BBC5CC'] : ['#393C3F', '#393C3F'],
          },
        ];
      } else if (itemValue === 1.8) {
        splitColorData = [
          {
            splitDot: 0.5,
            color: ['#00A9E9', '#00E9D1'],
          },
          {
            splitDot: 0.66,
            color: ['#F8CD3E', '#F89F0B'],
          },
          {
            splitDot: 0.989,
            color: ['#E874AE', '#E83E82'],
          },
          {
            splitDot: 1,
            color: themeValue === 'light' ? ['#BBC5CC', '#BBC5CC'] : ['#393C3F', '#393C3F'],
          },
        ];
      } else {
        splitColorData = [
          {
            splitDot: 0.5,
            color: ['#00A9E9', '#00E9D1'],
          },
          {
            splitDot: 0.66,
            color: ['#F8CD3E', '#F89F0B'],
          },
          {
            splitDot: 1,
            color: ['#E874AE', '#E83E82'],
          },
        ];
      }
      splitColorData.forEach((item) => {
        const arrItem: any = [
          item.splitDot,
          {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: item.color[0],
              },
              {
                offset: 1,
                color: item.color[1],
              },
            ],
            global: false,
          },
        ];
        arrData.push(arrItem);
      });
      return arrData;
    };
    /**
     * 绘图
     */
    const getGaugeEchartsOption = () => {
      unitTop.value = kpiChartWrap.value?.offsetWidth < 230 ? '70%' : '75%';
      const fontColor = EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR;
      const perTextColor = EchartsConfig.themeConstant[theme.value].GAUGE_MIDDLE_TEXT_COLOR;
      const option: EChartsOption = {
        backgroundColor: 'transparent',
        series: [
          {
            type: 'gauge',
            radius: '90%',
            min: 0, // 最小刻度
            max: 182, // 最大刻度
            splitNumber: 182, // 刻度数量
            startAngle: 235,
            endAngle: -45,
            axisLine: {
              show: false,
            }, // 仪表盘轴线
            axisLabel: {
              show: true,
              color: fontColor,
              distance: 5,
              formatter(v: any): any {
                switch (v + '') {
                  case '15':
                    return '{idx1|' + splitValueData[0] + '}';
                  case '91':
                    return '{idx2|' + splitValueData[1] + '}';
                  case '121':
                    return '{idx3|' + splitValueData[2] + '}';
                  case '175':
                    return '{idx4|' + splitValueData[3] + '}';
                }
              },
              rich: {
                idx1: {
                  color: fontColor,
                  padding: [5, 0, 0, 0],
                },
                idx2: {
                  color: fontColor,
                  padding: [10, -10, 0, 0],
                },
                idx3: {
                  color: fontColor,
                  padding: [40, -20, 0, 0],
                },
                idx4: {
                  color: fontColor,
                  padding: [-10, -15, 0, 0],
                },
              },
            }, // 刻度标签。
            axisTick: {
              show: false,
            }, // 刻度样式
            splitLine: {
              show: false,
              length: -20,
            }, // 分隔线样式
            detail: {
              show: false,
            },
            pointer: {
              show: false,
            },
          },
          {
            type: 'gauge',
            radius: '70%',
            center: ['47%', '50%'],
            splitNumber: 0, // 刻度数量
            startAngle: 225,
            endAngle: -45,
            axisLine: {
              show: true,
              lineStyle: {
                width: kpiChartWrap.value?.offsetWidth < 230 ? 25 : kpiChartWrap.value?.offsetWidth < 290 ? 29 : 35,
                color: resetGaugeColor(),
              },
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            pointer: {
              show: false,
            },
            title: {
              show: true,
              offsetCenter: [0, '-26%'], // x, y，单位px
              color: '#fff',
              fontSize: 20,
            },
            detail: {
              show: true,
              offsetCenter: [0, '5%'],
              color: perTextColor,
              formatter(params) {
                return percentData.value + '%';
              },
              fontWeight: 500,
              fontSize: kpiChartWrap.value?.offsetWidth < 230 ? 14 : kpiChartWrap.value?.offsetWidth < 290 ? 18 : 24,
            },
            data: [percentData.value],
          },
          {
            name: '最内层线',
            type: 'gauge',
            radius: '45%',
            center: ['47%', '50%'],
            splitNumber: 3, // 刻度数量
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 90,
            axisLine: {
              show: true,
              lineStyle: {
                width: 0,
                shadowBlur: 0,
                color: [
                  [0.05, '#E4E9F3'],
                  [0.1, '#CAD8E8'],
                  [0.15, '#98CAD0'],
                  [0.2, '#99CBDE'],
                  [0.25, '#80D6C2'],
                  [0.3, '#50E6A6'],
                  [0.35, '#6AD9B6'],
                  [0.4, '#5CE2AC'],
                  [0.45, '#5CE2AC'],
                  [0.5, '#5CE2AC'],
                  [0.55, '#5CE2AC'],
                  [0.6, '#5CE2AC'],
                  [0.65, '#5CE2AC'],
                  [0.7, '#6AD9B6'],
                  [0.75, '#50E6A6'],
                  [0.8, '#80D6C2'],
                  [0.85, '#99CBDE'],
                  [0.9, '#98CAD0'],
                  [0.95, '#CAD8E8'],
                  [1, '#E4E9F3'],
                ],
              },
            },
            splitLine: {
              show: false,
              lineStyle: {
                opacity: 0,
              },
            },
            axisLabel: {
              show: false,
            },
            axisTick: {
              length: 1,
              lineStyle: {
                color: 'auto',
                width: 3,
                type: 'solid',
              },
            },
            detail: {
              show: false,
            },
            pointer: {
              show: false,
            },
          },
        ],
      };
      return option;
    };
    return {
      kpiChartWrap,
      echartsContainerId,
      unitTop,
    };
  },
});
