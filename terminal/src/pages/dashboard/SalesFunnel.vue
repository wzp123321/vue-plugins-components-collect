<script lang="ts" setup>
import ChartBox from '../../components/ChartBox.vue';
import { getSalesFunnel } from '../../utils/mockData';
import type { EChartsOption } from '../../hooks/useECharts';

const option: EChartsOption = {
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(8,22,48,0.9)',
    borderColor: '#409eff',
    textStyle: { color: '#e6f1ff' },
    formatter: '{b}: {c}',
  },
  series: [
    {
      name: '销售漏斗',
      type: 'funnel',
      left: '8%',
      right: '8%',
      top: 16,
      bottom: 16,
      width: '84%',
      sort: 'descending',
      gap: 4,
      minSize: '20%',
      maxSize: '100%',
      label: {
        show: true,
        position: 'inside',
        color: '#fff',
        formatter: '{b}\n{c}',
      },
      labelLine: { show: false },
      itemStyle: { borderColor: 'rgba(8,22,48,0.8)', borderWidth: 2 },
      data: getSalesFunnel().map((d, i) => ({
        ...d,
        itemStyle: {
          color: ['#4cf3ff', '#409eff', '#ff9a3c', '#ff5c5c'][i],
        },
      })),
    },
  ],
};
</script>

<template>
  <ChartBox :option="option" />
</template>
