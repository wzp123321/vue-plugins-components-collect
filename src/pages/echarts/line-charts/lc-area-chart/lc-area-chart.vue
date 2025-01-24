<template>
  <div class="lc-area-chart" id="lc-area-chart">
    <div :id="customChartId"></div>
  </div>
</template>
<script lang="ts" setup>
import { init } from 'echarts';
import { computed, onMounted } from 'vue';

let echartIns: any;

const customChartId = computed(() => {
  return 'charts_' + (Math.random() * 1000).toFixed(0);
});

function initCharts() {
  const ele = document.getElementById(customChartId.value);
  if (!ele) {
    return;
  }
  echartIns = init(ele);
  echartIns.clear();
  echartIns.setOption(mapEchartsOptions());
}

function mapEchartsOptions() {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    legend: {
      data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: [
      {
        name: 'Email',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series',
        },
        data: [120, 132, 101, 134, 90, 230, 210],
      },
      {
        name: 'Union Ads',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series',
        },
        data: [220, 182, 191, 234, 290, 330, 310],
      },
      {
        name: 'Video Ads',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series',
        },
        data: [150, 232, 201, 154, 190, 330, 410],
      },
      {
        name: 'Direct',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series',
        },
        data: [320, 332, 301, 334, 390, 330, 320],
      },
      {
        name: 'Search Engine',
        type: 'line',
        stack: 'Total',
        label: {
          show: true,
          position: 'top',
        },
        areaStyle: {},
        emphasis: {
          focus: 'series',
        },
        data: [820, 932, 901, 934, 1290, 1330, 1320],
      },
    ],
  };
}

onMounted(() => {
  initCharts();
});
</script>
<style lang="less" scoped>
#lc-area-chart {
  width: 100%;
  height: 100%;

  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
