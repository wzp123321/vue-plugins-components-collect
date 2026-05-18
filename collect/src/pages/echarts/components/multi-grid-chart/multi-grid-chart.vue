<template>
  <div class="multi-grid-chart" ref="chartRef"></div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import { useEChartsInit } from '@/hooks';
import { EChartsOption } from 'echarts';

defineOptions({ name: 'MultiGridChart' });

const { chartRef, initCharts, addResize, removeResize } = useEChartsInit();

const dates = (() => {
  const arr: string[] = [];
  for (let i = 0; i < 60; i++) {
    const d = new Date(2026, 0, i + 1);
    arr.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }
  return arr;
})();

const barData = dates.map(() => Math.round(Math.random() * 300 + 100));
const lineData = dates.map(() => Math.round(Math.random() * 50 + 20));

const getOptions = (): EChartsOption => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['日用电量', '温度'], bottom: 0 },
  grid: [
    { left: '8%', right: '8%', top: '8%', height: '38%' },
    { left: '8%', right: '8%', top: '58%', height: '30%' },
  ],
  xAxis: [
    { type: 'category', data: dates, gridIndex: 0, axisLabel: { show: false }, axisTick: { show: false } },
    { type: 'category', data: dates, gridIndex: 1 },
  ],
  yAxis: [
    { type: 'value', gridIndex: 0, name: 'kWh' },
    { type: 'value', gridIndex: 1, name: '℃' },
  ],
  dataZoom: [
    { type: 'slider', xAxisIndex: [0, 1], bottom: 30, start: 50, end: 100 },
    { type: 'inside', xAxisIndex: [0, 1], start: 50, end: 100 },
  ],
  series: [
    { name: '日用电量', type: 'bar', data: barData, xAxisIndex: 0, yAxisIndex: 0 },
    { name: '温度', type: 'line', data: lineData, xAxisIndex: 1, yAxisIndex: 1, smooth: true },
  ],
});

onMounted(() => { initCharts(getOptions()); addResize(); });
onUnmounted(() => { removeResize(); });
</script>
<style lang="less" scoped>
.multi-grid-chart { width: 100%; height: 100%; }
</style>
