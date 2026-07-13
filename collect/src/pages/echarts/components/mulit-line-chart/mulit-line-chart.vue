<template>
  <div class="mulit-line-chart">
    <!-- 图例 -->
    <section class="mlc-legend">
      <div class="mlc-legend-container">
        <div
          v-for="item in visibleItems"
          :key="item.name"
          @click="handleLegendClick(item)"
          :class="{ 'is-selected': item?.selected, 'mlc-legend-item': true }"
        >
          <template v-if="item.icon === EMcLegendType.正方形">
            <span class="is-icon" :style="{ background: item.color }"></span>
            <span class="is-name">{{ item.name }}</span>
          </template>
          <template v-if="item.icon === EMcLegendType.实线" @click="handleLegendClick(item)">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="5" width="10" height="2" :fill="item.selected ? item.color : '#D8D8D8'" />
            </svg>
            <span class="is-name">{{ item.name }}</span>
          </template>
          <template v-if="item.icon === EMcLegendType.虚线" @click="handleLegendClick(item)">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="5" width="4" height="2" :fill="item.selected ? item.color : '#D8D8D8'" />
              <rect x="7" y="5" width="4" height="2" :fill="item.selected ? item.color : '#D8D8D8'" />
            </svg>
            <span class="is-name">{{ item.name }}</span>
          </template>
        </div>
      </div>
      <div class="mlc-legend-pagination" v-if="showPagination">
        <icon-caret-left @click="prevPage" :class="{ active: currentPage > 1 }" />
        <div class="mlc-legend-pagination-label">
          <div>{{ currentPage }}</div>
          <div>/</div>
          <div>{{ totalPages }}</div>
        </div>
        <icon-caret-right @click="nextPage" :class="{ active: currentPage !== totalPages }" />
      </div>
    </section>
    <div ref="chartRef"></div>
  </div>
</template>
<script lang="ts" setup>
import { onUnmounted, onMounted, ref, nextTick } from 'vue';
import { useEChartsInit } from '@/hooks';
import { IconCaretLeft, IconCaretRight } from '@arco-iconbox/vue-te';
import {
  EChartsOption,
  EChartsType,
  LegendComponentOption,
  TooltipComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
} from 'echarts';
import {
  EMcEnergyTrendAnalysisType,
  EMcLegendType,
  IMcCustomLegend,
  barChartColors,
  defaultBarColor,
  energyUpperColor,
  recommendBenchColor,
  settedBenchColor,
  settedUpperColor,
  getDataIsShowDot,
  getsymbolStyle,
  mockData,
} from './model';
import { formatDate, thousandSeparation } from '@/utils';
import { cloneDeep } from 'lodash-es';
import { useChartPaginateLegends } from './hooks';

defineOptions({
  name: 'McWorkLineV2',
});

const checkedTypeList = [
  EMcEnergyTrendAnalysisType.推荐参考值,
  EMcEnergyTrendAnalysisType.推荐上限,
  EMcEnergyTrendAnalysisType.设定上限,
  EMcEnergyTrendAnalysisType.设定参考值,
];

// 图例
const legendList = ref<IMcCustomLegend[]>([]);

let chartInstance: EChartsType | undefined = undefined;
const { chartRef, initCharts, resize, removeResize } = useEChartsInit();
const mapColors = () => {
  return (mockData.workdayBar ?? [])?.map((_item, index) => {
    return barChartColors[index % barChartColors.length];
  });
};
/**
 * 图例
 */
