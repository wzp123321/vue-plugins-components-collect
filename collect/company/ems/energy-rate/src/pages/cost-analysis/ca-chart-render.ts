import { init, EChartsType, EChartsOption } from 'echarts';
import { reactive, ref } from 'vue';
import { Common_IObject } from '../../services/api';

const useChartRender = () => {
  // chart实例
  let chartInstance: EChartsType;
  // xaxisToolTip
  const axisToolTipFlag = ref<boolean>(false);
  // tip文本
  const tipLabel = ref<string>('');
  // tip位置
  const tipPosition = reactive<{
    left: string;
    top: string;
  }>({
    top: '',
    left: '',
  });
  /**
   * 初始化
   * @param chartRef
   * @param options
   * @returns
   */
  const initChart = (chartRef: HTMLElement, options: EChartsOption) => {
    if (!chartRef) {
      return;
    }
    if (chartInstance) {
      chartInstance.dispose();
    }
    chartInstance = init(chartRef);

    chartInstance.setOption(options);

    chartInstance.off('mouseover', handleMouseOver);
    chartInstance.on('mouseover', handleMouseOver);
    chartInstance.off('mouseout', handleMouseOut);
    chartInstance.on('mouseout', handleMouseOut);

    window.removeEventListener('resize', resize);
    window.addEventListener('resize', resize);
  };
  /**
   * 图表缩放
   */
  const resize = () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  };
  // 鼠标移入
  const handleMouseOver = (item: Common_IObject) => {
    if (item.componentType === 'yAxis') {
      const { event, value } = item;
      axisToolTipFlag.value = true;
      tipLabel.value = value as string;
      tipPosition.left = `${(event as any).offsetX}px`;
      tipPosition.top = `${(event as any).offsetY + 10}px`;
    } else if (item.componentType === 'xAxis') {
      const { event, value } = item;
      if (
        Math.abs(Number((value as any).replace(/,/gi, ''))) >= 10000 &&
        Math.abs(Number((value as any).replace(/,/gi, ''))) < 1000000
      ) {
        const $val = Number((value as any).replace(/,/gi, '')) / 1000;
        tipLabel.value = $val + 'k';
      } else if (Math.abs(Number((value as any).replace(/,/gi, ''))) >= 1000000) {
        const $val = Number((value as any).replace(/,/gi, '')) / 1000000;
        tipLabel.value = $val + 'M';
      } else {
        tipLabel.value = (value as any).replace(/,/gi, '');
      }
      axisToolTipFlag.value = true;
      tipPosition.left = `${(event as any).offsetX}px`;
      tipPosition.top = `${(event as any).offsetY}px`;
    } else {
      axisToolTipFlag.value = false;
      tipLabel.value = '';
    }
  };
  // 鼠标移出
  const handleMouseOut = () => {
    tipLabel.value = '';
    axisToolTipFlag.value = false;
  };

  return {
    initChart,
    axisToolTipFlag,
    tipLabel,
    tipPosition,
  };
};

export default useChartRender;
