<template>
  <div class="demo-chart"><div ref="chartRef"></div></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import { useEChartsInit } from '@/hooks';
import type { EChartsOption } from 'echarts';

defineOptions({ name: 'SankeyChartDemo' });

const { chartRef, initCharts } = useEChartsInit();

const option: EChartsOption = {
  tooltip: { trigger: 'item', triggerOn: 'mousemove' },
  series: [
    {
      type: 'sankey',
      data: [
        { name: '来源A' },
        { name: '来源B' },
        { name: '转化' },
        { name: '留存' },
        { name: '流失' },
      ],
      links: [
        { source: '来源A', target: '转化', value: 60 },
        { source: '来源B', target: '转化', value: 40 },
        { source: '转化', target: '留存', value: 50 },
        { source: '转化', target: '流失', value: 50 },
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
