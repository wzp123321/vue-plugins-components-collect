<template>
  <div class="multistage-chart" id="multistage-chart">
    <div :id="chartId"></div>
  </div>
</template>
<script lang="ts" setup>
import { init } from '@/config/echarts/setup';
import type { EChartsType, EChartsOption } from '@/config/echarts/setup';
import { computed, onMounted } from 'vue';

let chartInstance: EChartsType;

const chartId = computed(() => `charts-${(Math.random() * 100000000).toFixed(0)}`);

const getChartOptions = (): EChartsOption => {
  const xAxisData: string[] = [];
  const data1: number[] = [];
  const data2: number[] = [];
  const data3: number[] = [];
  const data4: number[] = [];
  for (let i = 0; i < 10; i++) {
    xAxisData.push(`Class${i}`);
    data1.push(+(Math.random() * 2).toFixed(2));
    data2.push(+(Math.random() * 5).toFixed(2));
    data3.push(+(Math.random() + 0.3).toFixed(2));
    data4.push(+Math.random().toFixed(2));
  }
  const emphasisStyle = {
    itemStyle: {
      shadowBlur: 10,
      shadowColor: 'rgba(0,0,0,0.3)',
    },
  };
  const option: EChartsOption = {
    legend: {
      data: ['bar', 'bar2', 'bar3', 'bar4'],
      left: '10%',
    },
    brush: {
      toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
      xAxisIndex: 0,
    },
    xAxis: {
      data: xAxisData,
      name: 'X Axis',
      axisLine: { onZero: true },
      splitLine: { show: false },
      splitArea: { show: false },
    },
    yAxis: {},
    grid: {
      bottom: '8%',
    },
    series: [
      {
        name: 'bar',
        type: 'bar',
        stack: 'one',
        emphasis: emphasisStyle,
        data: data1,
      },
      {
        name: 'bar2',
        type: 'bar',
        stack: 'one',
        emphasis: emphasisStyle,
        data: data2,
      },
      {
        name: 'bar3',
        type: 'bar',
        stack: 'two',
        emphasis: emphasisStyle,
        data: data3,
      },
      {
        name: 'bar4',
        type: 'bar',
        stack: 'two',
        emphasis: emphasisStyle,
        data: data4,
      },
    ],
  };
  return option;
};

const initChart = () => {
  const chartContainer = document.querySelector(`#${chartId.value}`);
  if (!chartContainer) {
    return;
  }
  if (chartInstance) {
    chartInstance.dispose();
  }
  chartInstance = init(chartContainer as HTMLElement);

  const options: EChartsOption = getChartOptions();
  chartInstance.clear();
  chartInstance.setOption(options);
};

onMounted(() => {
  initChart();
});
</script>
<style lang="less" scoped>
#multistage-chart {
  width: 100%;
  height: 100%;

  > div,
  > div > div,
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
