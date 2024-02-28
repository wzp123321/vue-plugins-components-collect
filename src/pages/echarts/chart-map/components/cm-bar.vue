<template>
  <div class="cm-bar" ref="chartRef"></div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import { useECharts } from '../../../../hook/useECharts';
import { EChartsOption, format } from 'echarts';

const { chartRef, addResize, removeResize, initCharts } = useECharts();
/**
 * 生成配置
 */
const mapOptions = (): EChartsOption => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      show: false,
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '15%',
      bottom: '30%',
    },
    xAxis: {
      type: 'value',
      name: 'Days',
      axisLabel: {
        formatter: '{value}',
      },
    },
    yAxis: {
      type: 'category',
      data: ['City Alpha1', 'City Beta2', 'City Gamma3', 'City Alpha4', 'City Beta5', 'City Gamma6'],
      nameTextStyle: {
        color: 'rgba(0, 0, 0, 0.65)',
        fontSize: 14,
        padding: [46, 0, 0, 0],
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.15)',
        },
      },
      // 轴文本
      axisLabel: {
        show: true,
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.65)',
        formatter: (name: string) => {
          return format.truncateText(name, 100, '14px Microsoft Yahei', '…', {});
        },
      },
      // 刻度
      axisTick: {
        show: false,
      },
      // 分割线
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.15)',
        },
      },
    },
    legend: {
      itemHeight: 10,
      itemWidth: 10,
      textStyle: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.65)',
      },
      bottom: 10,
      formatter: (name: string) => {
        return format.truncateText(name, 100, '14px Microsoft Yahei', '…', {});
      },
      tooltip: {
        show: true,
      },
    },
    series: [
      {
        name: 'City Alpha1',
        type: 'bar',
        stack: 'total',
        data: [165, null, null, null, null, null],
      },
      {
        name: 'City Beta2',
        type: 'bar',
        stack: 'total',
        data: [null, 105, null, null, null, null],
      },
      {
        name: 'City Gamma3',
        type: 'bar',
        stack: 'total',
        data: [null, null, 63, null, null, null],
      },
      {
        name: 'City Alpha4',
        type: 'bar',
        stack: 'total',
        data: [null, null, null, 100, null, null],
      },
      {
        name: 'City Beta5',
        type: 'bar',
        stack: 'total',
        data: [null, null, null, null, 120, null],
      },
      {
        name: 'City Gamma6',
        type: 'bar',
        stack: 'total',
        data: [null, null, null, null, null, 144],
      },
    ],
  };
};

onMounted(() => {
  initCharts(mapOptions());
  addResize;
});
onUnmounted(() => {
  removeResize;
});
</script>

<style lang="less" scoped>
.cm-bar {
  width: 100%;
  height: 100%;

  * {
    width: 100%;
    height: 100%;
  }
}
</style>
