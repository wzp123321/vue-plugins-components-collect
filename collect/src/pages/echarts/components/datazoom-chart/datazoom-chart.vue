<template>
  <div class="demo-chart"><div ref="chartRef"></div></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import { useEChartsInit } from '@/hooks';
import type { EChartsOption } from 'echarts';

defineOptions({ name: 'DataZoomChartDemo' });

const { chartRef, initCharts } = useEChartsInit();

const xData: string[] = Array.from({ length: 100 }, (_, i) => `${i}`);
const yData: number[] = Array.from({ length: 100 }, () => Math.round(Math.random() * 100));

const option: EChartsOption = {
  tooltip: { trigger: 'axis' },
  grid: { top: 20, right: 20, bottom: 70, left: 50 },
  xAxis: { type: 'category', data: xData },
  yAxis: { type: 'value' },
  dataZoom: [
    { type: 'slider', start: 0, end: 30 },
    { type: 'inside', start: 0, end: 30 },
  ],
  series: [{ type: 'line', smooth: true, data: yData }],
};

onMounted(() => {
  initCharts(option);
});
</script>
<style lang="less" scoped>
.demo-chart {
  width: 100%;
  height: 100%;
  > div:first-child,
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
