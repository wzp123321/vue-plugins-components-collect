<template>
  <div class="demo-chart"><div ref="chartRef"></div></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import { useEChartsInit } from '@/hooks';
import type { EChartsOption } from 'echarts';

defineOptions({ name: 'FunnelChartDemo' });

const { chartRef, initCharts } = useEChartsInit();

const option: EChartsOption = {
  title: { text: '转化率漏斗', left: 'center' },
  tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
  legend: { bottom: 0 },
  series: [
    {
      type: 'funnel',
      left: '10%',
      right: '10%',
      top: 60,
      bottom: 40,
      data: [
        { value: 100, name: '访问' },
        { value: 80, name: '咨询' },
        { value: 60, name: '下单' },
        { value: 40, name: '付款' },
        { value: 20, name: '复购' },
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
