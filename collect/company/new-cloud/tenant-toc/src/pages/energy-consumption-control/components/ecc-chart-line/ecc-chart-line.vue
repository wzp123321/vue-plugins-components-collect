<template>
  <div class="ecc-chart-line" id="ecc-chart-line" :style="{ height: `${props.height}px` }">
    <div :id="chartId"></div>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, onUnmounted, PropType, watch } from 'vue';
import {
  init,
  EChartsType,
  EChartsOption,
  TooltipComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
  SeriesOption,
} from 'echarts';
import { echartsUtils, echartsConstant } from '../../../../config/echarts/index';

import { thousandSeparation } from '@/utils';
import { ECC_DOWNLOAD_COLOR, ECC_IChartVO } from '../../energy-consumption-control.api';

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
    type: Object as PropType<{
      top: string;
      left: string;
      bottom: string;
      right: string;
    }>,
  },
  colors: {
    type: Array as PropType<string[]>,
    default: [],
  },
  isPriceFlag: {
    type: Boolean,
    default: false,
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
      return item?.dataList?.length === 0 || item?.dataList?.every((item) => item === null);
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
    legend: useLegendOprion(),
    grid: {
      left: '3%',
      right: '4%',
      top: '15%',
      bottom: '4%',
      containLabel: true,
      ...props.gridOption,
    },
    xAxis: useXaxisOption(),
    yAxis: useYaxisOption(),
    series: useSeriesOption(),
  };
}
function useTooltipOption(): TooltipComponentOption {
  const unit = props.dataList?.[0]?.unit;
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
      let htmlStr = `<div style="color: #fff;padding: 0 8px"><p style="color: #fff;margin-bottom: 4px">${params?.[0].axisValue}</p>`;
      params.forEach((item: any) => {
        htmlStr += `<div style="margin-bottom: 4px">
           <span>${item.seriesName}：</span>
           <span>${
             Object.prototype.toString.call(item.value) !== '[object Null]' &&
             Object.prototype.toString.call(item.value) !== '[object Undefined]' &&
             item.value !== '--'
               ? `${thousandSeparation(item.value)} ${unit}`
               : '--'
           }</span>
          </div>`;
      });
      htmlStr += '</div>';
      return htmlStr;
    },
  };
}
function useLegendOprion() {
  return {
    type: 'scroll',
    itemWidth: 16,
    itemHeight: 2,
    icon: 'rect',
    itemGap: 60,
  };
}
function useXaxisOption(): XAXisComponentOption {
  const { CHARTS_AXIS_TEXT_COLOR, CHARTS_AXIS_LINE_COLOR, CHARTS_SPLIT_LINE_COLOR } = echartsConstant;
  return {
    type: 'category',
    nameTextStyle: {
      color: CHARTS_AXIS_TEXT_COLOR,
      fontSize: 14,
      padding: [46, 0, 0, 0],
    },
    axisLine: {
      lineStyle: {
        color: CHARTS_AXIS_LINE_COLOR,
      },
    },
    // 轴文本
    axisLabel: {
      color: CHARTS_AXIS_TEXT_COLOR,
      margin: 16,
      fontSize: 14,
    },
    // 刻度
    axisTick: {
      show: false,
    },
    // 分割线
    splitLine: {
      lineStyle: {
        color: CHARTS_SPLIT_LINE_COLOR,
      },
    },
    data: props.dataList?.[0]?.xaxis,
  };
}
function useYaxisOption(): YAXisComponentOption {
  const { CHARTS_AXIS_TEXT_COLOR, CHARTS_AXIS_TEXT_SHADOW_COLOR } = echartsConstant;
  return {
    name: props.dataList?.[0]?.unit,
    nameTextStyle: {
      color: CHARTS_AXIS_TEXT_SHADOW_COLOR,
    },
    type: 'value',
    offset: 0,
    axisLine: {
      show: false,
    },
    axisTick: {
      lineStyle: {
        color: CHARTS_AXIS_TEXT_COLOR,
      },
      length: 2,
    },
    axisLabel: {
      color: CHARTS_AXIS_TEXT_SHADOW_COLOR,
      fontSize: echartsConstant.CHARTS_FONT_SIZE_14,
      lineHeight: 22,
      // formatter(value: number, index: number) {
      //   if (!props.isToolTipFormat) {
      //     return value + '';
      //   }
      //   const mergeArrUnit = useMergeArrUnit();
      //   let texts;
      //   if (mergeArrUnit === 'k') {
      //     texts = Number(value / 1000) + 'k';
      //   } else if (mergeArrUnit === 'M') {
      //     texts = Number(value / 1000000) + 'M';
      //   } else if (mergeArrUnit === 'G') {
      //     texts = Number(value / 1000000000) + 'G';
      //   } else if (mergeArrUnit === 'T') {
      //     texts = Number(value / 1000000000000) + 'T';
      //   } else if (mergeArrUnit === 'P') {
      //     texts = Number(value / 1000000000000000) + 'P';
      //   } else if (mergeArrUnit === 'E') {
      //     texts = Number(value / 1000000000000000000) + 'E';
      //   } else {
      //     texts = Number(value) + '';
      //   }
      //   return texts;
      // },
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: 'rgba(0, 0, 0, 0.15)',
        type: 'dashed',
      },
    },
    ...yMinMaxOption.value,
    boundaryGap: [0, 0.01],
  };
}
function useMergeArrUnit() {
  let mergeArrUnit = 'k';
  let merge: string[] = [];
  props.dataList.forEach((item) => {
    merge = [
      ...merge,
      ...item.dataList
        ?.filter((d: number | null) => {
          return d !== null;
        })
        ?.map((item) => {
          return String(item);
        }),
    ];
  });
  let mergeArrMaxNum: any = merge?.length
    ? merge.reduce((a, b) => {
        return b > a ? b : a;
      })
    : '--';
  if (mergeArrMaxNum !== '--' && mergeArrMaxNum !== '' && mergeArrMaxNum !== null && mergeArrMaxNum !== undefined) {
    mergeArrMaxNum = Number(mergeArrMaxNum);
    if (mergeArrMaxNum?.toFixed(0).length > 5 && mergeArrMaxNum?.toFixed(0).length < 8) {
      mergeArrUnit = 'k';
    } else if (mergeArrMaxNum?.toFixed(0).length >= 8 && mergeArrMaxNum?.toFixed(0).length < 11) {
      mergeArrUnit = 'M';
    } else if (mergeArrMaxNum?.toFixed(0).length >= 11 && mergeArrMaxNum?.toFixed(0).length < 14) {
      mergeArrUnit = 'G';
    } else if (mergeArrMaxNum?.toFixed(0).length >= 14 && mergeArrMaxNum?.toFixed(0).length < 17) {
      mergeArrUnit = 'T';
    } else if (mergeArrMaxNum?.toFixed(0).length >= 17 && mergeArrMaxNum?.toFixed(0).length < 20) {
      mergeArrUnit = 'P';
    } else if (mergeArrMaxNum?.toFixed(0).length >= 20) {
      mergeArrUnit = 'E';
    }
  }
  if (merge?.length === 0) {
    mergeArrUnit = '';
  }
  return mergeArrUnit;
}
function useSeriesOption(): SeriesOption[] {
  return props.dataList?.map((item, index) => {
    return {
      name: item.typeName,
      type: 'line',
      itemStyle: {
        borderWidth: 20,
      },
      symbol: 'circle',
      symbolSize: 16,
      showSymbol: true,
      emphasis: {
        scale: false,
        itemStyle: echartsUtils.getsymbolStyle(props.colors[index]) as any,
      },
      data: props.isPriceFlag
        ? getPriceDataIsShowDot(
            index,
            item.dataList?.map((item) => {
              return item !== null ? String(item) : '--';
            }),
            props.colors[index],
            ECC_DOWNLOAD_COLOR,
          )
        : echartsUtils.getDataIsShowDot(
            item.dataList?.map((item) => {
              return item !== null ? String(item) : '--';
            }),
            props.colors[index],
          ),
    };
  });
}
/**
 * 比较合同单价和综合单价大小
 * @param comprehensivePrice 综合单价
 * @param contractPrice 合同单价
 * @return true:综合单价较高
 */
