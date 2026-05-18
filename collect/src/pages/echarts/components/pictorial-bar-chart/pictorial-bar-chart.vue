<template>
  <div class="pictorial-bar-chart" ref="chartRef"></div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import { useEChartsInit } from '@/hooks';
import { EChartsOption } from 'echarts';

defineOptions({ name: 'PictorialBarChart' });

const { chartRef, initCharts, addResize, removeResize } = useEChartsInit();

const categories = ['1月', '2月', '3月', '4月', '5月', '6月'];
const full = [3200, 2800, 3600, 2900, 3400, 3100];
const actual = [2100, 2350, 2800, 2100, 2900, 2600];

const getOptions = (): EChartsOption => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['实际能耗', '计划能耗'], bottom: 0 },
  xAxis: { type: 'category', data: categories },
  yAxis: { type: 'value', name: 'kWh' },
  grid: { left: '3%', right: '5%', top: 40, bottom: 40, containLabel: true },
  series: [
    {
      name: '计划能耗',
      type: 'pictorialBar',
      symbol: 'rect',
      symbolRepeat: 'fixed',
      symbolSize: [24, 8],
      symbolMargin: 2,
      symbolBoundingData: 4000,
      z: 1,
      itemStyle: { color: '#e0e0e0' },
      data: full.map((v) => v + 160),
    },
    {
      name: '实际能耗',
      type: 'pictorialBar',
      symbol: 'rect',
      symbolRepeat: 'fixed',
      symbolSize: [24, 8],
      symbolMargin: 2,
      symbolBoundingData: 4000,
      z: 2,
      itemStyle: { color: '#1890FF' },
      data: actual.map((v) => v + 160),
    },
  ],
});

onMounted(() => { initCharts(getOptions()); addResize(); });
onUnmounted(() => { removeResize(); });
</script>
<style lang="less" scoped>
.pictorial-bar-chart { width: 100%; height: 100%; }
</style>
