<script lang="ts" setup>
import ChartBox from '../../components/ChartBox.vue';
import { getPayChannel } from '../../utils/mockData';
import type { EChartsOption } from '../../hooks/useECharts';

const palette = ['#4cf3ff', '#409eff', '#ff9a3c', '#a280ff', '#4caf50'];
const data = getPayChannel().map(
  (d: { name: string; value: number }, i: number) => ({
    ...d,
    itemStyle: { color: palette[i] },
  }),
);

const option: EChartsOption = {
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(8,22,48,0.9)',
    borderColor: '#409eff',
    textStyle: { color: '#e6f1ff' },
  },
  legend: {
    bottom: 0,
    textStyle: { color: 'rgba(230,241,255,0.7)', fontSize: 12 },
    itemWidth: 8,
    itemHeight: 8,
  },
  series: [
    {
      name: '支付方式',
      type: 'pie',
      radius: ['18%', '70%'],
      center: ['50%', '45%'],
      roseType: 'radius',
      itemStyle: {
        borderRadius: 4,
        borderColor: 'rgba(8,22,48,0.8)',
        borderWidth: 2,
      },
      label: {
        color: 'rgba(230,241,255,0.85)',
        fontSize: 11,
        formatter: '{b}\n{d}%',
      },
      labelLine: { lineStyle: { color: 'rgba(64,158,255,0.4)' } },
      data,
    },
  ],
};
</script>

<template>
  <ChartBox :option="option" />
</template>