function mapComprehensivePriceHigh(comprehensivePrice: null | number, contractPrice: null | number) {
  return comprehensivePrice !== null && contractPrice !== null && comprehensivePrice > contractPrice;
}
/**
 * 单价数据-是否显示点
 */
function getPriceDataIsShowDot(idx: number, data: string[] | number[], color: string, errorColor: string) {
  if (data && data.length && data.length > 0) {
    let arrItem = {};
    const arrData: GlobalModule.CommonObject[] = [];
    data.forEach((item: any, index: number) => {
      // 第一个元素不为空且（数组只有一个元素或者第二个元素为空）
      if (
        index === 0 &&
        item !== '--' &&
        Object.prototype.toString.call(item) !== '[object Null]' &&
        ((data.length > 1 && (data[1] === '--' || Object.prototype.toString.call(data[1]) === '[object Null]')) ||
          data.length === 1)
      ) {
        arrItem = {
          value: item,
          itemStyle: {
            color:
              idx === 1 && mapComprehensivePriceHigh(item, props?.dataList?.[0]?.dataList?.[index])
                ? errorColor
                : color,
          },
        };
        arrData.push(arrItem);

        // 当前元素不为空且为最后一个元素且前一个元素为空
      } else if (
        item !== '--' &&
        Object.prototype.toString.call(item) !== '[object Null]' &&
        data.length > 1 &&
        index === data.length - 1 &&
        (data[data.length - 2] === '--' || Object.prototype.toString.call(data[data.length - 2]) === '[object Null]')
      ) {
        arrItem = {
          value: item,
          itemStyle: {
            color:
              idx === 1 && mapComprehensivePriceHigh(item, props?.dataList?.[0]?.dataList?.[index])
                ? errorColor
                : color,
          },
        };
        arrData.push(arrItem);

        // 当前元素不为空且前一个后一个都为空
      } else if (
        item !== '--' &&
        Object.prototype.toString.call(item) !== '[object Null]' &&
        (Object.prototype.toString.call(data[index - 1]) === '[object Null]' || data[index - 1] === '--') &&
        (Object.prototype.toString.call(data[index + 1]) === '[object Null]' || data[index + 1] === '--')
      ) {
        arrItem = {
          value: item,
          itemStyle: {
            color:
              idx === 1 && mapComprehensivePriceHigh(item, props?.dataList?.[0]?.dataList?.[index])
                ? errorColor
                : color,
          },
        };
        arrData.push(arrItem);
      } else {
        // 当前节点不是断点数据，需要比较综合单价和合同单价
        console.log(
          'item, props?.dataList?.[0]?.dataList?.[index]-----',
          item,
          props?.dataList?.[0]?.dataList?.[index],
        );
        arrItem = {
          value: item,
          itemStyle:
            idx === 1 && mapComprehensivePriceHigh(item, props?.dataList?.[0]?.dataList?.[index])
              ? echartsUtils.getsymbolStyle(errorColor)
              : {
                  color: 'transparent',
                },
        };
        arrData.push(arrItem);
      }
    });
    return arrData;
  } else {
    return data;
  }
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
#ecc-chart-line {
  position: relative;
  width: 100%;

  * {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>
