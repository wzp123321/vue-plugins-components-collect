<script lang="ts" setup>
import ChartBox from '../../components/ChartBox.vue';
import { getSourceDist } from '../../utils/mockData';
import type { EChartsOption } from '../../hooks/useECharts';

const palette = ['#4cf3ff', '#409eff', '#ff9a3c', '#ff5c5c', '#a280ff'];
const data = getSourceDist().map((d: { name: string; value: number }, i: number) => ({
  ...d,
  itemStyle: { color: palette[i] },
}));

const option: EChartsOption = {
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(8,22,48,0.9)',
    borderColor: '#409eff',
    textStyle: { color: '#e6f1ff' },
  },
  legend: {
    orient: 'vertical',
    right: 8,
    top: 'middle',
    textStyle: { color: 'rgba(230,241,255,0.75)', fontSize: 12 },
    itemWidth: 8,
    itemHeight: 8,
    formatter: (name: string) => {
      const item = data.find((d) => d.name === name);
      return `${name}  ${item?.value ?? ''}`;
    },
  },
  series: [
    {
      name: '来源',
      type: 'pie',
      radius: ['38%', '62%'],
      center: ['38%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderColor: 'rgba(8,22,48,0.8)', borderWidth: 2 },
      label: { show: false },
      labelLine: { show: false },
      data,
    },
  ],
};
</script>

<template>
  <ChartBox :option="option" />
</template>
