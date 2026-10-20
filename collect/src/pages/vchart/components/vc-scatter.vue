<template>
  <div ref="chartRef" class="vc-scatter"></div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import VChart from '@visactor/vchart';

const chartRef = ref<HTMLElement>();
let chart: VChart | null = null;

onMounted(() => {
  const values = Array.from({ length: 30 }, (_, index) => ({
    x: index,
    y: Math.round(20 + Math.random() * 60),
  }));

  chart = new VChart(
    {
      type: 'scatter',
      autoFit: true,
      data: { values },
      xField: 'x',
      yField: 'y',
      size: 12,
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
.vc-scatter {
  width: 100%;
  flex: 1;
  min-height: 0;
}
</style>
