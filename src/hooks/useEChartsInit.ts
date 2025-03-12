import { ref } from 'vue';
import { EChartsType, init, EChartsOption } from 'echarts';

export const useEChartsInit = () => {
  let chartInstance: EChartsType | undefined ;
  //  ref
  const chartRef = ref<HTMLElement>();
  /**
   * 初始化
   */
  const initCharts = (options: EChartsOption) => {
    if (chartRef.value) {
      chartInstance = init(chartRef.value);
      chartInstance!.setOption(options);
    }
    return chartInstance;
  };
  /**
   * 缩放
   */
  const resize = () => {
    if (chartInstance) {
      chartInstance!.resize();
    }
  };
  const addResize = () => {
    window.onresize = resize;
  };
  const removeResize = () => {
    window.removeEventListener('resize', resize);
  };

  return {
    chartInstance,
    chartRef,
    initCharts,
    resize,
    addResize,
    removeResize,
  };
};
