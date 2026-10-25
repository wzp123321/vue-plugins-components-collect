<template>
  <div class="demo-chart"><div ref="chartRef"></div></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import { useEChartsInit } from '@/hooks';
import type { EChartsOption } from 'echarts';

defineOptions({ name: 'RadarChartDemo' });

const { chartRef, initCharts } = useEChartsInit();

const option: EChartsOption = {
  tooltip: {},
  legend: { data: ['预算分配', '实际开销'] },
  radar: {
    indicator: [
      { name: '销售', max: 100 },
      { name: '管理', max: 100 },
      { name: '技术', max: 100 },
      { name: '客服', max: 100 },
      { name: '研发', max: 100 },
    ],
  },
  series: [
    {
      type: 'radar',
      data: [
        { value: [80, 90, 70, 85, 95], name: '预算分配' },
        { value: [70, 85, 75, 80, 90], name: '实际开销' },
      ],
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
