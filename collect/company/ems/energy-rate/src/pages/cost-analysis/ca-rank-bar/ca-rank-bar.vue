<template>
  <div class="ca-rank-bar">
    <div class="crb-charts" ref="chartRef"></div>
    <p class="crb-tooltip" v-show="axisToolTipFlag" :style="{ ...tipPosition }">{{ tipLabel }}</p>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { EChartsOption, format } from 'echarts';
import useChartRender from '../ca-chart-render';

import costAnalysisService from '../cost-analysis.service';
import { CA_IBarChartSeriesDataVO, mapEnergyColor } from '../cost-analysis.api';
import { thousandSeparation } from '../../../utils';

// 图表
const chartRef = ref<HTMLElement>();
const { initChart, axisToolTipFlag, tipLabel, tipPosition } = useChartRender();

/**
 * 生成配置
 */
const mapChartsOptions = (): EChartsOption => {
  const options: EChartsOption = {
    color: mapBarColors(),
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
      },
      confine: true,
      backgroundColor: 'rgba(50, 50, 50, 0.7)',
      borderColor: 'rgba(50, 50, 50, 0.7)',
      textStyle: {
        color: '#fff',
        fontSize: 14,
      },
      formatter: (datas: any) => {
        let res = '<div style="font-size:14px;margin: 2px 8px;">' + datas[0].name + '</div>';
        for (let i = 0, length = datas.length; i < length; i++) {
          res +=
            '<div style="font-size:14px;margin: 2px 8px;">' +
            datas[i].seriesName +
            '：' +
            datas[i].data.realData +
            '</div>';
        }
        return res;
      },
    },
    legend: {
      type: 'scroll',
      itemGap: 32,
      itemWidth: 20,
      itemHeight: 8,
      data: mapLegendData(),
      orient: 'horizontal',
      bottom: 10,
      textStyle: {
        color: 'rgba(0, 0, 0, 0.65)',
        fontSize: 14,
        lineHeight: 22,
        height: 22,
      },
      pageIconSize: 14,
      pageIconColor: '#1890ff',
      pageIconInactiveColor: '#d8d8d8',
      pageTextStyle: {
        color: 'rgba(0, 0, 0, 0.65)',
        fontSize: 14,
      },
      formatter: (name: string) => {
        return format.truncateText(name, 80, '14px Microsoft Yahei', '…', {});
      },
      selectedMode: true,
      tooltip: {
        show: true,
      },
    },
    grid: {
      left: 10,
      right: 65,
      bottom: 60,
      top: 30,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisTick: {
        show: true,
        inside: true,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#D8D8D8',
        },
      },
      splitLine: {
        show: false,
      },
      axisLabel: {
        color: 'rgba(0, 0, 0, 0.65)',
        fontSize: 14,
        formatter: (value: any) => {
          if (Math.abs(value) >= 10000 && Math.abs(value) < 1000000) {
            const $val = Number(value) / 1000;
            return ($val + 'k').length < 6 ? $val + 'k' : `${($val + 'k').substring(0, 6)}...`;
          } else if (Math.abs(value) >= 1000000) {
            const $val = Number(value) / 1000000;
            return ($val + 'M').length < 6 ? $val + 'M' : `${($val + 'M').substring(0, 6)}...`;
          } else {
            return value;
          }
        },
      },
      triggerEvent: true,
      name: '元',
      nameTextStyle: {
        color: 'rgba(0, 0, 0, 0.65)',
      },
    },
    yAxis: {
      data: costAnalysisService.costBarData.yaxisData,
      axisTick: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: '#D8D8D8',
        },
      },
      axisLabel: {
        show: true,
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.65)',
        formatter: (name: string) => {
          return format.truncateText(name, 100, '14px Microsoft Yahei', '…', {});
        },
      },
      triggerEvent: true,
      tooltip: {
        show: true,
      },
    },
    dataZoom: [
      {
        type: 'slider',
        right: 0,
        show: costAnalysisService.costBarData.yaxisData.length > 8,
        startValue:
          costAnalysisService.costBarData.yaxisData.length - 1 > 7
            ? costAnalysisService.costBarData.yaxisData.length - 1
            : 0,
        endValue:
          costAnalysisService.costBarData.yaxisData.length - 1 > 7
            ? costAnalysisService.costBarData.yaxisData.length - 8
            : costAnalysisService.costBarData.yaxisData.length - 1,
        orient: 'vertical',
        showDetail: false,
        showDataShadow: false,
        zoomLock: false,
        backgroundColor: '#FBFBFB',
        fillerColor: 'rgba(167, 183, 204, 0.27)',
        width: 15,
        borderColor: '#EAEAEA',
      },
    ],
    series: mapSeriesData(),
  };
  return options;
};
/**
 * 处理柱状图颜色
 */
const mapBarColors = () => {
  // 根据分类分项取颜色
  const colors: string[] = costAnalysisService.costBarData?.seriesData.map((item: any) => {
    return mapEnergyColor(item.energyCode);
  });
  return colors;
};
/**
 * 生成legend数组
 */
const mapLegendData = () => {
  return costAnalysisService.costBarData?.seriesData?.map((item) => item?.energyName);
};
/**
 * 处理series
 */
const mapSeriesData = (): any => {
  return costAnalysisService.costBarData.seriesData.map((item: CA_IBarChartSeriesDataVO) => {
    return {
      name: item.energyName,
      type: 'bar',
      stack: 'total',
      data: mapRankData(item.costList, item.tenThousandCostList, item.unit),
      barMaxWidth: 34,
      barMaxHeight: 13,
    };
  });
};
/**
 * 处理数据
 * @param costList
 * @param tenThousandCostList
 */
const mapRankData = (costList: number[], tenThousandCostList: string[], unit: string): any => {
  const arr2: any = [];
  costList.forEach((item: any, index: any) => {
    const realValue = thousandSeparation(Number(tenThousandCostList[index]?.replace(unit, '')));
    const arrItem2: any = {
      value: item,
      realData: `${realValue}${realValue !== '--' ? unit : ''}`,
    };
    arr2.push(arrItem2);
  });
  return arr2;
};

onMounted(() => {
  if (costAnalysisService.costBarData.seriesData?.length) {
    const options = mapChartsOptions();
    initChart(chartRef.value!, options);
  }
});
</script>
<style lang="less" scoped>
.ca-rank-bar {
  width: 100%;
  height: 400px;
  position: relative;

  .crb-charts {
    width: 100%;
    height: 100%;

    * {
      width: 100%;
      height: 100%;
    }
  }

  p.crb-tooltip {
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
