<template>
  <div ref="chartRef" class="vc-bar"></div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import VChart from '@visactor/vchart';

const chartRef = ref<HTMLElement>();
let chart: VChart | null = null;

onMounted(() => {
  chart = new VChart(
    {
      type: 'bar',
      autoFit: true,
      data: {
        values: [
          { category: '周一', direct: 120, referral: 86 },
          { category: '周二', direct: 98, referral: 72 },
          { category: '周三', direct: 140, referral: 95 },
          { category: '周四', direct: 110, referral: 88 },
          { category: '周五', direct: 160, referral: 120 },
        ],
      },
      xField: ['category'],
      yField: ['direct', 'referral'],
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
.vc-bar {
  width: 100%;
  flex: 1;
  min-height: 0;
}
</style>