const mapLegendData = () => {
  const groupLegendList = (mockData.workdayBar ?? []).map((_item, index) => {
    return {
      name: `稳定区间${index + 1}`,
      icon: EMcLegendType.正方形,
      color: mapColors()[index],
      selected: true,
    };
  });
  const markLineLegends: IMcCustomLegend[] = [
    {
      name: '推荐参考值',
      icon: EMcLegendType.虚线,
      color: recommendBenchColor,
      selected: checkedTypeList.includes(EMcEnergyTrendAnalysisType.推荐参考值),
    },
    {
      name: '推荐上限',
      icon: EMcLegendType.虚线,
      color: energyUpperColor,
      selected: checkedTypeList.includes(EMcEnergyTrendAnalysisType.推荐上限),
    },
    {
      name: '设定参考值',
      icon: EMcLegendType.实线,
      color: settedBenchColor,
      selected: checkedTypeList.includes(EMcEnergyTrendAnalysisType.设定参考值),
    },
    {
      name: '设定上限',
      icon: EMcLegendType.实线,
      color: settedUpperColor,
      selected: checkedTypeList.includes(EMcEnergyTrendAnalysisType.设定上限),
    },
  ];
  legendList.value = [
    {
      name: '原始数据',
      icon: EMcLegendType.正方形,
      color: defaultBarColor,
      selected: true,
    },
    ...groupLegendList,
    ...markLineLegends,
  ];
};
/**
 * series
 */
const mapSeriesData = (series: any[], markLineColors: string[]): any => {
  const mapLineSeries = (name: string, color: string, data: (string | null)[]) => ({
    name,
    type: 'line',
    lineStyle: {
      color,
      width: 1,
      type: 'solid',
    },
    symbol: 'circle',
    symbolSize: 12,
    showSymbol: true,
    emphasis: {
      scale: false,
      itemStyle: getsymbolStyle(color),
    },
    data: getDataIsShowDot(data, color, name),
  });
  return [
    ...series,
    mapLineSeries(
      '设定参考值',
      markLineColors[2],
      legendList.value.find((item) => item.name === '设定参考值')?.selected ? mockData.workdayLineBar?.[0] : [],
    ),
    mapLineSeries(
      '设定上限',
      markLineColors[3],
      legendList.value.find((item) => item.name === '设定上限')?.selected ? mockData.workdayLineBar?.[1] : [],
    ),
  ];
};
/**
 * tooltip
 */
const mapTooltip = (): TooltipComponentOption => ({
  trigger: 'axis',
  axisPointer: {
    type: 'shadow',
  },
  formatter: function (params: any) {
    let content = '';
    params?.forEach((item: any) => {
      content += `<div><span>${item?.data?.groupName ? item?.data?.groupName + '：' : ''}</span><span>${
        thousandSeparation(item?.data?.value) ?? ''
      }</span></div>`;
    });
    let htmlStr = `<div>
          <div>${params?.[0]?.axisValueLabel}</div>
          ${content}
        </div>`;
    return htmlStr;
  },
});
/**
 * x轴
 */
const mapXAxis = (xAxisData: string[]): XAXisComponentOption => ({
  type: 'category',
  axisLine: {
    lineStyle: {
      color: '#ddd',
    },
  },
  // 轴文本
  axisLabel: {
    color: 'rgba(0, 0, 0,0.85)',
    margin: 16,
    fontSize: 12,
    formatter: (value: any) => {
      return formatDate(new Date(value), 'MM-DD');
    },
  },
  // 刻度
  axisTick: {
    show: false,
  },
  // 分割线
  splitLine: {
    lineStyle: {
      color: '#f0f0f0',
    },
  },
  data: xAxisData,
});
/**
 * 为解决标记线超出y轴刻度，计算y轴可显示最大值
 */
const mapYAxisValue = () => {
  let list: number[] = [];
  if (mockData.workdayRecommendBench !== '' && mockData.workdayRecommendBench !== null) {
    list.push(Number(mockData.workdayRecommendBench));
  }
  if (mockData.workdayRecommendUpper !== '' && mockData.workdayRecommendUpper !== null) {
    list.push(Number(mockData.workdayRecommendUpper));
  }
  let cloneBarData =
    cloneDeep(mockData.workdayBarData?.[1])
      ?.filter((item) => item !== null && item !== '')
      ?.map((item) => Number(item)) ?? [];
  list = [...list, ...cloneBarData];
  let cloneLineData1 =
    cloneDeep(mockData.workdayLineBar?.[0])
      ?.filter((item) => item !== null && item !== '')
      ?.map((item) => Number(item)) ?? [];
  list = [...list, ...cloneLineData1];
  let cloneLineData2 =
    cloneDeep(mockData.workdayLineBar?.[1])
      ?.filter((item) => item !== null && item !== '')
      ?.map((item) => Number(item)) ?? [];
  list = [...list, ...cloneLineData2];
  return Math.max(...list);
};
/**
 * y轴
 */
