import { ref, shallowRef } from 'vue';
import { EChartsType, init, EChartsOption } from 'echarts';

export const useEChartsInit = () => {
  const chartInstance = shallowRef<EChartsType | null>(null);
  //  ref
  const chartRef = ref<HTMLElement>();
  /**
   * 初始化
   */
  const initCharts = (options: EChartsOption) => {
    if (chartRef.value) {
      chartInstance.value = init(chartRef.value);
      chartInstance.value!.setOption(options);
    }
    return chartInstance.value;
  };
  /**
   * 缩放
   */
  const resize = () => {
    if (chartInstance) {
      chartInstance.value!.resize();
    }
  };
  const addResize = () => {
    window.onresize = resize;
  };
  const removeResize = () => {
    window.removeEventListener('resize', resize);
  };
  /**
   * 销毁图表实例的函数，释放内存并清空引用
   */
  const disposeChart = () => {
    chartInstance.value?.dispose(); // 调用 ECharts 的 dispose 方法销毁实例
    chartInstance.value = null; // 清空 chartInstance 引用，避免内存泄漏
  };

  return {
    chartInstance,
    chartRef,
    initCharts,
    resize,
    addResize,
    removeResize,
    disposeChart,
  };
};
