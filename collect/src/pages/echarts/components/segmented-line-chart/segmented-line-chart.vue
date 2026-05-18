<template>
  <div class="segmented-line-chart" ref="chartRef"></div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import { useEChartsInit } from '@/hooks';
import { EChartsOption } from 'echarts';

defineOptions({ name: 'SegmentedLineChart' });

const { chartRef, initCharts, addResize, removeResize } = useEChartsInit();

const xData = ['01-01', '01-02', '01-03', '01-04', '01-05', '01-06', '01-07', '01-08', '01-09', '01-10',
  '01-11', '01-12', '01-13', '01-14', '01-15', '01-16', '01-17', '01-18', '01-19', '01-20'];

const values = [
  320, 350, 280, 410, 390, 305, 425, 380, 360, 295,
  405, 415, 340, 370, 460, 480, 320, 355, 420, 390,
];

const getOptions = (): EChartsOption => ({
  tooltip: { trigger: 'axis' },
  visualMap: {
    show: false,
    dimension: 1,
    pieces: [
      { lt: 300, color: '#67C23A' },
      { gte: 300, lt: 400, color: '#E6A23C' },
      { gte: 400, color: '#F56C6C' },
    ],
  },
  xAxis: { type: 'category', data: xData },
  yAxis: { type: 'value' },
  series: [{
    type: 'line',
    data: values,
    markLine: {
      silent: true,
      data: [
        { yAxis: 300, label: { formatter: '偏低线' }, lineStyle: { color: '#67C23A', type: 'dashed' } },
        { yAxis: 400, label: { formatter: '偏高线' }, lineStyle: { color: '#F56C6C', type: 'dashed' } },
      ],
    },
  }],
});

onMounted(() => { initCharts(getOptions()); addResize(); });
onUnmounted(() => { removeResize(); });
</script>
<style lang="less" scoped>
.segmented-line-chart { width: 100%; height: 100%; }
</style>
