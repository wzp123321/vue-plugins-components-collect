<template>
  <view class="ea-scan">
    <view class="es-count">{{ thousandSeparation(props.totalItem.energyValue) }}</view>
    <view class="es-subitem" v-if="props.tbCompare.tbFlag || props.tbCompare.hbFlag">
      <view :class="['es-card es-month', mapColorClass(props.totalItem.lastYearRatio)]" v-if="props.tbCompare.tbFlag">
        <text class="es-card-title">同比</text>
        <IconTop v-if="props.totalItem.lastYearRatio && props.totalItem.lastYearRatio > 0"></IconTop>
        <IconBottom v-if="props.totalItem.lastYearRatio && props.totalItem.lastYearRatio < 0"></IconBottom>
        <text>{{ mapValueLabel(props.totalItem.lastYearRatio) }}</text>
      </view>
      <view :class="['es-card es-year', mapColorClass(props.totalItem.lastMonthRatio)]" v-if="props.tbCompare.hbFlag">
        <text class="es-card-title">环比</text>
        <IconTop v-if="props.totalItem.lastMonthRatio && props.totalItem.lastMonthRatio > 0"></IconTop>
        <IconBottom v-if="props.totalItem.lastMonthRatio && props.totalItem.lastMonthRatio < 0"></IconBottom>
        <text>{{ mapValueLabel(props.totalItem.lastMonthRatio) }}</text>
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
// 工具方法
import type { PropType } from 'vue';
import { thousandSeparation } from '../../../utils/index';
// 组件
import { IconTop, IconBottom } from '@arco-iconbox/vue-tem';
// 接口
import type { Ea_IAnalysisTotalVO } from '../energy-analysis.api';
import type { Common_ITHCompareVO } from '@/api/model';
// props
const props = defineProps({
  // 能耗量
  totalItem: {
    type: Object as PropType<Ea_IAnalysisTotalVO>,
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
});
/**
 * 数据高亮
 * @param {number | null} value
 */
const mapColorClass = (value: number | null) => {
  return value !== null ? (value > 0 ? 'positive' : value < 0 ? 'negative' : '') : '';
};
/**
 * 数据文本
 * @param value
 */
const mapValueLabel = (value: number | null) => {
  return value === null || isNaN(value) ? '-' : `${value}%`;
};
</script>
<style lang="scss" scoped>
.ea-scan {
  background-color: var(--tem-color-white);
  padding: 48rpx 48rpx 32rpx;
  row-gap: 48rpx;
  display: flex;
  flex-direction: column;

  .es-count {
    text-align: center;
    color: var(--tem-text-color-primary);
    font-size: var(--tem-font-size-oh32);
    height: 80rpx;
    line-height: 64rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: D-DIN-DIN-Bold;
  }

  .es-subitem {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    column-gap: 16rpx;

    .es-card {
      width: calc(50% - 8rpx);
      box-sizing: border-box;
      padding: 16rpx 0;
      background-color: var(--tem-fill-color);
      font-size: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8rpx;
      font-family: D-DIN;

      &.positive {
        color: var(--tem-color-danger);
      }

      &.negative {
        color: var(--tem-color-success);
      }

      .es-card-title {
        color: var(--tem-text-color-secondary);
        margin-right: 8rpx;
      }
    }
  }
}
</style>
