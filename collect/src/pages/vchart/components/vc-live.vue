<template>
  <div ref="chartRef" class="vc-live"></div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import VChart from '@visactor/vchart';

type VChartSpec = ConstructorParameters<typeof VChart>[0];

const chartRef = ref<HTMLElement>();
let chart: VChart | null = null;
let timer: number | null = null;

interface LiveRow {
  time: string;
  value: number;
}

const makeRows = (base: number): LiveRow[] =>
  Array.from({ length: 8 }, (_, index) => ({
    time: `T${index + 1}`,
    value: Math.max(5, Math.round(base + Math.random() * 40 - 20)),
  }));

const buildSpec = (): VChartSpec => ({
    type: 'area',
    autoFit: true,
    data: { values: makeRows(50) },
    xField: 'time',
    yField: 'value',
    line: { style: { curveType: 'monotone' } },
    area: { style: { fillOpacity: 0.15 } },
    axes: [{ orient: 'left', range: { min: 0 } }],
  });

onMounted(() => {
  chart = new VChart(buildSpec(), { dom: chartRef.value });
  chart.renderSync();
  timer = window.setInterval(() => {
    chart?.updateSpec(buildSpec());
  }, 1000);
});

onBeforeUnmount(() => {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
  chart?.release();
  chart = null;
});
</script>
<style lang="less" scoped>
.vc-live {
  width: 100%;
  flex: 1;
  min-height: 0;
}
</style>
