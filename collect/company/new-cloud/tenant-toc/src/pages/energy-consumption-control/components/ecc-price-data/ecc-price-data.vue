<template>
  <div class="ecc-price-data" id="ecc-price-data">
    <sub-title title="单价数据"></sub-title>
    <section>
      <div class="ecc-pd-card">
        <div class="ecc-pd-card-data">
          <div class="ecc-pd-card-data-item left">
            <div class="title">合同单价{{ priceCardData?.unit ? `(${priceCardData?.unit})` : '' }}</div>
            <div
              class="count"
              :title="
                priceCardData?.contractPrice !== null && priceCardData?.contractPrice !== undefined
                  ? thousandSeparation(priceCardData?.contractPrice)
                  : '-'
              "
            >
              {{
                priceCardData?.contractPrice !== null && priceCardData?.contractPrice !== undefined
                  ? thousandSeparation(priceCardData?.contractPrice)
                  : '-'
              }}
            </div>
          </div>
          <div class="ecc-pd-card-data-item right">
            <div class="title">综合单价{{ priceCardData?.unit ? `(${priceCardData?.unit})` : '' }}</div>
            <div
              :class="['count', mapComprehensivePriceHigh() ? 'high' : '']"
              :title="
                priceCardData?.comprehensivePrice !== null && priceCardData?.comprehensivePrice !== undefined
                  ? thousandSeparation(priceCardData?.comprehensivePrice)
                  : '-'
              "
            >
              {{
                priceCardData?.comprehensivePrice !== null && priceCardData?.comprehensivePrice !== undefined
                  ? thousandSeparation(priceCardData?.comprehensivePrice)
                  : '-'
              }}
            </div>
          </div>
        </div>
        <div class="ecc-pd-card-bar" v-if="mapIsSingleData()"><div :id="chartId"></div></div>
      </div>
      <slot name="line-chart"></slot>
    </section>
  </div>
</template>
<script lang="ts" setup>
import { computed, PropType, onMounted, watch } from 'vue';
import { EChartsOption, EChartsType, init, TooltipComponentOption } from 'echarts';

import { ECC_DOWNLOAD_COLOR, ECC_IPriceDataVO, ECC_PRICE_COLORS } from '../../energy-consumption-control.api';

import { echartsConstant } from '../../../../config/echarts/index';

import { cloneDeep } from 'lodash';
import { thousandSeparation } from '../../../../utils/index';

const props = defineProps({
  priceCardData: {
    type: Object as PropType<ECC_IPriceDataVO>,
  },
  isSingleData: {
    type: Boolean,
    default: false,
  },
});
const priceCardData = computed(() => {
  return props.priceCardData;
});
const isSingleData = computed(() => {
  return props.isSingleData;
});

watch(
  () => props.priceCardData,
  () => initChart(),
);

onMounted(() => {
  initChart();
});

let chartInstance: EChartsType;
const COLORS = cloneDeep(ECC_PRICE_COLORS);
// 随机生成id
const chartId = computed(() => {
  return `charts-${(Math.random() * 100000000).toFixed(0)}`;
});
/**
 * 初始化图表
 */
function initChart() {
  const chartContainer = document.querySelector(`#${chartId.value}`);
  if (!chartContainer) {
    return;
  }
  if (chartInstance) {
    chartInstance.dispose();
  }
  chartInstance = init(chartContainer as HTMLElement);

  if (mapComprehensivePriceHigh()) {
    COLORS[1] = ECC_DOWNLOAD_COLOR;
  }

  const options: EChartsOption = getChartOptions();
  chartInstance.clear();
  chartInstance.setOption(options);
}
/**
 * echarts配置
 */
function getChartOptions(): EChartsOption {
  return {
    color: COLORS,
    tooltip: useTooltipOption(),
    legend: {
      show: false,
    },
    grid: {
      left: '3%',
      right: '6%',
      top: '10%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        min: 0,
        max: (value) => {
          if (!value.max) {
            return 1;
          } else {
            return value.max;
          }
        },
      },
    ],
    yAxis: [
      {
        type: 'category',
        boundaryGap: [15, 15],
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: 'rgba(0, 0, 0, 0.45)',
          verticalAlign: 'top',
        },
        axisLine: {
          lineStyle: {
            color: echartsConstant.CHARTS_AXIS_LINE_COLOR,
          },
        },
        axisPointer: {
          type: 'none',
        },
        data: ['综合单价', '合同单价'],
      },
    ],
    series: [
      {
        name: '合同单价',
        type: 'bar',
        emphasis: {
          focus: 'series',
        },
        barWidth: 8,
        data: ['', props.priceCardData?.contractPrice ?? ''],
      },
      {
        name: '综合单价',
        type: 'bar',
        barWidth: 8,
        emphasis: {
          focus: 'series',
        },
        data: [props.priceCardData?.comprehensivePrice ?? '', ''],
      },
    ],
  };
}
/**
 * tooltip配置
 */
function useTooltipOption(): TooltipComponentOption {
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
      const item = params?.[1 - params?.[0]?.dataIndex];
      htmlStr += `<div style="margin-bottom: 4px">
           <span>${item?.axisValue}：</span>
           <span>${
             Object.prototype.toString.call(item?.value) !== '[object Null]' &&
             Object.prototype.toString.call(item?.value) !== '[object Undefined]' &&
             item.value !== ''
               ? `${thousandSeparation(item?.value)} ${props.priceCardData?.unit ?? ''}`
               : '--'
           }</span>
          </div>`;
      htmlStr += '</div>';
      return htmlStr;
    },
  };
}
// 综合单价是否超过合同单价
function mapComprehensivePriceHigh() {
  return (
    priceCardData.value?.comprehensivePrice &&
    priceCardData.value?.contractPrice &&
    priceCardData.value?.comprehensivePrice > priceCardData.value?.contractPrice
  );
}
// 是否是按月查询
function mapIsSingleData() {
  return !props.isSingleData;
}
</script>
<style lang="less" scoped>
#ecc-price-data {
  section {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .ecc-pd-card {
    width: 560px;
    height: 249px;
    padding: 16px;
    flex-shrink: 0;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    row-gap: 16px;

    background-image: url('../../../../assets/images/energy-consumption-control/ecc-pic-money.svg');
    background-repeat: no-repeat;
    background-position: right 0 bottom 10px;
    background-size: 156px 144px;

    > .ecc-pd-card-data {
      display: flex;
      justify-content: space-between;

      > .ecc-pd-card-data-item {
        flex: auto;
        overflow: hidden;
        min-width: 50%;
      }

      > .ecc-pd-card-data-item.right {
        padding-left: 24px;
        border-left: 1px solid var(--color-text-border);
      }

      > .ecc-pd-card-data-item > .title {
        height: 22px;
        color: rgba(0, 0, 0, 0.65);
        font-family: PingFang SC;
        font-size: 14px;
        line-height: 22px;
        letter-spacing: 0px;
      }

      > .ecc-pd-card-data-item > .count {
        margin-top: 8px;
        font-weight: 700;
        font-size: 24px;
        line-height: 24px;
        color: var(--color-text-title);

        &.high {
          color: v-bind(ECC_DOWNLOAD_COLOR);
        }
      }
    }

    > .ecc-pd-card-bar {
      width: 100%;
      flex: auto;

      * {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
