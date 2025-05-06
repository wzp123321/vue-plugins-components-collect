<template>
  <div id="rank-chart" class="rank-chart">
    <div :id="customChartId" class="echarts-container"></div>
    <p v-show="yaxisShowFlag && yaxisText" :style="{ ...yPosition }">
      {{ yaxisText }}
    </p>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, computed, ref, onUnmounted } from 'vue';
import { EChartsType, init } from 'echarts';

import { echartsConstant, echartsOption, echartsUtils } from '../../../../config/echarts/index';
import { thousandSeparation } from '../../../../utils/index';

const customChartId = computed(() => {
  return 'charts_' + (Math.random() * 1000).toFixed(0);
});
const lineChartDataList = [
  {
    id: 1,
    name: '测试1111',
    percent: 37.04,
    value: 1012.93,
  },
  {
    id: 2,
    name: '测试222',
    percent: 25.93,
    value: 709.05,
  },
  {
    id: 5,
    name: '测试333',
    percent: 16.24,
    value: 444.29,
  },
  {
    id: 3,
    name: '测试4444',
    percent: 11.11,
    value: 303.88,
  },
  {
    id: 4,
    name: '测试5555-',
    percent: 9.68,
    value: 264.76,
  },
];
const yaxisText = ref<string>('');
const yaxisShowFlag = ref<boolean>(false);
const yPosition = ref<{ top: string; left: string }>({
  top: '',
  left: '',
});
let echartIns: EChartsType;

function getBarLegendData() {
  return lineChartDataList?.length
    ? lineChartDataList
        .map((item, index) => {
          return {
            name: echartsUtils.resetName(index + 1, item.name),
          };
        })
        .reverse()
    : [];
}
function getYData() {
  return lineChartDataList.map((item, index) => {
    const { name } = item;
    return echartsUtils.resetName(index + 1, name);
  });
}
function getSeriesData() {
  return lineChartDataList.map((item, index) => {
    const { name, value } = item;
    const dataArr: any = setArray(index + 1);
    dataArr.pop();
    dataArr.push({
      value,
    });
    return {
      name: echartsUtils.resetName(index + 1, name),
      type: 'bar',
      stack: 'total',
      emphasis: {
        focus: 'series',
      },
      data: dataArr,
    };
  });
}
/**
 * 获取后缀
 */
function setArray(index: number = 1) {
  const suffixes: any = [];
  for (let idx = 0; idx < index; idx++) {
    suffixes.push({
      value: 0,
    });
  }
  return suffixes;
}
function getEchartsOptions() {
  const unit = 'px';
  const colorArr = echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR.reverse();
  const options = {
    color: colorArr,
    // 悬浮框
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
      },
      backgroundColor: echartsConstant.CHARTS_TOOLTIP_BG_COLOR,
      borderWidth: 0,
      borderColor: echartsConstant.CHARTS_TOOLTIP_BG_COLOR,
      padding: [10, 20],
      textStyle: {
        color: echartsConstant.CHARTS_TOOLTIP_TEXT_COLOR,
        align: 'left',
      },
      formatter: (params: any) => {
        return `${params[0].axisValue}<br/>点能耗：${thousandSeparation(params[0].data.value) ?? '--'}${
          (params[0].data.value ?? '--') !== '--' ? '' : unit
        }`;
      },
    },
    legend: Object.assign(echartsOption.ECHARTS_LINECHART_LEGEND_OPTION, {
      bottom: 10,
      type: 'scroll',
      formatter: echartsUtils.formatterText,
      tooltip: {
        show: true,
      },
      data: getBarLegendData(),
    }),
    grid: echartsOption.ECHARTS_COMMON_GRID_OPTION,
    xAxis: echartsOption.ECHARTS_LINECHART_AXIS_VALUE_OPTION,
    yAxis: Object.assign(echartsOption.ECHARTS_LINECHART_AXIS_CATEGORY_OPTION, {
      name: '能耗 ' + ' (' + unit + ')',
      data: getYData(),
      axisLabel: {
        show: true,
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.65)',
        formatter: echartsUtils.formatterText,
        tooltip: {
          show: true,
        },
      },
      triggerEvent: true,
    }),
    series: getSeriesData(),
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

  echartIns.on('mouseover', (e: any) => {
    handleMouseOver(e);
  });
  echartIns.on('mouseout', () => {
    handleMouseOut();
  });
}

function handleMouseOver(item: any) {
  if (item.componentType === 'yAxis') {
    const { event, value } = item;
    yaxisShowFlag.value = true;
    yaxisText.value = value;
    yPosition.value = {
      top: `${event.offsetY + 30}px`,
      left: `${event.offsetX}px`,
    };
  } else {
    yaxisShowFlag.value = false;
  }
}

function handleMouseOut() {
  yaxisShowFlag.value = false;
}

onMounted(() => {
  initEcharts();
});

onUnmounted(() => {
  if (echartIns) {
    echartIns.off('mouseover', handleMouseOver);
    echartIns.off('mouseout', handleMouseOut);
  }
});
</script>
<style lang="less" scoped>
#rank-chart {
  position: relative;
  width: 100%;
  height: 100%;

  .echarts-container {
    width: 100%;
    height: 100%;

    > div,
    > div > div,
    canvas {
      width: 100%;
      height: 100%;
    }
  }

  p {
    position: absolute;
    padding: 5px 12px;
    font-size: 14px;
    color: #ffffff;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 4px;
    max-width: 400px;
  }
}
</style>
