<template>
  <div class="demo-chart"><div ref="chartRef"></div></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import { useEChartsInit } from '@/hooks';
import type { EChartsOption } from 'echarts';

defineOptions({ name: 'ScatterChartDemo' });

const { chartRef, initCharts } = useEChartsInit();

const data: [number, number][] = Array.from({ length: 50 }, () => [
  Math.round(Math.random() * 100),
  Math.round(Math.random() * 100),
]);

const option: EChartsOption = {
  tooltip: { trigger: 'item' },
  xAxis: { type: 'value', name: 'X' },
  yAxis: { type: 'value', name: 'Y' },
  series: [
    {
      type: 'scatter',
      symbolSize: 14,
      data,
    },
  ],
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