const mapYAxis = (): YAXisComponentOption => ({
  name: 'kWh',
  nameTextStyle: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 12,
  },
  type: 'value',
  offset: 0,
  axisLine: {
    show: false,
  },
  max: mapYAxisValue(),
  axisLabel: {
    color: 'rgba(0, 0, 0, 0.85)',
    fontSize: 12,
    lineHeight: 22,
  },
  splitLine: {
    show: true,
    lineStyle: {
      color: '#e8e8e8',
      type: 'dashed',
    },
  },
});
const mapShowMarkLineList = (markLineColors: string[]) => {
  let list: any[] = [];
  const mapMarkLineOption = (name: string, color: string, value: string) => ({
    name,
    yAxis: value !== null ? Number(value) : null,
    show: false,
    lineStyle: {
      color: color,
      width: 1,
      type: 'dashed',
    },
    label: {
      formatter: '{c}',
      position: 'end',
    },
    emphasis: {
      lineStyle: {
        width: 1,
      },
    },
  });
  if (
    legendList.value?.find((item) => item.name === '推荐参考值')?.selected &&
    mockData.workdayRecommendBench !== null
  ) {
    list.push(mapMarkLineOption('推荐参考值', markLineColors[0], mockData.workdayRecommendBench));
  }
  if (legendList.value?.find((item) => item.name === '推荐上限')?.selected && mockData.workdayRecommendUpper !== null) {
    list.push(mapMarkLineOption('推荐上限', markLineColors[1], mockData.workdayRecommendUpper));
  }
  return list;
};
/**
 * 图表配置
 */
const mapChartOptions = (): EChartsOption => {
  const seriesData = cloneDeep(mockData.workdayBarData?.[1]).map((item) => (item === null ? null : parseFloat(item)));
  // 数据准备
  const xAxisData = cloneDeep(mockData.workdayBarData?.[0]);
  const groups: any = cloneDeep(mockData.workdayBar ?? []) ?? [];
  // 颜色列表
  const colors = mapColors();
  const markLineColors = [recommendBenchColor, energyUpperColor, settedBenchColor, settedUpperColor];
  // 准备系列数据
  const series = [];
  const legends: LegendComponentOption[] = [
    {
      name: '原始数据',
    },
  ];
  // 首先添加基础系列（透明色）
  series.push({
    name: '原始数据',
    type: 'bar',
    barMaxWidth: 16,
    barGap: '10%', // 柱子之间的间隔
    barCategoryGap: '30%', // 不同系列柱子间的间隔
    data: seriesData.map((value, index) => {
      const date = xAxisData[index];
      const groupIndex = groups.findIndex((item: any) => item.includes(date));
      // groupIndex=-1时是原始数据，
      const selected = legendList.value?.[groupIndex + 1]?.selected;
      return {
        // 如果当前图例未选中，值就是null
        value: selected ? value : null,
        groupName: groupIndex === -1 ? '原始数据' : `稳定区间${groupIndex + 1}`,
        itemStyle: {
          color: groupIndex === -1 ? defaultBarColor : colors[groupIndex],
        },
      };
    }),
    itemStyle: {
      color: defaultBarColor,
    },
    markLine: {
      symbol: ['none', 'none'],
      data: mapShowMarkLineList(markLineColors),
    },
  });
  // 为每个分组添加系列
  groups.forEach((_group: any, groupIndex: number) => {
    const groupName = `稳定区间${groupIndex + 1}`;
    legends.push({
      name: groupName,
    });
  });

  // 配置项
  const option: EChartsOption = {
    tooltip: mapTooltip(),
    legend: { show: false },
    grid: {
      left: '3%',
      right: '5%',
      top: 40,
      bottom: 48,
      containLabel: true,
    },
    xAxis: mapXAxis(xAxisData as string[]),
    yAxis: mapYAxis(),
    series: mapSeriesData(series, markLineColors),
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: [0],
        start: 0,
        end: 100,
        bottom: 12,
        right: 40,
        height: 24,
        handleSize: '100%',
        handleStyle: {
          color: '#1890FF',
        },
        fillerColor: 'rgba(24, 144, 255, 0.1)',
        backgroundColor: 'rgba(250, 250, 250, 1)',
        borderColor: 'rgba(0, 0, 0, 0.15)',
      },
      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: 100,
        height: 24,
        bottom: 12,
        right: 40,
        handleSize: '100%',
        handleStyle: {
          color: '#1890FF',
        },
        fillerColor: 'rgba(24, 144, 255, 0.1)',
        backgroundColor: 'rgba(250, 250, 250, 1)',
        borderColor: 'rgba(0, 0, 0, 0.15)',
      },
    ],
  };
  return option;
};
/**
 * 刷新图表
 */
