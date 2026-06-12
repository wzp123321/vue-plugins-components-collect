<script lang="ts" setup>
import { ref } from 'vue';
import ChartBox from '../../components/ChartBox.vue';
import { getUserTrend } from '../../utils/mockData';
import { useInterval } from '../../hooks/useInterval';
import type { EChartsOption } from '../../hooks/useECharts';

const option = ref<EChartsOption>(buildOption(getUserTrend()));
useInterval(() => {
  option.value = buildOption(getUserTrend());
}, 6000);

function buildOption(data: ReturnType<typeof getUserTrend>): EChartsOption {
  return {
    grid: { left: 30, right: 16, top: 36, bottom: 24 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(8,22,48,0.9)',
      borderColor: '#409eff',
      textStyle: { color: '#e6f1ff' },
    },
    legend: {
      data: ['访问量', '下单数'],
      textStyle: { color: 'rgba(230,241,255,0.7)' },
      top: 4,
      right: 8,
    },
    xAxis: {
      type: 'category',
      data: data.days,
      axisLine: { lineStyle: { color: 'rgba(64,158,255,0.4)' } },
      axisLabel: { color: 'rgba(230,241,255,0.7)' },
    },
    yAxis: [
      {
        type: 'value',
        name: '访问',
        nameTextStyle: { color: 'rgba(230,241,255,0.5)' },
        splitLine: { lineStyle: { color: 'rgba(64,158,255,0.1)' } },
        axisLabel: { color: 'rgba(230,241,255,0.6)' },
      },
      {
        type: 'value',
        name: '订单',
        nameTextStyle: { color: 'rgba(230,241,255,0.5)' },
        splitLine: { show: false },
        axisLabel: { color: 'rgba(230,241,255,0.6)' },
      },
    ],
    series: [
      {
        name: '访问量',
        type: 'line',
        smooth: true,
        yAxisIndex: 0,
        data: data.pv,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#4cf3ff' },
        itemStyle: { color: '#4cf3ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(76,243,255,0.4)' },
              { offset: 1, color: 'rgba(76,243,255,0)' },
            ],
          },
        },
      },
      {
        name: '下单数',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: data.order,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#ff9a3c' },
        itemStyle: { color: '#ff9a3c' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255,154,60,0.35)' },
              { offset: 1, color: 'rgba(255,154,60,0)' },
            ],
          },
        },
      },
    ],
  };
}
</script>

<template>
  <ChartBox :option="option" />
</template>
