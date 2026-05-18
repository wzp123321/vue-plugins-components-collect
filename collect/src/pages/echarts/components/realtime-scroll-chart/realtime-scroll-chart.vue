<template>
  <div class="realtime-scroll-chart" ref="chartRef"></div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, shallowRef } from 'vue';
import { useEChartsInit } from '@/hooks';
import { EChartsOption, EChartsType } from 'echarts';

defineOptions({ name: 'RealtimeScrollChart' });

const { chartRef, initCharts, addResize, removeResize } = useEChartsInit();

const MAX_COUNT = 60;
let timer: ReturnType<typeof setInterval> | null = null;
const chartInstance = shallowRef<EChartsType | null>(null);

const now = new Date();
const baseData: [string, number][] = [];
for (let i = -MAX_COUNT + 1; i <= 0; i++) {
  const d = new Date(now.getTime() + i * 1000);
  baseData.push([`${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`, Math.round(Math.random() * 40 + 80)]);
}

const getOptions = (): EChartsOption => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: baseData.map(([t]) => t), splitLine: { show: false } },
  yAxis: { type: 'value', min: 60, max: 140, splitLine: { lineStyle: { color: '#e8e8e8', type: 'dashed' } } },
  series: [{
    name: '实时功率',
    type: 'line',
    showSymbol: false,
    smooth: true,
    animation: false,
    areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
      colorStops: [{ offset: 0, color: 'rgba(24, 144, 255, 0.35)' }, { offset: 1, color: 'rgba(24, 144, 255, 0.02)' }] } },
    lineStyle: { color: '#1890FF', width: 2 },
    data: baseData.map(([, v]) => v),
  }],
});

onMounted(() => {
  const instance = initCharts(getOptions());
  chartInstance.value = instance;
  addResize();

  timer = setInterval(() => {
    const chart = chartInstance.value;
    if (!chart) return;
    const option = chart.getOption();
    const series = option.series as any[];
    const xData = option.xAxis as any[];
    const seriesData = series?.[0]?.data as number[] | undefined;
    const xAxisData = xData?.[0]?.data as string[] | undefined;
    if (!seriesData || !xAxisData) return;

    const nowStr = `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}:${String(new Date().getSeconds()).padStart(2, '0')}`;
    const newVal = Math.round(Math.random() * 40 + 80);

    seriesData.shift();
    seriesData.push(newVal);
    xAxisData.shift();
    xAxisData.push(nowStr);

    chart.setOption({
      xAxis: { data: xAxisData },
      series: [{ data: seriesData }],
    });
  }, 2000);
});

onUnmounted(() => {
  removeResize();
  if (timer) clearInterval(timer);
});
</script>
<style lang="less" scoped>
.realtime-scroll-chart { width: 100%; height: 100%; }
</style>
