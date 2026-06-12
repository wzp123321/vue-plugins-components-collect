<script lang="ts" setup>
import { ref } from 'vue';
import ChartBox from '../../components/ChartBox.vue';
import { getRegionData } from '../../utils/mockData';
import { useInterval } from '../../hooks/useInterval';
import type { EChartsOption } from '../../hooks/useECharts';

const option = ref<EChartsOption>(buildOption(getRegionData()));
useInterval(() => {
  option.value = buildOption(getRegionData());
}, 7000);

function buildOption(data: ReturnType<typeof getRegionData>): EChartsOption {
  return {
    grid: { left: 60, right: 24, top: 16, bottom: 16 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(8,22,48,0.9)',
      borderColor: '#409eff',
      textStyle: { color: '#e6f1ff' },
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(64,158,255,0.1)' } },
      axisLabel: { color: 'rgba(230,241,255,0.6)' },
    },
    yAxis: {
      type: 'category',
      data: data.regions,
      axisLine: { lineStyle: { color: 'rgba(64,158,255,0.4)' } },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(230,241,255,0.7)' },
    },
    series: [
      {
        type: 'bar',
        data: data.values,
        barWidth: 12,
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: 'rgba(64,158,255,0.2)' },
              { offset: 1, color: '#4cf3ff' },
            ],
          },
        },
        label: {
          show: true,
          position: 'right',
          color: '#4cf3ff',
          fontSize: 11,
        },
      },
    ],
  };
}
</script>

<template>
  <ChartBox :option="option" />
</template>
