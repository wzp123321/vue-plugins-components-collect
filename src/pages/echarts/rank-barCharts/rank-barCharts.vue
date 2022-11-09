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
]
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
function getBarLegendData() {
  return lineChartDataList?.length
    ? lineChartDataList
        .map((item, index) => {
          return {
            name: echartConfig.echartsUtils.resetName(index + 1, item.name),
          }
        })
        .reverse()
    : []
}
function getYData() {
  return lineChartDataList.map((item, index) => {
    const { name } = item
    return echartConfig.echartsUtils.resetName(index + 1, name)
  })
}
function getSeriesData() {
  return lineChartDataList.map((item, index) => {
    const { name, value } = item
    const dataArr = setArray(index + 1)
    dataArr.pop()
    dataArr.push({
      value,
    })
    return {
      name: echartConfig.echartsUtils.resetName(index + 1, name),
      type: 'bar',
      stack: 'total',
      emphasis: {
        focus: 'series',
      },
      data: dataArr,
    }
  })
}
/**
 * 获取后缀
 */
function setArray(index: number = 1) {
  const suffixes = []
  for (let idx = 0; idx < index; idx++) {
    suffixes.push({
      value: 0,
    })
  }
  return suffixes
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
  const colorArr =
    echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR.reverse()
  const options = {
    color: colorArr,
    // 悬浮框
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
      },
      backgroundColor: echartConfig.echartsConstant.CHARTS_TOOLTIP_BG_COLOR,
      borderWidth: 0,
      borderColor: echartConfig.echartsConstant.CHARTS_TOOLTIP_BG_COLOR,
      padding: [10, 20],
      textStyle: {
        color: echartConfig.echartsConstant.CHARTS_TOOLTIP_TEXT_COLOR,
        align: 'left',
      },
      formatter: (params: any) => {
        return `${params[0].axisValue}<br/>点能耗：${
          thousandSeparation(params[0].data.value) ?? '--'
        }${(params[0].data.value ?? '--') !== '--' ? '' : unit}`
      },
    },
    legend: Object.assign(
      echartConfig.echartsOption().ECHARTS_LINECHART_LEGEND_OPTION,
      {
        bottom: 10,
        type: 'scroll',
        formatter: echartConfig.echartsUtils.formatterText,
        tooltip: {
          show: true,
        },
        data: getBarLegendData(),
      }
    ),
    grid: echartConfig.echartsOption().ECHARTS_COMMON_GRID_OPTION,
    xAxis: echartConfig.echartsOption().ECHARTS_LINECHART_AXIS_VALUE_OPTION,
    yAxis: Object.assign(
      echartConfig.echartsOption().ECHARTS_LINECHART_AXIS_CATEGORY_OPTION,
      {
        name: '能耗 ' + ' (' + unit + ')',
        data: getYData(),
        axisLabel: {
          show: true,
          fontSize: 14,
          color: 'rgba(0, 0, 0, 0.65)',
          formatter: echartConfig.echartsUtils.formatterText,
          tooltip: {
            show: true,
          },
        },
        triggerEvent: true,
      }
    ),
    series: getSeriesData(),
  }

  return options
}
function initEcharts() {
  const ele = document.getElementById(customChartId.value)
  if (!ele) {
    return
  }
  echartIns.value = init(ele)
  echartIns.value.clear()
  echartIns.value.setOption(getEchartsOptions())

  echartIns.value.on('mouseover', (e: any) => {
    handleMouseOver(e)
  })
  echartIns.value.on('mouseout', (e: any) => {
    handleMouseOut(e)
  })
}

function handleMouseOver(item: any) {
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
  position: relative;
  width: 100%;
  height: 100%;

  .echarts-container {
    width: 100%;
    height: 400px;

    * {
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
