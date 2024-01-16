<template>
  <view :class="['ea-charts', landscapeFlag ? 'is-landscape' : '']">
    <view class="ec-box">
      <view class="ec-box-header">
        <text>能耗趋势</text>
        <icon-full-screen v-if="mapFullScreen()" @click="triggerLandscapeFlag(true)" />
        <icon-close v-if="props.landscapeFlag && !props.emptyFlag" @click="triggerLandscapeFlag(false)" />
      </view>
      <view class="ec-box-container" v-if="!props.loading">
        <qiun-data-charts
          v-if="isShowRotate && !props.emptyFlag"
          type="mix"
          :opts="chartOptions"
          :chartData="chartData"
          tooltipFormat="tooltipFormatThousand"
          @getIndex="getChartIndex"
        />
        <view class="ec-box-container-empty" v-if="props.emptyFlag">
          <text>暂无数据</text>
        </view>
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { ref, type PropType, onBeforeMount, watch, reactive, computed, nextTick } from 'vue';
import { useStore } from 'vuex';
// 配置
import { mapEnergyColorByCode } from '@/config/config';
// 组件
import { IconFullScreen, IconClose } from '@arco-iconbox/vue-tem';
// 枚举
import { Common_ETimeUnit } from '@/config/enum';
// 工具方法
import { formatDate, mapIsWxWorkH5Plat, pxToRpx, rpxToPx } from '@/utils';
// API
import type { Ec_IChartTouchEvent } from '@/pages/energy-consumption/energy-consumption.api';
import type { Ea_IChartVO } from '../energy-analysis.api';
import type { Common_ITHCompareVO } from '@/api/model';

// props
const props = defineProps({
  // 能源类型
  energyCode: {
    type: String,
    default: '00000',
  },
  // 能耗名称
  energyName: {
    type: String,
    default: '',
  },
  // 是否横屏
  landscapeFlag: {
    type: Boolean,
    default: false,
  },
  // 时间颗粒度
  timeUnit: {
    type: String,
    default: '',
  },
  // 数据
  chartItem: {
    type: Object as PropType<Ea_IChartVO>,
    default: {},
  },
  // 同环比
  tbCompare: {
    type: Object as PropType<Common_ITHCompareVO>,
    default: {
      tbFlag: true,
      hbFlag: true,
    },
  },
  // 空状态
  emptyFlag: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  // 单位
  unit: {
    type: String,
    default: 'kwh',
  },
});
// emits
const emits = defineEmits(['change', 'drill']);

// 数据
const chartData = ref<any>({});
// y轴配置
const yOption = {
  type: 'value',
  titleFontSize: 12,
  fontSize: 12,
  axisLine: false,
  fontColor: 'rgb(144, 146, 152)', // 字体颜色
  titleFontColor: 'rgb(144, 146, 152)', // 字体颜色
};
// 能耗y轴
const energyYAxis = computed(() => {
  return {
    title: props.unit,
    position: 'left',
    titleOffsetX: -12,
    titleOffsetY: -8,
    // min: 0,
    format: 'yAxisFormatNumber',
    ...yOption,
  };
});
// 同环比y轴
const thYAxis = {
  title: '%',
  position: 'right',
  titleOffsetX: 24,
  titleOffsetY: -8,
  format: 'yAxisFormatNumber',
  ...yOption,
};

/**
 * 是否展示全屏,企业微信端不展示全屏
 * @returns {boolean}
 */
const mapFullScreen = (): boolean => {
  return !mapIsWxWorkH5Plat() && !props.landscapeFlag && !props.emptyFlag;
};
// 是否渲染
const isShowRotate = ref<boolean>(true);
/**
 * 图表配置
 */
const chartOptions = reactive<any>({
  color: [mapEnergyColorByCode(props.energyCode, 'rgb(24, 144, 255)'), 'rgb(134, 181, 252)', 'rgb(194, 234, 174)'],
  padding: [15, 6, 6, 12],
  enableScroll: false, // 禁用x滚轮
  dataLabel: false, // 隐藏数据点标签
  dataPointShape: true, // 是否显示数据点的图形标识
  dataPointShapeType: 'hollow',
  // 设备像素比，解决开启canvas2d后画布模糊的问题
  pixelRatio: 1,
  // 是否开启动画
  animation: false,
  // 横屏模式
  rotate: props.landscapeFlag,
  // 横屏锁定模式，如果开启横屏模式后，图表交互每次都会旋转90度，请赋值true
  rotateLock: props.landscapeFlag,
  xAxis: {
    disableGrid: true,
    fontColor: 'rgb(144, 146, 152)',
    fontSize: 12,
    // 非全屏时少显示几个
    labelCount: props.landscapeFlag ? props.chartItem.itemList.length : Math.min(props.chartItem.itemList.length, 14),
    itemCount: props.chartItem.itemList.length,
  },
  yAxis: {
    gridType: 'dash',
    gridColor: 'rgb(220, 223, 230)',
    // 多y轴
    data: [energyYAxis.value, thYAxis],
  },
  // 额外配置
  extra: {
    // 折线图
    line: {
      type: 'straight',
    },
    // 柱状图
    column: {
      width: 7, // 柱子宽度
    },
    tooltip: {
      show: true,
    },
    yAxis: {
      format: (value: any) => {
        console.log(value);
        return '12111';
      },
      formatter: (value: any) => {
        console.log(value);
        return '12111';
      },
    },
    legend: {
      // 图例
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 16,
      fontSize: 12, // 字体大小
      fontColor: 'var(--tem-text-color-regular)', // 字体颜色
    },
  },
});
/**
 * 处理配置
 */
