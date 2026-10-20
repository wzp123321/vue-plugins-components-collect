<template>
  <div ref="chartRef" class="vc-pie"></div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import VChart from '@visactor/vchart';

const chartRef = ref<HTMLElement>();
let chart: VChart | null = null;

onMounted(() => {
  chart = new VChart(
    {
      type: 'pie',
      autoFit: true,
      data: {
        values: [
          { type: '搜索', value: 1048 },
          { type: '直接访问', value: 735 },
          { type: '邮件营销', value: 580 },
          { type: '联盟广告', value: 484 },
          { type: '视频广告', value: 300 },
        ],
      },
      categoryField: 'type',
      valueField: 'value',
      innerRadius: 0.6,
      outerRadius: 0.9,
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
.vc-pie {
  width: 100%;
  flex: 1;
  min-height: 0;
}
</style>
