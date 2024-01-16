import { computed, ComputedRef, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import { init, EChartsOption, EChartsType } from 'echarts';
// utils
import { useCommonController } from '@/utils/use-common-controller';

export default defineComponent({
  name: 'IotEchartsContainer',
  props: {
    /**
     * 高度
     */
    height: {
      type: Number,
      default: 240,
    },
    /**
     * 宽度(防止弹窗里的图表出现获取宽度不正确情况，要具体传像素)
     */
    width: {
      type: String,
      default: '100%',
    },
    /**
     * 基本配置fn
     */
    useEchartsOptions: {
      type: Function,
    },
    /**
     * 折线图点击事件
     */
    hasLineClick: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const { emitter } = useCommonController();
    let myChart: EChartsType;
    // 是否点击图例
    const hasLegendClicked = ref(false);
    // 生成的随机id
    const echartsContainerId = computed(() => {
      return 'charts-' + `${(Math.random() * 100000000).toFixed(0)}-${(Math.random() * 100000000).toFixed(0)}`;
    });
    // 高度
    const domHeight = computed(() => {
      return props.height;
    });
    // 宽度
    const domWidth = computed(() => {
      return props.width;
    });
    // 获取配置
    const options: ComputedRef<EChartsOption> = computed(() => {
      return typeof props.useEchartsOptions === 'function' ? props.useEchartsOptions() : {};
    });
    /**
     * 初始化
     */
    const initEcharts = () => {
      const chartDom: HTMLElement | null = document.getElementById(echartsContainerId.value);
      if (!chartDom) {
        return;
      }
      if (myChart) {
        myChart?.dispose();
      }
      myChart = init(chartDom);
      if (!options.value) {
        return;
      }
      myChart.clear(); // 清空绘画内容，清空后实例可用
      myChart.setOption(options.value);

      myChart.off('click');
      myChart.off('legendselectchanged');
      myChart.off('mouseover');
      myChart.off('mouseout');
      myChart.getZr().off('click');

      // 图例点击事件
      myChart.on('legendselectchanged', (params: any) => {
        hasLegendClicked.value = true;
        emit('legendselectchanged', params);
        setTimeout(() => {
          hasLegendClicked.value = false;
        }, 100);
      });
      // 点击事件
      myChart.on('click', (params: any) => {
        emit('click', params);
      });
      // mouseover
      myChart.on('mouseover', (params: any) => {
        emit('mouseover', params);
      });
      // mouseover
      myChart.on('mouseout', (params: any) => {
        emit('mouseout', params);
      });
      /**
       * 折线图点击事件
       */
      myChart.getZr().on('click', (params: any) => {
        if (hasLegendClicked.value) {
          return;
        }
        if (!props.hasLineClick) {
          return;
        }
        // 无数据时可以使用
        const dataIndex = myChart.convertFromPixel({ seriesIndex: 0 }, [params.offsetX, params.offsetY])[0];
        hasLegendClicked.value = false;
        emit('lineClick', { dataIndex });
      });
    };
    const resize = () => {
      if (myChart) {
        myChart.resize();
      }
    };
    watch(
      () => options.value,
      (newVal) => {
        if (newVal && Object.keys(newVal).length > 0) {
          initEcharts();
        }
      },
      {
        immediate: true,
      },
    );
    // 初始化
    onMounted(() => {
      initEcharts();

      emitter.on('onThemeSwitch', () => {
        initEcharts();
      });

      window.addEventListener('resize', resize);
    });
    // 组件卸载
    onUnmounted(() => {
      emitter.off('onThemeSwitch');
      if (myChart) {
        myChart?.dispose();
      }

      window.removeEventListener('resize', resize);
    });
    return { echartsContainerId, domHeight, domWidth };
  },
});
