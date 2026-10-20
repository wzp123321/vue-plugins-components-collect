<template>
  <div ref="chartRef" class="vc-zoom"></div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import VChart from '@visactor/vchart';

const chartRef = ref<HTMLElement>();
let chart: VChart | null = null;

onMounted(() => {
  const values = Array.from({ length: 1000 }, (_, index) => ({
    x: index,
    y: Math.round(50 + Math.sin(index / 20) * 30 + Math.random() * 10),
  }));

  chart = new VChart(
    {
      type: 'line',
      autoFit: true,
      data: { values },
      xField: 'x',
      yField: 'y',
      point: { visible: false },
      dataZoom: [
        {
          orient: 'bottom',
          start: 0,
          end: 0.2,
        },
      ],
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
.vc-zoom {
  width: 100%;
  flex: 1;
  min-height: 0;
}
</style>
