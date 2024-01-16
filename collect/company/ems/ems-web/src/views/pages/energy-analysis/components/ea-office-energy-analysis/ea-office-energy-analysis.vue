<template>
  <div class="ea-office-energy-analysis" v-loading="energyBarService.loading">
    <div class="eoea-header" v-show="!isShowNoData && !energyBarService.loading">
      <div v-for="(item, index) in thbDataList" class="eoea-header-item" @click="onThbSelect(index)">
        <span
          v-show="(item.title === '同比' && isMH.tbFlag) || (item.title === '环比' && isMH.hbFlag)"
          class="eoea-item-legend"
          :style="{ backgroundColor: item.isActive ? item.activeColor : item.color }"
        ></span>
        <span
          v-show="(item.title === '同比' && isMH.tbFlag) || (item.title === '环比' && isMH.hbFlag)"
          class="eoea-item-name"
          :style="{ color: item.isActive ? item.activeColor : item.color }"
        >
          {{ item.title }}
        </span>
      </div>
    </div>
    <div id="eoea-echart-container" v-show="!isShowNoData"></div>
    <no-data v-show="isShowNoData"></no-data>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { ITHCompareVO, checkHasTHCompare } from '../../utils/check';
import { ECharts, init } from 'echarts';
import EchartsConfig from '@/config/echarts/index';
import { useStore } from 'vuex';
import { thousandSeparation } from '@/utils';
import { EnergyBarService, TableParams } from './ea-office-energy-analysis.service';
import { useCommonController } from '@/utils/use-common-controller';
import { debounce } from 'lodash';
import {
  EAEO_ILastYearRatioList,
  EODA_ILineChartDataList,
  EOEA_EColorType,
  EOEA_IBarChatRes,
  EOEA_IYaxisVO,
} from './ea-office-energy-analysis.api';
import { Common_ETimeUnit } from '@/services/common/common-api';

interface ThbItem {
  title: string;
  isActive: boolean;
  color: string;
  activeColor: string;
}

const { emitter } = useCommonController();
// 是否展示缺省图
const isShowNoData = ref(false);
// 数据服务
const energyBarService = new EnergyBarService();
// 图标实例
let myEchart: ECharts | null = null;

onMounted(() => {
  emitter.on(
    'search-office-global',
    debounce((searchParam: TableParams) => {
      // 重置选中状态
      thbDataList.value = thbDataList.value?.map((item) => {
        return {
          ...item,
          isActive: false,
        };
      });
      // 判断是否需要展示同环比
      isMH.value = checkHasTHCompare(Common_ETimeUnit.天, [searchParam.startTime, searchParam.endTime], false);
      // 图表清除实例
      myEchart?.clear();
      if (!myEchart) {
        nextTick(() => {
          myEchart = init(document.getElementById('eoea-echart-container')!);
        });
      }
      energyBarService.tableParams.startTime = searchParam.startTime.split(' ')[0];
      energyBarService.tableParams.endTime = searchParam.endTime.split(' ')[0];
      energyBarService.tableParams.energyCode = searchParam.energyCode;
      energyBarService.tableParams.treeId = searchParam.treeId;

      energyBarService.query().then((tag: boolean) => {
        if (!tag) {
          isShowNoData.value = true;
        } else {
          isShowNoData.value = false;
        }
        myEchart?.setOption(getBarLineEchartsOption());

        window.removeEventListener('resize', resize);
        window.addEventListener('resize', resize);
      });
    }, 300),
  );
});
onUnmounted(() => {
  window.onresize = null;
  emitter.off('search-office-global');

  if (myEchart) {
    myEchart?.dispose();
  }
});

const resize = () => {
  if (myEchart) {
    myEchart?.resize();
  }
};
const store = useStore();
const theme = computed(() => {
  return store.getters.theme || 'light';
});

const isMH = ref<ITHCompareVO>({
  tbFlag: true,
  hbFlag: true,
});

const thbDataList = ref<ThbItem[]>([
  {
    title: '同比',
    isActive: false,
    color: 'rgba(0, 0, 0, 0.25)',
    activeColor: EOEA_EColorType.同比,
  },
  {
    title: '环比',
    isActive: false,
    color: 'rgba(0, 0, 0, 0.25)',
    activeColor: EOEA_EColorType.环比,
  },
]);

