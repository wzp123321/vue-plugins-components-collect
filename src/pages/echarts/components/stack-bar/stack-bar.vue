<template>
  <div class="stack-bar">
    <header class="sb--header">
      <a-button link @click="handleChartExport">
        导出成图片
        <icon-export />
      </a-button>
    </header>
    <div class="sb--container">
      <div ref="chartRef"></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import useChartStore from '@/store/modules/chart';
import { useEChartsInit } from '@/hooks';
import { formatDate, mapPickerSmallFormatByTimeUnit, thousandSeparation } from '@/utils';
import { EChartsOption, EChartsType } from 'echarts';
import { commonEChartOption, newEChartsConstant, pieColors } from '@/config/echarts';
import { IconExport } from '@arco-iconbox/vue-te';
import { handleChartToImage, resetLegendName, resetXAxisTime } from '@/config/echarts/utils';
import { nightingaleChartsDataList } from '../model';
import { ECommonTimeUnit } from '@/services/common.api';

defineOptions({
  name: 'EsStackChart',
});

const { chartRef, initCharts } = useEChartsInit();
// x轴
const mapXAxis = () => ({
  data: nightingaleChartsDataList.xaxisTimes,
  ...commonEChartOption.LINE_CHART_CATEGORY_AXIS_OPTION,
  axisLabel: {
    color: newEChartsConstant.CHARTS_AXIS_TEXT_COLOR,
    margin: 16,
    fontSize: 14,
    formatter(params: number) {
      return resetXAxisTime(Number(params), ECommonTimeUnit.HOUR);
    },
  },
});
// series
const mapSeries = (): any =>
  nightingaleChartsDataList.childrenBarInfo?.map((item, index) => ({
    name: resetLegendName(index, item.treeName),
    type: 'bar',
    barMaxWidth: 16,
    stack: 'total',
    data: item.valueList?.map((cItem, cIndex) => ({
      name: item?.treeName,
      value: cItem,
      percent: item.percentList?.[cIndex],
    })),
  }));
/**
 * 配置
 */
const mapChartOptions = (): EChartsOption => {
  const grid = {
    left: '2%',
    right: '3%',
    top: 64,
    bottom: 48,
    containLabel: true,
  };

  const options: EChartsOption = {
    color: pieColors,
    legend: {
      orient: 'horizontal', // 图例横向排布
      type: 'scroll',
      selectedMode: true,
    },
    grid,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      showDelay: 30,
      hideDelay: 150,
      confine: true,
      enterable: true,
      formatter: (params: any) => {
        let htmlStr = '';
        const filterList = params?.filter((item: any) => item?.data?.value !== null);
        htmlStr = `<div ><p style="color: rgba(0, 0, 0, 0.85);line-height: 22px">${formatDate(
          new Date(Number(params?.[0]?.axisValueLabel)),
          mapPickerSmallFormatByTimeUnit(ECommonTimeUnit.HOUR),
        )}</p>`;
        htmlStr += '<div style="max-height: 200px;overflow-y: auto">';
        if (filterList.length > 0) {
          filterList?.forEach((item: any) => {
            htmlStr +=
              '<div style="margin-top: 8px">' +
              `<span style="color: rgba(0, 0, 0, 0.85);display:inline-block; width: 10px; height:10px; background: ${item?.color};margin-right: 4px;"></span>` +
              `<span style="color: rgba(0, 0, 0, 0.85);margin-right: 12px">${item?.data?.name ?? '-'}</span>` +
              `<span style="color: rgba(0, 0, 0, 0.85);margin-right: 12px">${
                item?.data?.value !== null ? thousandSeparation(item?.data?.value) : '-'
              }</span>` +
              `<span style="color: rgba(0, 0, 0, 0.85);">${
                item?.data?.percent !== null ? `${item?.data?.percent}%` : '-'
              }</span>` +
              '</div>';
          });
          htmlStr += '</div>';
          htmlStr += '</div>';
        }
        return htmlStr;
      },
    },
    dataZoom: newEChartsConstant.CHART_DATA_ZOOM((value) =>
      Number.isNaN(value) || Number(value) < 0 || Number(value) > nightingaleChartsDataList.xaxisTimes.length - 1
        ? ''
        : resetXAxisTime(nightingaleChartsDataList.xaxisTimes[Number(value)], ECommonTimeUnit.HOUR),
    ),
    xAxis: mapXAxis(),
    yAxis: {
      name: 'kWh',
      ...(commonEChartOption.Y_AXIS_OPTION as any),
    },
    series: mapSeries(),
  };
  return options;
};

let chartInstance: EChartsType | undefined;

/**
 * 导出图表
 */
const handleChartExport = () => {
  if (chartRef.value && chartInstance !== undefined) {
    handleChartToImage(chartInstance as EChartsType, '堆叠图');
  }
};
/**
 * 触发dataZoom
 * @param {number} start
 * @param {number} end
 */
const triggerDataZoom = (start: number, end: number) =>
  chartInstance &&
  chartInstance.dispatchAction({
    type: 'dataZoom',
    start,
    end,
  });

/**
 * 堆叠图图例高亮事件
 * 如果右侧点击了卡片，堆叠图对应卡片的图例高亮，其余置灰
 * 如果卡片没有高亮，则堆叠图图例全部高亮
 * @param {number | null} dataIndex
 */
const handleStackBarLegendHighlight = (dataIndex: number | null) => {
  if (chartInstance) {
    // 如果选中id为空，则全部高亮
    if (dataIndex === null) {
      chartInstance?.dispatchAction({
        type: 'legendAllSelect',
      });
    } else {
      let name =
        dataIndex >= 0 && dataIndex < nightingaleChartsDataList.childrenBarInfo.length
          ? nightingaleChartsDataList.childrenBarInfo[dataIndex].treeName
          : '';
      if (name) {
        name = resetLegendName(dataIndex, name);
        nightingaleChartsDataList.childrenBarInfo.forEach((item, index) => {
          // 更新图例的选中状态
          chartInstance?.dispatchAction({
            type: 'legendUnSelect',
            name: resetLegendName(index, item.treeName),
          });
        });

        setTimeout(() => {
          chartInstance?.dispatchAction({
            type: 'legendSelect',
            name,
          });
        }, 200);
      }
    }
  }
};

const chartStore = useChartStore();
watch(
  () => chartStore.selectedCardDataIndex,
  (newVal) => {
    handleStackBarLegendHighlight(newVal);
  },
);

onMounted(() => {
  if (chartRef.value) {
    chartInstance = initCharts(mapChartOptions());
    if (chartInstance) {
      chartInstance.off('globalout');
      chartInstance.on('globalout', () => {
        setTimeout(() => {
          chartInstance?.dispatchAction({
            type: 'hideTip',
          });
        }, 250);
      });
    }
  }
});
defineExpose({
  triggerDataZoom,
});
</script>
<style lang="less" scoped>
.stack-bar {
  width: 100%;
  padding: 0 var(--te-space-20) var(--te-space-20);
  display: flex;
  flex-direction: column;
  gap: var(--te-space-16);

  > .sb--header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    > span {
      font-size: var(--te-font-size-b14);
      color: var(--te-text-color-primary);
      font-weight: 600;
      line-height: 22px;
    }
  }

  .sb--container {
    width: 100%;
    height: 346px;
    overflow: hidden;

    > div:first-child,
    canvas {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
