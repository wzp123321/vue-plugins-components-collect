<template>
  <div class="bc-pm-chart" id="bc-pm-chart">
    <div :id="chartId"></div>
  </div>
</template>
<script lang="ts" setup>
import {
  init,
  EChartsType,
  EChartsOption,
  TooltipComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
  SeriesOption,
  LegendComponentOption,
} from 'echarts';
import { computed, onMounted } from 'vue';

let chartInstance: EChartsType;

const chartId = computed(() => {
  return `charts-${(Math.random() * 100000000).toFixed(0)}`;
});

function initChart() {
  const chartContainer = document.querySelector(`#${chartId.value}`);
  if (!chartContainer) {
    return;
  }
  if (chartInstance) {
    chartInstance.dispose();
  }
  chartInstance = init(chartContainer as HTMLElement);

  const options: EChartsOption = getChartOptions();
  chartInstance.clear();
  chartInstance.setOption(options);
}
function getChartOptions(): EChartsOption {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['Profit', 'Expenses', 'Income'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'value',
      },
    ],
    yAxis: [
      {
        type: 'category',
        axisTick: {
          show: false,
        },
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
    ],
    series: [
      {
        name: 'Profit',
        type: 'bar',
        label: {
          show: true,
          position: 'inside',
        },
        emphasis: {
          focus: 'series',
        },
        data: [200, 170, 240, 244, 200, 220, 210],
      },
      {
        name: 'Income',
        type: 'bar',
        stack: 'Total',
        label: {
          show: true,
        },
        emphasis: {
          focus: 'series',
        },
        data: [320, 302, 341, 374, 390, 450, 420],
      },
      {
        name: 'Expenses',
        type: 'bar',
        stack: 'Total',
        label: {
          show: true,
          position: 'left',
        },
        emphasis: {
          focus: 'series',
        },
        data: [-120, -132, -101, -134, -190, -230, -210],
      },
    ],
  };
}

onMounted(() => {
  initChart();
});
</script>
<style lang="less" scoped>
#bc-pm-chart {
  width: 100%;
  height: 100%;

  * {
    width: 100%;
    height: 100%;
  }
}
</style>