// 获取配置
const getBarLineEchartsOption = () => {
  const fontColor = EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR;
  const option: any = {
    tooltip: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_TOOLTIP_OPTION, {
      extraCssText:
        'color:#fff;text-align:left;box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15);border-radius:4px;z-index:99;',
      borderColor: 'transparent',
      formatter: (params: any) => {
        let html = '';
        const xAxisTimeArr: string[] = energyBarService.barData?.xaxisTimes;
        let nowDate = xAxisTimeArr[params[0].dataIndex];
        html += `<div class="tool-box" style="position:relative;">
                          <div class="tool-title">${nowDate}
                          </div>`;
        params.forEach((item: any) => {
          let Unit = '';
          if (item.value || item.value === 0) {
            Unit = energyBarService.barData?.yaxisItemList[0]?.unit || '';
          }
          const color =
            item.name.indexOf('同比') !== -1
              ? EOEA_EColorType.同比
              : item.name.indexOf('环比') !== -1
              ? EOEA_EColorType.环比
              : item.color;
          const name = item.name.replace('能耗能耗', '能耗');
          html +=
            `<div class="tool-item">
                <div>
                  <span style="height:8px;width:8px;display:inline-block;margin-right: 8px;
                  border:1px solid #fff;background-color:${color}">
                  </span>${name} : ${thousandSeparation(item.value) ?? '--'}${Unit}` +
            `</div></div>
                  <div>`;
        });
        return html;
      },
    }),
    legend: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_LEGEND_OPTION, {
      type: 'scroll',
      bottom: 10,
      itemGap: 24,
      pageIconColor: '#1890ff',
      pageIconInactiveColor: '#d8d8d8',
      pageTextStyle: {
        color: 'rgba(0, 0, 0, 0.65)',
      },
      y: 'bottom',
      icon: 'rect',
      selectedMode: false,
      height: 22,
      itemHeight: 8,
      itemWidth: 20,
      textStyle: {
        color: 'rgba(0, 0, 0, 0.65)',
        fontSize: 14,
        lineHeight: 22,
      },
      data: mapLegendData(),
    }),
    grid: {
      left: '3%',
      right: '3%',
      top: 50,
      bottom: 40,
      containLabel: true,
    },
    xAxis: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_AXIS_CATEGORY_OPTION, {
      data: energyBarService.barData?.xaxisTimes?.map((item) => {
        return item.slice(5);
      }),
    }),
    yAxis: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_AXIS_VALUE_OPTION, {
      offset: 0,
      name: mapYaxisName(energyBarService.barData?.yaxisItemList),
      nameLocation: 'end',
      nameTextStyle: {
        align: 'center',
        fontSize: EchartsConfig.echartsConstant.CHARTS_FONT_SIZE_14,
        color: fontColor,
        padding: [0, 0, 10, -10],
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR,
        },
      },
    }),
    series: resetSeries(energyBarService.barData),
  };
  return option;
};
/**
 * 图表---series
 */
const resetSeries = (barData: EOEA_IBarChatRes) => {
  const data: any[] = [];
  // 柱状图
  if (barData?.lineChartSeriesList?.length) {
    const arrItem = {
      type: 'bar',
      barMaxWidth: '14px',
      name: barData?.colorDescList?.length ? barData?.colorDescList?.[0]?.desc : '',
      itemStyle: {
        color: barData?.colorDescList?.length ? barData?.colorDescList[0]?.color : EOEA_EColorType.正常,
      },
      animation: !thbDataList.value[0].isActive || !thbDataList.value[0].isActive,
      stack: 'stack',
      data: resetSeriesBorder(barData?.lineChartSeriesList?.[0]?.lineChartDataList, barData?.colorList),
    };
    data.push(arrItem);

    //   如果legend数组大于1条
    if (barData?.colorDescList?.length > 1) {
      barData?.colorDescList?.forEach((item, index) => {
        if (index !== 0) {
          data.push({
            type: 'bar',
            barMaxWidth: '14px',
            animation: !thbDataList.value[0].isActive || !thbDataList.value[0].isActive,
            name: barData?.colorDescList?.length ? barData?.colorDescList?.[index]?.desc : '',
            itemStyle: {
              color: barData?.colorDescList?.length ? barData?.colorDescList?.[index]?.color : EOEA_EColorType.正常,
            },
            stack: 'stack',
            data: [],
          });
        }
      });
    }
  }
  // 同比
  if (energyBarService?.lastYearValueList.value?.length) {
    const arrItem = {
      type: 'line',
      name: barData?.lineChartSeriesList?.[0]?.energyType ? `同比${barData?.lineChartSeriesList?.[0]?.energyType}` : '',
      data: thbDataList.value[0].isActive
        ? getDataIsShowDot(energyBarService?.lastYearValueList.value, EOEA_EColorType.同比)
        : [],

      symbol: 'circle',
      symbolSize: 16,
      smooth: true,
      showSymbol: true,
      cursor: 'default',
      emphasis: {
        itemStyle: EchartsConfig.echartsUtils.getsymbolStyle(EOEA_EColorType.同比),
      },
      itemStyle: resetItemStyle(EOEA_EColorType.同比),
      lineStyle: {
        width: 1,
      },
    };
    data.push(arrItem);
  }
  // 环比
  if (energyBarService?.lastMonthValueList.value?.length) {
    const arrItem = {
      type: 'line',
      name: barData?.lineChartSeriesList?.[0]?.energyType ? `环比${barData?.lineChartSeriesList?.[0]?.energyType}` : '',
      data: thbDataList.value[1].isActive
        ? getDataIsShowDot(energyBarService?.lastMonthValueList.value, EOEA_EColorType.环比)
        : [],
      symbol: 'circle',
      symbolSize: 16,
      smooth: true,
      showSymbol: true,
      cursor: 'default',
      emphasis: {
        itemStyle: EchartsConfig.echartsUtils.getsymbolStyle(EOEA_EColorType.环比),
      },
      itemStyle: resetItemStyle(EOEA_EColorType.环比),
      lineStyle: {
        width: 1,
      },
    };
    data.push(arrItem);
  }
  return data;
};

