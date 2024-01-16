<template>
  <view :class="['ec-consumption-card', props.energyStickyFlag || !props.topLevelFlag ? 'is-sticky' : '']">
    <view class="ecc-container">
      <!-- 总能耗 -->
      <ecc-total v-if="!mapIsSubentry()" :nodeItem="props.consumptionData?.nodeItem"></ecc-total>
      <!-- 分项 -->
      <ecc-subitem :nodeItem="props.consumptionData?.nodeItem" v-else></ecc-subitem>
      <!-- 图表 -->
      <view class="ecc-container-charts" v-if="props.consumptionData.childrenItem.length > 0">
        <qiun-data-charts
          ref="chartRef"
          type="pie"
          :opts="options"
          :chartData="chartData"
          tooltipFormat="tooltipFormatPercent"
        />
      </view>
      <EccLegend
        v-if="props.consumptionData.childrenItem.length > 0"
        :legendList="legendList"
        :color-list="colorList"
        @legend-select="handleLegendSelect"
      ></EccLegend>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 公共库
import type { PropType } from 'vue';
import { onBeforeMount, reactive, ref, watch } from 'vue';
// api
import type { Ec_IConsumptionData } from '../energy-consumption.api';
import type { El_ILegendInfo } from './ecc-legend/ecc-legend.api';
// 配置
import { CHARTS_COLOR_GROUP_HEX, mapEnergyColorByName } from '@/config/config';
import { Common_EEnergyCode } from '@/config/enum';
// 组件
import EccTotal from './ecc-total/ecc-total.vue';
import EccSubitem from './ecc-subitem/ecc-subitem.vue';
import EccLegend from './ecc-legend/ecc-legend.vue';
// props
const props = defineProps({
  // 能源类型
  energyCode: {
    type: String,
    default: '00000',
  },
  // 数据
  consumptionData: {
    type: Object as PropType<Ec_IConsumptionData>,
    default: {},
  },
  // 是否吸顶
  energyStickyFlag: {
    type: Boolean,
    default: false,
  },
  // 如果是非顶级节点
  topLevelFlag: {
    type: Boolean,
    default: false,
  },
});
// 图表实例
const chartRef = ref();
/**
 * 是否是分项
 * @returns {boolean}
 */
const mapIsSubentry = (): boolean => {
  return props.energyCode !== Common_EEnergyCode.总能耗;
};
// 数据源
const chartData = reactive<any>({ series: [] });
// 图例
const legendList = ref<El_ILegendInfo[]>([]);
// 颜色
const colorList = ref<string[]>([]);
// 配置
const options = reactive({
  color: [],
  padding: [5, 5, 5, 5],
  enableScroll: false,
  extra: {
    pie: {
      activeOpacity: 0.5,
      activeRadius: 10,
      labelWidth: 15,
      offsetAngle: 330, // 避免0%过多，旋转一定角度
      border: true,
      borderWidth: 1, // 分割线的宽度
      borderColor: '#FFFFFF',
    },
    tooltip: {
      bgColor: '#000000', //主体背景颜色
      bgOpacity: 0.7, //背景颜色透明度
      gridType: 'dash', //辅助线类型（虚线）
      dashLength: 5, //虚线单段长度
      gridColor: '#1890ff', //辅助线颜色
      fontColor: '#eeeeee', //主体文字颜色
      horizentalLine: true, //是否显示横向辅助线
      xAxisLabel: true, //是否显示X轴辅助标签
      yAxisLabel: true, //是否显示Y轴辅助标签
      labelBgColor: '#DFE8FF', //标签背景颜色
      labelBgOpacity: 0.95, //背景颜色透明度
      labelFontColor: '#666666', //标签文字颜色
    },
  },
  legend: {
    // 不显示图例
    show: false,
  },
});
/**
 * 图表数据
 * @returns {void}
 */
const setChartData = (): void => {
  chartData.series = [
    {
      data: mapSeriesData(),
    },
  ];
};
/**
 * 生成配置
 * @returns {void}
 */
const mapOptions = (): void => {
  options.color =
    (mapDataList()?.map((item, index) => {
      return props.energyCode === Common_EEnergyCode.总能耗
        ? mapEnergyColorByName(item.itemName)
        : CHARTS_COLOR_GROUP_HEX[index % CHARTS_COLOR_GROUP_HEX.length];
    }) as any) ?? [];
  colorList.value = [...options.color];
};
/**
 * 生成series数据
 */
const mapSeriesData = () => {
  return (
    mapDataList()?.map((item) => {
      return {
        name: item.itemName,
        value: item.percentValue,
        legendShape: 'rect',
        show: true,
        labelText: item.percentValue === null ? '-' : `${Number(item.percentValue)}%`,
      };
    }) ?? []
  );
};
/**
 * 处理图例勾选
 * @param selected
 * @param index
 */
const handleLegendSelect = (selected: boolean, index: number) => {
  legendList.value[index].selected = selected;
  chartData.series[0].data[index].show = selected;
};
/**
 * 处理顺序
 */
const mapDataList = () => {
  return props.consumptionData.childrenItem?.sort((a: any, b: any) => {
    // 排序，解决百分比重叠(降序)
    return b.energyValue - a.energyValue;
  });
};

watch(
  () => props.consumptionData.childrenItem,
  () => {
    setChartData();
    legendList.value = mapDataList().map((item) => ({
      legendId: item.itemId,
      legendName: item.itemName,
      selected: true,
    }));
    mapOptions();
  },
);
onBeforeMount(() => {
  setChartData();
  legendList.value = mapDataList().map((item) => ({
    legendId: item.itemId,
    legendName: item.itemName,
    selected: true,
  }));
  mapOptions();
});
</script>

<style lang="scss" scoped>
.ec-consumption-card {
  width: 100%;
  padding: 16rpx 32rpx 32rpx;
  box-sizing: border-box;

  .ecc-container {
    border-radius: 16rpx;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.23) 0%, rgba(255, 255, 255, 1) 100%);
    box-shadow: 8rpx 0px 40rpx rgba(0, 0, 0, 0.03);
    backdrop-filter: blur(100rpx);
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    transition: all 233ms;
    padding: 32rpx;

    .ecc-container-charts {
      width: 100%;
      height: 426rpx;
      overflow: hidden;
    }
  }

  &.is-sticky .ecc-container {
    opacity: 1;
    background-color: var(--tem-color-white);
    transition: all 233ms;
  }

  .ecc-no-device {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    img {
      width: 324rpx;
      height: 324rpx;
    }

    view {
      font-size: 32rpx;
      line-height: 48rpx;
    }
  }
}
</style>
