<template>
  <div class="ecc-chart-bar" id="ecc-chart-bar" :style="{ height: `${props.height}px` }">
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
import { computed, onUnmounted, onMounted, PropType, watch } from 'vue';
import { ECC_IChartVO } from '../../energy-consumption-control.api';

import { echartsConstant } from '../../../../config/echarts/index';
import { thousandSeparation } from '@/utils';

const props = defineProps({
  dataList: {
    type: Array as PropType<ECC_IChartVO[]>,
    default: [],
  },
  height: {
    type: Number,
    default: 300,
  },
  gridOption: {
    type: Object as PropType<{ top: string; left: string; bottom: string; right: string }>,
  },
  colors: {
    type: Array as PropType<string[]>,
    default: [],
  },
});

let chartInstance: EChartsType;

const chartId = computed(() => {
  return `charts-${(Math.random() * 100000000).toFixed(0)}`;
});
const yMinMaxOption = computed(() => {
  return !props.dataList ||
    props.dataList?.length === 0 ||
    props?.dataList?.every((item) => {
      return item?.dataList?.length === 0;
    })
    ? {
        min: 0,
        max: (value: any) => {
          if (!value.max) {
            return 1;
          } else {
            return value.max;
          }
        },
      }
    : {};
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
    color: props.colors,
    tooltip: useTooltipOption(),
    grid: {
      left: '2%',
      right: '3%',
      top: '13%',
      bottom: '5%',
      ...props.gridOption,
      containLabel: true,
    },
    legend: useLegendOprion(),
    xAxis: useXaxisOption(),
    yAxis: useYaxisOption(),
    series: useSeriesOption(),
  };
}
function useTooltipOption(): TooltipComponentOption {
  const unit = props.dataList?.[0]?.unit ?? '';
  return {
    show: true,
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
      let htmlStr = '';
      const item = params[params?.[0].dataIndex];
      htmlStr += `<div>
           <span>${item.seriesName}：</span>
           <span>${
             Object.prototype.toString.call(item.value) !== '[object Null]' &&
             Object.prototype.toString.call(item.value) !== '[object Undefined]' &&
             item.value !== '--'
               ? `${thousandSeparation(item.value)} ${unit}`
               : '-'
           }</span>
          </div>`;
      htmlStr += '</div>';
      return htmlStr;
    },
  };
}
function useLegendOprion(): LegendComponentOption {
  return {
    type: 'scroll',
    itemWidth: 12,
    itemHeight: 12,
    icon: 'rect',
    itemGap: 16,
    borderRadius: 2,
    top: 2,
  };
}
function useXaxisOption(): XAXisComponentOption {
  const { CHARTS_AXIS_TEXT_COLOR, CHARTS_AXIS_LINE_COLOR } = echartsConstant;
  return {
    type: 'category',
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: CHARTS_AXIS_TEXT_COLOR,
      margin: 12,
    },
    axisLine: {
      lineStyle: {
        color: CHARTS_AXIS_LINE_COLOR,
      },
    },
    data: props.dataList?.map((item) => {
      return item.typeName;
    }),
  };
}
function useYaxisOption(): YAXisComponentOption {
  const { CHARTS_AXIS_TEXT_SHADOW_COLOR } = echartsConstant;
  return {
    type: 'value',
    name: props.dataList?.[0]?.unit,
    nameTextStyle: {
      color: CHARTS_AXIS_TEXT_SHADOW_COLOR,
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: 'rgba(0, 0, 0, 0.15)',
        type: 'dashed',
      },
    },
    ...yMinMaxOption.value,
  };
}
function useSeriesOption(): SeriesOption[] {
  return props.dataList.map((item, index) => {
    return {
      data: mapData(index, item.dataList?.[0] ?? null),
      type: 'bar',
      stack: 'total',
      name: item.typeName,
      barWidth: 60,
    };
  });
}
function mapData(index: number, value: number | null) {
  let list = ['--', '--', '--'];
  list[index] = value !== null ? value + '' : '--';
  return list;
}
watch(() => props.dataList, initChart);
onMounted(() => {
  initChart();

  window.addEventListener('resize', initChart);
});
onUnmounted(() => {
  window.removeEventListener('resize', initChart);
});
</script>
<style lang="less" scoped>
#ecc-chart-bar {
  position: relative;
  width: 100%;

  * {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>
