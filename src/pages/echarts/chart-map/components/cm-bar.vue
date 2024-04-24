<template>
  <div class="cm-bar" ref="chartRef"></div>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts';
import { onMounted, onUnmounted } from 'vue';
import { useECharts } from '../../../../hook/useECharts';
import { EChartsOption } from 'echarts';
import { formatFontSize } from '@/utils';

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
    legend: [
      {
        bottom: '2.5%',
        left: '60%',
        textStyle: {
          color: '#fff',
          fontSize: formatFontSize(10),
          fontFamily: '微软雅黑',
        },
        itemWidth: formatFontSize(10),
        itemHeight: formatFontSize(10),
        data: [
          {
            name: '1',
            icon: 'rect',
          },
        ],
      },
      {
        data: [
          {
            name: '2',
            icon: 'rect',
          },
        ],
        itemWidth: formatFontSize(10),
        itemHeight: formatFontSize(2),
        bottom: '2.5%',
        left: '40%',
        textStyle: {
          color: '#fff',
          fontSize: formatFontSize(10),
        },
      },
    ],
    grid: {
      top: '16%',
      right: '10%',
      left: '10%',
      bottom: '20%',
    },
    xAxis: [
      {
        type: 'category',
        axisLabel: {
          color: '#fff',
          interval: 0,
          fontSize: formatFontSize(10),
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#0a3e98',
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: '#195384',
            type: 'dotted',
          },
        },
        data: ['1月', '2月', '3月', '4月', '5月'],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'c',
        min: 0,
        nameTextStyle: {
          color: '#fff',
          fontSize: formatFontSize(12),
        },
        axisLine: {
          lineStyle: {
            color: '#0a3e98',
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#0a3e98',
            type: 'dotted',
          },
        },
        axisLabel: {
          formatter: '{value}',
          color: '#fff',
          fontSize: formatFontSize(10),
        },
      },
      {
        type: 'value',
        name: '%',
        min: 0,
        nameTextStyle: {
          color: '#fff',
          fontSize: formatFontSize(10),
        },
        axisLine: {
          lineStyle: {
            color: '#0a3e98',
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#0a3e98',
            type: 'dotted',
          },
        },
        axisLabel: {
          formatter: '{value}',
          color: '#fff',
          fontSize: formatFontSize(10),
        },
      },
    ],
    series: [
      {
        name: '1',
        type: 'pictorialBar',
        symbolSize: [formatFontSize(6), formatFontSize(4)],
        symbolOffset: [formatFontSize(0), formatFontSize(-6)],
        symbolPosition: 'end',
        z: 12,
        // "barWidth": "0",
        tooltip: {
          show: false,
        },
        color: '#008ed7',
        data: ['43', '19', '18', '32', '17'],
      },
      {
        name: '',
        type: 'pictorialBar',
        symbolSize: [formatFontSize(6), formatFontSize(4)],
        symbolOffset: [0, formatFontSize(4)],
        z: 12,
        tooltip: {
          show: false,
        },
        color: '#00abff',
        data: ['43', '19', '18', '32', '17'],
      },
      {
        type: 'bar',
        //silent: true,
        barWidth: formatFontSize(6),
        barGap: '10%', // Make series be overlap
        barCateGoryGap: '10%',
        itemStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 0.7, [
              {
                offset: 0,
                color: '#00d7ff',
              },
              {
                offset: 1,
                color: '#00abff',
              },
            ]),
            opacity: 1,
          },
        },
        data: ['43', '19', '18', '32', '17'],
      },
      {
        name: '2',
        type: 'line',
        yAxisIndex: 1,
        symbol: 'circle', // 默认是空心圆（中间是白色的），改成实心圆
        // smooth: true,
        lineStyle: {
          normal: {
            width: formatFontSize(2),
            color: '#29a5d5', // 线条颜色
          },
        },
        itemStyle: {
          normal: {
            color: '#071c33', //拐点颜色
            borderColor: '#2db6e9', //拐点边框颜色
            borderWidth: formatFontSize(1), //拐点边框大小
            // label: {
            //    show: true, //开启显示
            //    color: '#fff',
            //    position: 'top', //在上方显示
            //    formatter: function (res) {
            //       if (res.value) {
            //          return res.value
            //       } else {
            //          return 0
            //       }
            //    },
            // },
          },
        },
        symbolSize: formatFontSize(6), //设定实心点的大小
        areaStyle: {
          normal: {
            //线性渐变，前4个参数分别是x0,y0,x2,y2(范围0~1);相当于图形包围盒中的百分比。如果最后一个参数是‘true’，则该四个值是绝对像素位置。
            color: new echarts.graphic.LinearGradient(
              0,
              0,
              0,
              1,
              [
                {
                  offset: 0,
                  color: '#29a5d530',
                },
                {
                  offset: 0.6,
                  color: '#29a5d520',
                },
                {
                  offset: 1,
                  color: '#29a5d510',
                },
              ],
              false,
            ),
          },
        },
        data: [40, 50, 35, 41, 85],
      },
    ],
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
.cm-bar {
  width: 100%;
  height: 100%;

  * {
    width: 100%;
    height: 100%;
  }
}
</style>
../../../../hooks/useECharts
