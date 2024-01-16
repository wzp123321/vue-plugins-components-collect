<!--
 * @Author: yut
 * @Date: 2023-11-14 15:24:00
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2023-12-28 10:50:46
 * @Descripttion: 
-->
<template>
  <view class="ec-device-card">
    <view class="edc-container">
      <view class="edc-header">
        <text v-for="title in childrenItemHead" :key="title">{{ title }}</text>
      </view>
      <view class="edc-content">
        <view v-for="(device, index) in childTreeList" :key="index" class="edc-content-item">
          <view class="edc-content-name">{{ device.itemName }}</view>
          <view class="edc-content-value">{{ thousandSeparation(device.energyValue) }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue';
import type { Ec_INodeItem } from '../energy-consumption.api';
import { thousandSeparation } from '@/utils';

const props = defineProps({
  childTreeList: {
    type: Array as PropType<Ec_INodeItem[]>,
    default: () => [],
  },
  // 表头
  childrenItemHead: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});
</script>

<style lang="scss" scoped>
.ec-device-card {
  width: 100%;
  padding: 0 32rpx 32rpx;
  .edc-container {
    padding: 24rpx 32rpx;
    border-radius: 16rpx;
    background-color: var(--tem-bg-color);
  }
  .edc-header {
    display: flex;
    align-items: center;
    height: 60rpx;
    justify-content: space-between;
    font-size: 24rpx;
    color: var(--tem-text-color-placeholder);
    border-bottom: 1rpx solid var(--tem-border-color-light);
  }
  .edc-content {
    &-item {
      height: 108rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16rpx;
      border-bottom: 1rpx solid var(--tem-border-color-light);
      view {
        font-size: var(--tem-font-size-b14);
        color: var(--tem-text-color-regular);
        // flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      view:nth-child(1) {
        text-align: left;
      }
      view:nth-child(2) {
        text-align: right;
      }
    }
    &-name {
      flex: auto;
    }
    &-value {
      max-width: 232rpx;
      flex: none;
    }
  }
}
</style>
