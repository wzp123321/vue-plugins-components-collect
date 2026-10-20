<template>
  <div ref="chartRef" class="vc-crosshair"></div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import VChart from '@visactor/vchart';

const chartRef = ref<HTMLElement>();
let chart: VChart | null = null;

onMounted(() => {
  chart = new VChart(
    {
      type: 'line',
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
      tooltip: { visible: true },
      crosshair: {
        xField: {
          visible: true,
          line: { style: { stroke: '#5470c6', lineWidth: 1, lineDash: [4, 4] } },
          label: { visible: true },
        },
        yField: {
          visible: true,
          line: { style: { stroke: '#5470c6', lineWidth: 1, lineDash: [4, 4] } },
        },
      },
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
.vc-crosshair {
  width: 100%;
  flex: 1;
  min-height: 0;
}
</style>
