<template>
  <view class="ecc-total">
    <text class="ecc-total-label">总能耗值({{ props.nodeItem.energyUnit }})</text>
    <text class="ecc-total-label">总成本({{ props.nodeItem.costUnit }})</text>
    <text class="ecc-total-value">{{ thousandSeparation(props.nodeItem.energyValue) }}</text>
    <text class="ecc-total-value">{{ thousandSeparation(props.nodeItem.costValue) }}</text>
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
.ecc-total {
  display: grid;
  grid-template-columns: repeat(auto-fill, 50%);
  gap: 8rpx 0;
  margin-bottom: 48rpx;

  .ecc-total-label,
  .ecc-total-value {
    display: inline-block;
    font-size: var(--tem-font-size-b14);
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .ecc-total-label {
    color: rgb(144, 147, 153);
    line-height: 44rpx;
  }

  .ecc-total-value {
    color: var(--tem-text-color-primary);
    font-size: 36rpx;
    line-height: 36rpx;
    font-family: D-DIN-DIN-Bold;
  }
}
</style>
