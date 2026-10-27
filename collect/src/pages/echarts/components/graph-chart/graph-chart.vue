<template>
  <div class="demo-chart"><div ref="chartRef"></div></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import { useEChartsInit } from '@/hooks';
import type { EChartsOption } from 'echarts';

defineOptions({ name: 'GraphChartDemo' });

const { chartRef, initCharts } = useEChartsInit();

const option: EChartsOption = {
  tooltip: {},
  legend: { data: ['核心', '分支'], top: 10 },
  series: [
    {
      type: 'graph',
      layout: 'force',
      roam: true,
      label: { show: true },
      force: { repulsion: 200, edgeLength: 80 },
      data: [
        { name: '中心', category: 0, symbolSize: 50 },
        { name: 'A', category: 1 },
        { name: 'B', category: 1 },
        { name: 'C', category: 1 },
        { name: 'D', category: 1 },
      ],
      links: [
        { source: '中心', target: 'A' },
        { source: '中心', target: 'B' },
        { source: '中心', target: 'C' },
        { source: '中心', target: 'D' },
        { source: 'A', target: 'B' },
      ],
      categories: [{ name: '核心' }, { name: '分支' }],
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
