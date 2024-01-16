<template>
  <view class="ecc-subitem">
    <view class="ecc-subitem-item is-percent">
      <text class="ecc-subitem-item-label">占比</text>
      <text class="ecc-subitem-item-value">
        {{ props.nodeItem.percent !== '' && props.nodeItem.percent !== null ? props.nodeItem.percent : '-' }}
      </text>
    </view>
    <!-- 分割线 -->
    <view class="ecc-subitem-divider">
      <view class="ecc-subitem-divider-body"></view>
    </view>
    <view class="ecc-subitem-item is-data">
      <view class="ecc-subitem-item-row">
        <text class="ecc-subitem-item-label">总用量({{ props.nodeItem.energyUnit }})</text>
        <text class="ecc-subitem-item-value">
          {{ thousandSeparation(props.nodeItem.energyValue) }}
        </text>
      </view>
      <view class="ecc-subitem-item-row">
        <text class="ecc-subitem-item-label">总成本({{ props.nodeItem.costUnit }})</text>
        <text class="ecc-subitem-item-value">
          {{ thousandSeparation(props.nodeItem.costValue) }}
        </text>
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
// 公共库
import type { PropType } from 'vue';
// 工具方法
import { thousandSeparation } from '../../../../utils';
// 类型
import type { Ec_INodeItem } from '../../energy-consumption.api';
// props
const props = defineProps({
  // 单项
  nodeItem: {
    type: Object as PropType<Ec_INodeItem>,
    default: null,
  },
});
</script>
<style lang="scss" scoped>
.ecc-subitem {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48rpx;

  .ecc-subitem-item {
    display: flex;
    row-gap: 8rpx;
    flex-direction: column;
    align-items: flex-start;

    .ecc-subitem-item-label,
    .ecc-subitem-item-value {
      display: inline-block;
      font-size: var(--tem-font-size-b14);
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .ecc-subitem-item-label {
      color: rgb(144, 147, 153);
      line-height: 44rpx;
    }

    .ecc-subitem-item-value {
      color: var(--tem-text-color-primary);
      font-size: 36rpx;
      line-height: 36rpx;
      font-family: D-DIN-DIN-Bold;
    }

    .ecc-subitem-item-row {
      display: flex;
      align-items: center;
      column-gap: 8rpx;
      width: 100%;

      .ecc-subitem-item-value {
        flex: auto;
        text-align: right;
      }
    }

    &.is-percent {
      width: 144rpx;

      .ecc-subitem-item-label,
      .ecc-subitem-item-value {
        width: 100%;
        text-align: center;
      }
    }

    &.is-data {
      flex: auto;
    }
  }

  .ecc-subitem-divider {
    // 最大宽度&支持缩放
    flex: 0 0 98rpx;
    text-align: center;
    flex-shrink: 1;

    .ecc-subitem-divider-body {
      width: 2rpx;
      min-width: 2rpx;
      margin: 0 auto;
      height: 96rpx;
      background-color: var(--tem-border-color-light);
    }
  }
}
</style>
