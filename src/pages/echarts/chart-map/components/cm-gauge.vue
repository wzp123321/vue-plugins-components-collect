<template>
  <div class="cm-gauge" ref="chartRef"></div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import { useECharts } from '../../../../hook/useECharts';
import { EChartsOption } from 'echarts';

const { chartRef, addResize, removeResize, initCharts } = useECharts();
/**
 * 生成配置
 */
const mapOptions = (): EChartsOption => {
  return {
    grid: {
      top: '0',
      bottom: '0',
      left: '0',
      right: '0',
    },
    series: [
      {
        type: 'gauge',
        axisLine: {
          lineStyle: {
            width: 30,
            color: [
              [0.3, '#67e0e3'],
              [0.7, '#37a2da'],
              [1, '#fd666d'],
            ],
          },
        },
        pointer: {
          itemStyle: {
            color: 'auto',
          },
        },
        axisTick: {
          distance: -30,
          length: 8,
          lineStyle: {
            color: '#fff',
            width: 2,
          },
        },
        splitLine: {
          distance: -30,
          length: 30,
          lineStyle: {
            color: '#fff',
            width: 4,
          },
        },
        axisLabel: {
          color: 'inherit',
          distance: 40,
          fontSize: 16,
        },
        detail: {
          valueAnimation: true,
          formatter: '{value} km/h',
          color: 'inherit',
        },
        data: [
          {
            value: 70,
          },
        ],
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
.cm-gauge {
  width: 100%;
  height: 100%;

  * {
    width: 100%;
    height: 100%;
  }
}
</style>
