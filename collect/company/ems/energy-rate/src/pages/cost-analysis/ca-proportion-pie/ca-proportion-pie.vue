<template>
  <div class="ca-proportion-pie">
    <div class="cpp-charts" ref="chartRef"></div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { EChartsOption, format } from 'echarts';
import useChartRender from '../ca-chart-render';

import costAnalysisService from '../cost-analysis.service';
import { CA_IPieSeriesDataVO } from '../cost-analysis.api';
import { CHARTS_PIE_MAIN_COLOR } from '../../../config';
import { thousandSeparation } from '../../../utils';

// 图表
const chartRef = ref<HTMLElement>();
const { initChart } = useChartRender();
// 生成配置
const mapChartsOptions = (): EChartsOption => {
  return {
    color: CHARTS_PIE_MAIN_COLOR,
    tooltip: {
      trigger: 'item',
      confine: true,
      backgroundColor: 'rgba(50, 50, 50, 0.7)',
      borderColor: 'rgba(50, 50, 50, 0.7)',
      textStyle: {
        color: '#fff',
        fontSize: 14,
      },
      formatter(params: any) {
        const tenThousandValue = params.data.tenThousandValue == null ? '--' : params.data.tenThousandValue;
        const unit = params.data.tenThousandValue == null ? '' : params.data.unit;
        return `<div style="text-align: left;font-size:14px;padding:2px 8px;box-sizing: border-box;">
                  <div>${params.name}</div>
                  <div>成本占比：${params.percent}%</div>
                  <div>(${thousandSeparation(tenThousandValue) ?? '--'}${
          (thousandSeparation(tenThousandValue) ?? '--') !== '--' ? unit : ''
        })</div>
                </div>`;
      },
    },
    legend: {
      height: '80%',
      type: 'scroll',
      orient: 'vertical',
      top: 'middle',
      right: '5%',
      itemGap: 20,
      itemWidth: 20,
      itemHeight: 8,
      textStyle: {
        color: 'rgba(0, 0, 0, 0.65)',
        fontSize: 14,
        lineHeight: 22,
        height: 22,
      },
      zlevel: 6,
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
      data: mapPieLegendData(costAnalysisService.costPieData.seriesData),
      selected: mapPieSelected(costAnalysisService.costPieData.seriesData),
      tooltip: {
        show: true,
      },
    },
    series: [
      {
        type: 'pie',
        startAngle: 120,
        radius: [0, '60%'],
        center: ['35%', '55%'],
        // 延伸线
        labelLine: {
          length: 10,
          length2: 20,
        },
        data: mapPieSeriesData(costAnalysisService.costPieData.seriesData),
        emphasis: {
          itemStyle: {
            borderWidth: 20,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          formatter: (param: any) => {
            return format.truncateText(param.data.name, 120, '14px PingFangSC-Regular', '…', {});
          },
        },
      },
    ],
  };
};
/**
 * 处理数据
 * @param data
 */
const mapPieSeriesData = (data: CA_IPieSeriesDataVO[]) => {
  //处理饼图数据
  const arr: any[] = [];
  data.forEach((item: any) => {
    const arrItem = {
      value: item.cost,
      name: item.treeName,
      unit: item.unit,
      tenThousandValue: item.tenThousandCost,
    };
    arr.push(arrItem);
  });
  return arr;
};
//饼图--处理无数据
const mapPieSelected = (data: any) => {
  const selectObj: any = {};
  data.forEach((item: any) => {
    if (item.cost == 0) {
      selectObj[item.treeName] = false;
    } else {
      selectObj[item.treeName] = true;
    }
  });
  return selectObj;
};
/**
 * 处理legend数据
 * @param data
 */
const mapPieLegendData = (data: CA_IPieSeriesDataVO[]) => {
  //处理饼图数据
  const arr: any[] = [];
  data.forEach((item: any) => {
    const arrItem = {
      name: item.treeName,
    };
    arr.push(arrItem);
  });
  return arr;
};

onMounted(() => {
  if (costAnalysisService.costPieData.seriesData?.length) {
    const options = mapChartsOptions();
    initChart(chartRef.value!, options);
  }
});
</script>
<style lang="less" scoped>
.ca-proportion-pie {
  width: 100%;
  height: 400px;

  .cpp-charts {
    width: 100%;
    height: 100%;

    * {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
