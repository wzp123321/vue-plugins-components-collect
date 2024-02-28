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
    grid: {
      left: '10%',
      right: '8%',
      top: '8%',
      bottom: '24%',
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLabel: {
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
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
    },
    series: [
      {
        name: 'Direct',
        type: 'bar',
        emphasis: {
          focus: 'series',
        },
        data: [320, 332, 301, 334, 390, 330, 320],
      },
      {
        name: 'Email',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        data: [120, 132, 101, 134, 90, 230, 210],
      },
      {
        name: 'Union Ads',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        data: [220, 182, 191, 234, 290, 330, 310],
      },
      {
        name: 'Video Ads',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series',
        },
        data: [150, 232, 201, 154, 190, 330, 410],
      },
      {
        name: 'Search Engine',
        type: 'bar',
        data: [862, 1018, 964, 1026, 1679, 1600, 1570],
        emphasis: {
          focus: 'series',
        },
        markLine: {
          lineStyle: {
            type: 'dashed',
          },
          data: [[{ type: 'min' }, { type: 'max' }]],
        },
      },
      {
        name: 'Baidu',
        type: 'bar',
        barWidth: 5,
        stack: 'Search Engine',
        emphasis: {
          focus: 'series',
        },
        data: [620, 732, 701, 734, 1090, 1130, 1120],
      },
      {
        name: 'Google',
        type: 'bar',
        stack: 'Search Engine',
        emphasis: {
          focus: 'series',
        },
        data: [120, 132, 101, 134, 290, 230, 220],
      },
      {
        name: 'Bing',
        type: 'bar',
        stack: 'Search Engine',
        emphasis: {
          focus: 'series',
        },
        data: [60, 72, 71, 74, 190, 130, 110],
      },
      {
        name: 'Others',
        type: 'bar',
        stack: 'Search Engine',
        emphasis: {
          focus: 'series',
        },
        data: [62, 82, 91, 84, 109, 110, 120],
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