const mapChartOptions = () => {
  chartOptions.color = [mapEnergyColorByCode(props.energyCode, 'rgb(24, 144, 255)')];
  if (props.tbCompare.tbFlag) {
    chartOptions.color.push('rgb(134, 181, 252)');
  }
  if (props.tbCompare.hbFlag) {
    chartOptions.color.push('rgb(194, 234, 174)');
  }
  chartOptions.rotate = props.landscapeFlag;
  chartOptions.rotateLock = props.landscapeFlag;
  chartOptions.xAxis.labelCount = props.landscapeFlag ? props.chartItem.itemList.length : 12;
  chartOptions.yAxis.data =
    props.tbCompare.hbFlag || props.tbCompare.tbFlag ? [energyYAxis.value, thYAxis] : [energyYAxis.value];
};
// store
const store = useStore();
/**
 * 容器宽高
 */
const mapChartSize = () => {
  const { windowWidth, windowHeight } = store.getters.systemInfo;
  const container = document.querySelector('.energy-analysis') as HTMLElement;
  if (container) {
  }
  // 横屏时，
  const w = props.landscapeFlag
    ? windowWidth - rpxToPx('32') * 2 - rpxToPx('32') * 2 - rpxToPx('48')
    : windowWidth - rpxToPx('32') * 2;
  const h = props.landscapeFlag
    ? windowHeight - rpxToPx('88') - rpxToPx('16') * 2 - rpxToPx('24') * 2
    : windowHeight - rpxToPx('728') - rpxToPx('88') - rpxToPx('24') * 2 - rpxToPx('48');
  console.log('  width, height,', windowWidth, windowHeight, w, h, pxToRpx(w + ''), pxToRpx(h + ''));
  return {
    width: `${pxToRpx(w + '')}rpx`,
    height: `${pxToRpx(h + '')}rpx`,
  };
};

/**
 * 图表数据
 */
const getServerData = () => {
  chartData.value = {
    categories: props.chartItem.itemList?.map((item) => mapXAxis(item.timeStamp)),
    series: [
      // 能耗数据
      {
        index: 0,
        type: 'column',
        name: props.energyName,
        data: props.chartItem.itemList?.map((item) => item.energyValue),
        addPoint: true,
      },
    ],
  };
  if (props.tbCompare.tbFlag) {
    // 同比
    chartData.value.series.push({
      index: 1,
      type: 'line',
      name: '同比',
      data: props.chartItem.itemList?.map((item) => item.lastYearRatio),
      addPoint: true,
    });
  }
  if (props.tbCompare.hbFlag) {
    // 环比
    chartData.value.series.push({
      index: 1,
      type: 'line',
      name: '环比',
      data: props.chartItem.itemList?.map((item) => item.lastMonthRatio),
      addPoint: true,
    });
  }

  console.log('chartData0-----------------', chartData);
};
/**
 * 格式化x轴
 * @param timeStamp
 */
const mapXAxis = (timeStamp: number | null) => {
  const formatStr = props.timeUnit === Common_ETimeUnit.日 ? 'H' : props.timeUnit === Common_ETimeUnit.月 ? 'd' : 'M';
  return timeStamp !== null ? formatDate(new Date(timeStamp), formatStr) : '';
};
/**
 * 横屏
 * @param {boolean} value
 * @returns {void}
 */
const triggerLandscapeFlag = (value: boolean): void => {
  emits('change', value);

  // 让图标重新渲染
  isShowRotate.value = false;
  setTimeout(() => {
    isShowRotate.value = true;
    mapChartOptions();
  });
};
/**
 * 获取点击的index
 * @param e
 * @returns {void}
 */
const getChartIndex = (e: Ec_IChartTouchEvent): void => {
  if (props.timeUnit !== Common_ETimeUnit.日) {
    const index = e.currentIndex.index;
    if (index !== -1) {
      emits('drill', index, props.chartItem.itemList[index].timeStamp);
    }
  }
};
/**
 * 监听数据变化
 */
watch(
  () => props.chartItem,
  () => {
    nextTick(() => {
      getServerData();
      mapChartOptions();
    });
  },
  {
    deep: true,
  },
);
/**
 * 初始化
 */
onBeforeMount(() => {
  getServerData();
});
</script>
<style lang="scss" scoped>
.ea-charts {
  flex: auto;
  background-color: var(--tem-bg-color-page);

  .ec-box {
    width: 100%;
    height: 100%;
    padding: 24rpx 32rpx;
    background-color: var(--tem-color-white);
    display: flex;
    flex-direction: column;
    gap: 24rpx;

    .ec-box-header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      > text {
        color: var(--tem-text-color-primary);
        font-size: 32rpx;
        line-height: 48rpx;
        font-weight: 600;
      }

      > svg {
        width: 48rpx;
        height: 48rpx;
        color: var(--tem-text-color-regular);
      }
    }

    .ec-box-container {
      flex: auto;
      overflow: hidden;

      .ec-box-container-empty {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        > text {
          font-size: var(--tem-font-size-b14);
          color: var(--tem-text-color-secondary);
        }
      }
    }
  }

  // 横屏
  &.is-landscape {
    padding: 16rpx 32rpx;

    .ec-box {
      flex-direction: row-reverse;
      border-radius: 16rpx;

      .ec-box-header {
        flex-direction: column;
        width: 48rpx;

        > text {
          white-space: nowrap;
          transform: rotate(90deg) translateX(44rpx);
        }
      }

      .ec-box-container {
        flex: auto;
        height: 100%;
      }
    }
  }
}
</style>
