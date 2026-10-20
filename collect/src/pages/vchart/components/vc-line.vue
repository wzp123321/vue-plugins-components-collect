<template>
  <div ref="chartRef" class="vc-line"></div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import VChart from '@visactor/vchart';

const chartRef = ref<HTMLElement>();
let chart: VChart | null = null;

onMounted(() => {
  chart = new VChart(
    {
      type: 'area',
      autoFit: true,
      data: {
        values: [
          { month: '1月', value: 38 },
          { month: '2月', value: 52 },
          { month: '3月', value: 41 },
          { month: '4月', value: 65 },
          { month: '5月', value: 58 },
          { month: '6月', value: 72 },
        ],
      },
      xField: 'month',
      yField: 'value',
      point: { visible: true },
      line: { style: { curveType: 'monotone' } },
      area: { style: { fillOpacity: 0.15 } },
    },
    { dom: chartRef.value },
  );
  chart.renderSync();
});

onBeforeUnmount(() => {
  chart?.release();
  chart = null;
});
</script>
<style lang="less" scoped>
.vc-line {
  width: 100%;
  flex: 1;
  min-height: 0;
}
</style>