const handleRefresh = () => {
  legendList.value.forEach((item) => {
    if (['推荐参考值', '推荐上限', '设定参考值', '设定上限'].includes(item.name)) {
      item.selected = checkedTypeList.includes((EMcEnergyTrendAnalysisType as any)[item.name]);
    }
  });
  if (chartInstance) {
    const options = mapChartOptions();
    (chartInstance as EChartsType).setOption(options, true);
  }
};

/**
 * 点击图例
 */
const handleLegendClick = (item: IMcCustomLegend) => {
  item.selected = !item.selected;
  // 重新渲染
  if (chartInstance) {
    const options = mapChartOptions();
    (chartInstance as EChartsType).setOption(options, true);
  }
};

const { currentPage, totalPages, visibleItems, showPagination, prevPage, nextPage, init } = useChartPaginateLegends();

onMounted(async () => {
  if (chartRef.value) {
    mapLegendData();
    await nextTick();
    const width = document.querySelector('.mulit-line-chart')?.clientWidth;
    init(legendList.value, width as number, 24);
    const options = mapChartOptions();
    chartInstance = initCharts(options) as EChartsType;

    window.addEventListener('resize', () => {
      resize();
      const width = document.querySelector('.mulit-line-chart')?.clientWidth;
      init(legendList.value, width as number, 24);
    });
  }
});
onUnmounted(() => {
  removeResize();
  window.removeEventListener('resize', () => {
    const width = document.querySelector('.mulit-line-chart')?.clientWidth;
    init(legendList.value, width as number, 24);
  });
});

defineExpose({ handleRefresh });
</script>
<style lang="less" scoped>
.mulit-line-chart {
  width: 100%;
  position: relative;

  .mlc-legend {
    position: absolute;
    top: 0;
    left: 50%;
    min-width: 240px;
    max-width: 80%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 10;
    overflow: hidden;

    .mlc-legend-container {
      flex: auto;
      display: flex;
      align-items: center;
      gap: 16px;
      z-index: 10;
      overflow: hidden;

      .mlc-legend-item {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;

        .is-icon {
          width: 10px;
          height: 10px;
        }

        .is-name {
          color: rgba(0, 0, 0, 0.85);
          font-family: 'PingFang SC';
          font-weight: 400;
          font-size: 12px;
          line-height: 20px;
          white-space: nowrap;
        }

        &:not(.is-selected) {
          .is-icon {
            background-color: rgba(0, 0, 0, 0.4) !important;
          }

          .is-name {
            color: rgba(0, 0, 0, 0.4);
          }
        }
      }
    }

    .mlc-legend-pagination {
      display: flex;
      align-items: center;
      gap: 4px;

      svg {
        cursor: pointer;
        font-size: 20px;
        width: 20px;
        min-width: 20px;
        height: 20px;
        color: rgba(0, 0, 0, 0.4);

        &.active {
          color: rgb(14, 109, 250);
        }
      }

      .mlc-legend-pagination-label {
        display: flex;
        align-items: center;
        color: rgba(0, 0, 0, 0.85);
        font-size: 12px;
      }
    }
  }

  > div {
    width: 100%;
    height: 298px;

    canvas {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
