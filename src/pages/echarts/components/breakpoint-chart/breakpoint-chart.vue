<template>
  <div id="breakpoint-chart" class="breakpoint-chart">
    <div :id="customChartId" class="echarts-container"></div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, computed } from 'vue';
import { init } from 'echarts';

import { echartsConstant, echartsOption, echartsUtils } from '../../../../config/echarts/index';
import { thousandSeparation } from '../../../../utils/index';

const customChartId = computed(() => `charts_${(Math.random() * 1000).toFixed(0)}`);

let echartIns: any;

function getXaxisData() {
  return ['2022-10-01', '2022-10-02', '2022-10-03', '2022-10-04', '2022-10-05', '2022-10-06'];
}
function getEchartsOptions() {
  const unit = 'px';
  const actualValueList: (number | null)[] = [222, 342, 1245, null, 543, null];
  const averageValueList: (number | null)[] = [122, 542, 345, null, null, 233];
  const benchmarkValueList: (number | null)[] = [33, null, 677, 302, null, 54];

  const options = {
    color: echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR,
    title: {
      text: `单位（${unit}）`,
      textStyle: {
        color: 'rgba(0, 0, 0, 0.45)',
        fontSize: 14,
      },
      top: 20,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: echartsConstant.CHARTS_TOOLTIP_BG_COLOR,
      padding: echartsConstant.CHARTS_TOOLTIP_PADDING,
      shadowColor: echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_COLOR,
      shadowOffsetX: echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_OFFSETX,
      shadowOffsetY: echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_OFFSETY,
      textStyle: {
        color: echartsConstant.CHARTS_TOOLTIP_TEXT_COLOR,
        align: 'left',
      },
      axisPointer: {
        type: 'line',
        snap: true,
        animation: false,
        lineStyle: {
          type: 'solid',
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 1,
                color: 'rgba(24, 144, 255, 0.01)', // 0% 处的颜色
              },
              {
                offset: 0,
                color: '#1890ff', // 100% 处的颜色
              },
            ],
            global: false, // 缺省为 false
          },
        },
      },
      formatter: (params: any) => {
        let htmlStr = `<span style="margin-bottom:10px">${params[0].axisValue || '--'}</span></br>`;
        params.forEach((item: any) => {
          htmlStr += `<span style="line-height:23px">
                                <span style="display:inline-block;padding-right:6px">${
                                  item.seriesName || '--'
                                }：</span>${
                                  Object.prototype.toString.call(item.value) !== '[object Null]' &&
                                  Object.prototype.toString.call(item.value) !== '[object Undefined]'
                                    ? thousandSeparation(item.value)
                                    : '--'
                                }
                                <span style="display:inline-block">${
                                  Object.prototype.toString.call(item.value) !== '[object Null]' &&
                                  Object.prototype.toString.call(item.value) !== '[object Undefined]'
                                    ? unit
                                    : ''
                                }</span></span></br>`;
        });
        htmlStr += '</span>';
        return htmlStr;
      },
    },
    legend: {
      type: 'scroll',
      itemWidth: 20,
      itemHeight: 2,
      icon: 'rect',
      itemGap: 60,
    },
    grid: {
      left: '1%',
      right: '0%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: Object.assign(echartsOption.ECHARTS_LINECHART_AXIS_CATEGORY_OPTION, {
      data: getXaxisData(),
    }),
    yAxis: echartsOption.ECHARTS_LINECHART_AXIS_VALUE_OPTION,
    series: [
      {
        name: '实际值',
        type: 'line',
        itemStyle: {
          borderWidth: 20,
        },
        symbol: 'circle',
        symbolSize: 16,
        showSymbol: true,
        emphasis: {
          scale: false,
          itemStyle: echartsUtils.getsymbolStyle(echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[0]),
        },
        data: echartsUtils.getDataIsShowDot(actualValueList, echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[0]),
      },
      {
        name: '平均值',
        type: 'line',
        itemStyle: {
          borderWidth: 20,
        },
        symbol: 'circle',
        symbolSize: 16,
        showSymbol: true,
        emphasis: {
          scale: false,
          itemStyle: echartsUtils.getsymbolStyle(echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[1]),
        },
        data: echartsUtils.getDataIsShowDot(averageValueList, echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[1]),
      },
      {
        name: '标杆值',
        type: 'line',
        itemStyle: {
          borderWidth: 20,
        },
        emphasis: {
          scale: false,
          itemStyle: echartsUtils.getsymbolStyle(echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[2]),
        },
        symbolSize: 16,
        symbol: 'circle',
        showSymbol: true,
        data: echartsUtils.getDataIsShowDot(benchmarkValueList, echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[2]),
      },
    ],
  };

  return options;
}
function initEcharts() {
  const ele = document.getElementById(customChartId.value);
  if (!ele) {
    return;
  }
  echartIns = init(ele);
  echartIns.clear();
  echartIns.setOption(getEchartsOptions());
}

onMounted(() => {
  initEcharts();

  window.addEventListener('resize', () => {
    if (echartIns) {
      initEcharts();
    }
  });
});
</script>
<style lang="less" scoped>
.breakpoint-chart {
  width: 100%;
  height: 100%;

  .echarts-container {
    width: 100%;
    height: 100%;

    canvas {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
