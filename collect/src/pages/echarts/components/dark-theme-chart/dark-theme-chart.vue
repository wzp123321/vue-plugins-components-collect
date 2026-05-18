<template>
  <div class="dark-theme-chart" ref="chartRef"></div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import { useEChartsInit } from '@/hooks';
import { EChartsOption } from 'echarts';

defineOptions({ name: 'DarkThemeChart' });

const { chartRef, initCharts, addResize, removeResize } = useEChartsInit();

const DARK_TEXT = 'rgba(255,255,255,0.75)';
const DARK_MUTED = 'rgba(255,255,255,0.45)';
const GRID_BG = '#1a1d2e';
const COLOR_ARR = ['#5B8FF9', '#61DDAA', '#F6BD16', '#E8684A', '#6DC8EC', '#9270CA'];

const xData = ['01-01', '01-03', '01-05', '01-07', '01-09', '01-11', '01-13'];
const seriesArr = [
  { name: '空调用电', data: [320, 280, 310, 290, 350, 330, 300] },
  { name: '照明用电', data: [180, 190, 175, 185, 195, 188, 182] },
  { name: '动力用电', data: [250, 240, 260, 245, 255, 250, 265] },
  { name: '其他用电', data: [120, 110, 130, 125, 115, 122, 118] },
];

const getOptions = (): EChartsOption => ({
  backgroundColor: GRID_BG,
  color: COLOR_ARR,
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(30,30,50,0.95)',
    borderColor: 'rgba(255,255,255,0.1)',
    textStyle: { color: DARK_TEXT },
  },
  legend: {
    bottom: 0,
    textStyle: { color: DARK_MUTED },
  },
  grid: { left: '3%', right: '5%', top: 40, bottom: 40, containLabel: true },
  xAxis: {
    type: 'category',
    data: xData,
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
    axisLabel: { color: DARK_MUTED },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value',
    name: 'kWh',
    nameTextStyle: { color: DARK_MUTED },
    axisLabel: { color: DARK_MUTED },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)', type: 'dashed' } },
  },
  series: seriesArr.map((s) => ({
    name: s.name,
    type: 'bar',
    stack: 'total',
    barWidth: 24,
    emphasis: { focus: 'series' },
    data: s.data,
  })),
});

onMounted(() => { initCharts(getOptions()); addResize(); });
onUnmounted(() => { removeResize(); });
</script>
<style lang="less" scoped>
.dark-theme-chart { width: 100%; height: 100%; }
</style>
