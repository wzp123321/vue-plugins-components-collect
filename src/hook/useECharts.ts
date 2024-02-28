import { ref } from 'vue';
import { EChartsType, init, EChartsOption } from 'echarts';

export const useECharts = () => {
  let chartInstance: EChartsType;
  //  ref
  const chartRef = ref<HTMLElement>();
  /**
   * 初始化
   */
  const initCharts = (options: EChartsOption) => {
    if (chartRef.value) {
      chartInstance = init(chartRef.value);
      chartInstance.setOption(options);
    }
  };
  /**
   * 缩放
   */
  const resize = () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  };
  const addResize = () => {
    window.addEventListener('resize', resize);
  };
  const removeResize = () => {
    window.removeEventListener('resize', resize);
  };

  return {
    chartRef,
    initCharts,
    addResize,
    removeResize,
  };
};
