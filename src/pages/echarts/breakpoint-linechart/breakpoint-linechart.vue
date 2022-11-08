<template>
  <div id="breakpoint-linechart" class="breakpoint-linechart">
    <div :id="customChartId" class="echarts-container"></div>
    <p v-show="yaxisShowFlag && yaxisText" :style="{ ...yPosition }">
      {{ yaxisText }}
    </p>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, computed, ref, onUnmounted } from 'vue'
import { init } from 'echarts'

import echartConfig from '../../../config/echarts/index'
import { thousandSeparation } from '../../../utils/index'

const customChartId = computed(() => {
  return 'charts_' + (Math.random() * 1000).toFixed(0)
})

const yaxisText = ref<string>('')
const yaxisShowFlag = ref<boolean>(false)
const yPosition = ref<{ top: string; left: string }>({
  top: '',
  left: '',
})
let echartIns = ref<any>(null)

function getXaxisData() {
  return [
    '2022-10-01',
    '2022-10-02',
    '2022-10-03',
    '2022-10-04',
    '2022-10-05',
    '2022-10-06',
    '2022-10-07',
    '2022-10-08',
    '2022-10-09',
    '2022-10-10',
    '2022-10-11',
    '2022-10-12',
    '2022-10-13',
  ]
}
function getEchartsOptions() {
  const unit = 'px'
  const actualValueList: (number | null)[] = [
    222,
    342,
    1245,
    null,
    543,
    null,
    674,
    86,
    992,
    102,
    422,
    null,
    27,
  ]
  const averageValueList: (number | null)[] = [
    122,
    542,
    345,
    null,
    null,
    null,
    674,
    null,
    992,
    102,
    422,
    null,
    237,
  ]
  const benchmarkValueList: (number | null)[] = [
    33,
    null,
    677,
    302,
    null,
    54,
    null,
    77,
    921,
    130,
    299,
    null,
    543,
  ]

  const options = {
    color: echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR,
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
      backgroundColor: echartConfig.echartsConstant.CHARTS_TOOLTIP_BG_COLOR,
      padding: echartConfig.echartsConstant.CHARTS_TOOLTIP_PADDING,
      shadowColor: echartConfig.echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_COLOR,
      shadowOffsetX:
        echartConfig.echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_OFFSETX,
      shadowOffsetY:
        echartConfig.echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_OFFSETY,
      textStyle: {
        color: echartConfig.echartsConstant.CHARTS_TOOLTIP_TEXT_COLOR,
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
        let htmlStr = `<span style="margin-bottom:10px">${
          params[0].axisValue || '--'
        }</span></br>`
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
                                  Object.prototype.toString.call(item.value) !==
                                    '[object Null]' &&
                                  Object.prototype.toString.call(item.value) !==
                                    '[object Undefined]'
                                    ? unit
                                    : ''
                                }</span></span></br>`
        })
        htmlStr += '</span>'
        return htmlStr
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
    xAxis: Object.assign(
      echartConfig.echartsOption().ECHARTS_LINECHART_AXIS_CATEGORY_OPTION,
      {
        data: getXaxisData(),
      }
    ),
    yAxis: echartConfig.echartsOption().ECHARTS_LINECHART_AXIS_VALUE_OPTION,
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
          itemStyle: echartConfig.echartsUtils.getsymbolStyle(
            echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[0]
          ),
        },
        data: echartConfig.echartsUtils.getDataIsShowDot(
          actualValueList,
          echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[0]
        ),
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
          itemStyle: echartConfig.echartsUtils.getsymbolStyle(
            echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[1]
          ),
        },
        data: echartConfig.echartsUtils.getDataIsShowDot(
          averageValueList,
          echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[1]
        ),
      },
      {
        name: '标杆值',
        type: 'line',
        itemStyle: {
          borderWidth: 20,
        },
        emphasis: {
          scale: false,
          itemStyle: echartConfig.echartsUtils.getsymbolStyle(
            echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[2]
          ),
        },
        symbolSize: 16,
        symbol: 'circle',
        showSymbol: true,
        data: echartConfig.echartsUtils.getDataIsShowDot(
          benchmarkValueList,
          echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[2]
        ),
      },
    ],
  }

  return options
}
function initEcharts() {
  const ele = document.getElementById('breakpoint-linechart')
  if (!ele) {
    return
  }
  echartIns.value = init(ele)
  echartIns.value.clear()
  echartIns.value.setOption(getEchartsOptions())

  echartIns.value.on('click', (params: any) => {
    console.log(params)
  })
  echartIns.value.on('mouseover', (e: any) => {
    handleMouseOver(e)
  })
  echartIns.value.on('mouseout', (e: any) => {
    handleMouseOut(e)
  })
}

function handleMouseOver(item: any) {
  console.log(item)
  if (item.componentType === 'yAxis') {
    const { event, value } = item
    yaxisShowFlag.value = true
    yaxisText.value = value
    yPosition.value = {
      top: `${event.offsetY + 30}px`,
      left: `${event.offsetX}px`,
    }
  } else {
    yaxisShowFlag.value = false
  }
}

function handleMouseOut(e: any) {
  yaxisShowFlag.value = false
}

onMounted(() => {
  initEcharts()
})

onUnmounted(() => {
  if (echartIns.value) {
    echartIns.value.off('mouseover', handleMouseOver)
    echartIns.value.off('mouseout', handleMouseOut)
  }
})
</script>
<style lang="less" scoped>
.breakpoint-linechart {
  width: 100%;
  height: 100%;

  .echarts-container {
    width: 800px;
    height: 300px;

    * {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
