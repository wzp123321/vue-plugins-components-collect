<template>
  <div ref="chartRef" class="vc-combo"></div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import VChart from '@visactor/vchart';

const chartRef = ref<HTMLElement>();
let chart: VChart | null = null;

onMounted(() => {
  chart = new VChart(
    {
      type: 'common',
      autoFit: true,
      data: {
        values: [
          { month: '1月', sales: 320, rate: 0.12 },
          { month: '2月', sales: 280, rate: 0.18 },
          { month: '3月', sales: 410, rate: 0.22 },
          { month: '4月', sales: 360, rate: 0.16 },
          { month: '5月', sales: 480, rate: 0.28 },
          { month: '6月', sales: 520, rate: 0.31 },
        ],
      },
      series: [
        { type: 'bar', id: 'bar0', dataIndex: 0, xField: 'month', yField: 'sales' },
        { type: 'line', id: 'line0', dataIndex: 0, xField: 'month', yField: 'rate' },
      ],
      axes: [
        {
          orient: 'left',
          seriesId: ['bar0'],
          title: { visible: true, text: '销售额(万)' },
        },
        {
          orient: 'right',
          seriesId: ['line0'],
          title: { visible: true, text: '转化率' },
        },
        { orient: 'bottom', type: 'band', title: { visible: true, text: '月份' } },
      ],
      legends: { visible: true, orient: 'top' },
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
.vc-combo {
  width: 100%;
  flex: 1;
  min-height: 0;
}
</style>
