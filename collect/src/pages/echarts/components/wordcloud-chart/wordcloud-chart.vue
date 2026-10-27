<template>
  <div class="demo-chart"><div ref="chartRef"></div></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import { useEChartsInit } from '@/hooks';
import type { EChartsOption } from 'echarts';

defineOptions({ name: 'WordCloudChartDemo' });

const { chartRef, initCharts } = useEChartsInit();

const words = [
  'Vue', 'React', 'ECharts', 'TypeScript', 'Vite', 'ElementPlus', 'Pinia', 'Axios',
  'Three', 'D3', 'Graph', 'Sankey', 'Radar', 'Heatmap', 'WordCloud',
];
const data = words.map((w, i) => ({ name: w, value: 100 - i * 5 }));

const option: EChartsOption = {
  tooltip: {},
  series: [
    {
      type: 'wordCloud',
      sizeRange: [14, 60],
      rotationRange: [-45, 45],
      data,
    } as any,
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
