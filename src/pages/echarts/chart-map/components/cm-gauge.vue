<template>
  <div class="cm-gauge" ref="chartRef"></div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import { useEChartsInit } from '../../../../hooks/useEChartsInit';
import { EChartsOption } from 'echarts';
import { formatFontSize } from '@/utils';

const { chartRef, addResize, removeResize, initCharts } = useEChartsInit();
/**
 * 生成配置
 */
const mapOptions = (): EChartsOption => {
  return {
    grid: {
      top: '0%',
      bottom: '0%',
      left: '0%',
      right: '0%',
    },
    series: [
      {
        type: 'gauge',
        center: ['50%', '60%'],
        axisLine: {
          lineStyle: {
            width: formatFontSize(20),
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
          distance: formatFontSize(-50),
          length: formatFontSize(10),
          lineStyle: {
            color: '#fff',
            width: formatFontSize(2),
          },
        },
        splitLine: {
          distance: formatFontSize(-50),
          length: formatFontSize(30),
          lineStyle: {
            color: '#fff',
            width: formatFontSize(4),
          },
        },
        axisLabel: {
          color: 'inherit',
          distance: formatFontSize(46),
          fontSize: formatFontSize(12),
        },
        detail: {
          valueAnimation: true,
          formatter: '{value} km/h',
          color: 'inherit',
          fontSize: formatFontSize(18),
          offset: formatFontSize(40),
        },
        data: [
          {
            value: 70,
          },
        ],
      },
    ] as any,
  };
};

onMounted(() => {
  initCharts(mapOptions());
  addResize();
});
onUnmounted(() => {
  removeResize();
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
../../../../hooks/useEChartsInit