const getDataIsShowDot = (data: any, color: string) => {
  if (data && data.length && data.length > 0) {
    let arrItem = {};
    const arrData: any[] = [];
    data.forEach((item: any, index: any) => {
      if (index === 0 && item.value !== null && ((data.length > 1 && data[1].value === null) || data.length === 1)) {
        arrItem = {
          value: item.value,
          name: item.name,
          itemStyle: {
            color,
          },
        };
        arrData.push(arrItem);
      } else if (
        item.value !== null &&
        data.length > 1 &&
        index === data.length - 1 &&
        data[data.length - 2].value === null
      ) {
        arrItem = {
          value: item.value,
          name: item.name,
          itemStyle: {
            color,
          },
        };
        arrData.push(arrItem);
      } else if (item.value !== null && index > 0 && data[index - 1].value === null && data[index + 1].value === null) {
        arrItem = {
          value: item.value,
          name: item.name,
          itemStyle: {
            color,
          },
        };
        arrData.push(arrItem);
      } else {
        arrItem = {
          value: item.value,
          name: item.name,
          itemStyle: {
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
};
const resetItemStyle = (color: string) => {
  const style = {
    color: {
      type: 'radial',
      x: 0.5,
      y: 0.5,
      r: 0.5,
      colorStops: [
        {
          offset: 0,
          color: '#FFFFFF',
        },
        {
          offset: 0.2,
          color: '#FFFFFF',
        },
        {
          offset: 0.3,
          color: '#FFFFFF',
        },
        {
          offset: 0.4,
          color,
        },
        {
          offset: 0.5,
          color,
        },
        {
          offset: 1,
          color,
        },
      ],
      globalCoord: false, // 缺省为 false
    },
    borderColor: {
      type: 'radial',
      x: 0.5,
      y: 0.5,
      r: 0.5,
      colorStops: [
        {
          offset: 0,
          color: '#FFFFFF',
        },
        {
          offset: 0.8,
          color: '#FFFFFF',
        },
        {
          offset: 1,
          color,
        },
      ],
      globalCoord: false, // 缺省为 false
    },
    borderWidth: 5,
  };
  return {
    normal: { color },
    emphasis: style,
  };
};
/**
 * 处理y轴数据源border样式
 */
const resetSeriesBorder = (bData: EODA_ILineChartDataList[], colors: string[]) => {
  const data: any[] = [];

  bData.forEach((item: any, index: number) => {
    let arrItem = {};
    let seat = '\uFEFF';
    for (let s = 0; s < index; s++) {
      seat = seat + '\uFEFF';
    }
    if (!item && item !== 0) {
      arrItem = {
        name: item.name + seat,
        value: item.value,
      };
    } else {
      arrItem = {
        name: item.name + seat,
        value: item.value,
        itemStyle: {
          color: colors[index] ?? EOEA_EColorType.正常,
          borderRadius: item.value >= 0 ? [11, 11, 0, 0] : [0, 0, 11, 11],
        },
      };
    }
    data.push(arrItem);
  });
  return data;
};
/**
 * y轴名称
 */
const mapYaxisName = (yaxisItemList: EOEA_IYaxisVO[]) => {
  return `${yaxisItemList?.[0]?.title}(${yaxisItemList?.[0]?.unit})`;
};
/**
 * 获取图例数据
 */
const mapLegendData = () => {
  return energyBarService.barData?.colorDescList?.map((item) => {
    return {
      name: item?.desc,
    };
  });
};

// 同环比选择
const onThbSelect = (index: number) => {
  thbDataList.value[index].isActive = !thbDataList.value[index].isActive;
  myEchart?.setOption(getBarLineEchartsOption());
  if (myEchart) {
    myEchart.off('resize');
    // 点击事件
    myEchart.on('resize', () => myEchart?.resize());
  }
};
</script>
<style lang="less" scoped>
.ea-office-energy-analysis {
  width: 100%;
  height: calc(100% - 22px);
  position: relative;

  .eoea-header {
    position: absolute;
    top: 4px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .eoea-header-item {
      margin: 0 12px;
      display: flex;
      align-items: center;
      cursor: pointer;
      z-index: 9;

      .eoea-item-legend {
        display: inline-block;
        width: 20px;
        height: 2px;
      }

      .eoea-item-name {
        font-size: 14px;
        line-height: 22px;
        margin-left: 4px;
      }
    }
  }
  #eoea-echart-container {
    height: 100%;
    width: 100%;

    * {
      height: 100%;
      width: 100%;
    }
  }
}
</style>
