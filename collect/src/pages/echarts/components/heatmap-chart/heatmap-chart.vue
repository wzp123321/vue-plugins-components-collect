<template>
  <div class="demo-chart"><div ref="chartRef"></div></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import { useEChartsInit } from '@/hooks';
import type { EChartsOption } from 'echarts';

defineOptions({ name: 'HeatmapChartDemo' });

const { chartRef, initCharts } = useEChartsInit();

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
const data: [number, number, number][] = [];
for (let d = 0; d < 7; d++) {
  for (let h = 0; h < 24; h++) {
    data.push([h, d, Math.round(Math.random() * 10)]);
  }
}

const option: EChartsOption = {
  tooltip: { position: 'top' },
  grid: { top: 10, right: 20, bottom: 60, left: 60 },
  xAxis: { type: 'category', data: hours, splitArea: { show: true } },
  yAxis: { type: 'category', data: days, splitArea: { show: true } },
  visualMap: { min: 0, max: 10, calculable: true, orient: 'horizontal', left: 'center', bottom: 10 },
  series: [{ type: 'heatmap', data }],
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
