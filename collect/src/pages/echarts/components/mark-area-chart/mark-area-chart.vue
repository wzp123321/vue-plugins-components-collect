<template>
  <div class="mark-area-chart" ref="chartRef"></div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import { useEChartsInit } from '@/hooks';
import { EChartsOption } from 'echarts';

defineOptions({ name: 'MarkAreaChart' });

const { chartRef, initCharts, addResize, removeResize } = useEChartsInit();

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const data = [820, 932, 901, 934, 1290, 1330, 1320, 810, 920, 880, 950, 1420, 1500, 1460];

const getOptions = (): EChartsOption => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: days, boundaryGap: false },
  yAxis: { type: 'value' },
  series: [{
    name: '用电量',
    type: 'line',
    data,
    markArea: {
      silent: true,
      label: { fontSize: 11 },
      data: [
        [
          { name: '周末高峰期', xAxis: 'Fri', itemStyle: { color: 'rgba(255, 173, 177, 0.25)' } },
          { xAxis: 'Sun' },
        ],
        [
          { name: '第二周⾼峰', xAxis: 'Thu', itemStyle: { color: 'rgba(255, 173, 177, 0.25)' } },
          { xAxis: 'Sun' },
        ],
        [
          { name: '正常区间', xAxis: 'Mon', itemStyle: { color: 'rgba(100, 200, 160, 0.2)' } },
          { xAxis: 'Thu' },
        ],
      ],
    },
  }],
});

onMounted(() => { initCharts(getOptions()); addResize(); });
onUnmounted(() => { removeResize(); });
</script>
<style lang="less" scoped>
.mark-area-chart { width: 100%; height: 100%; }
</style>
