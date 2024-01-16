<!--
 * @Author: yut
 * @Date: 2023-10-26 10:56:10
 * @LastEditors: yut
 * @LastEditTime: 2024-01-09 21:13:13
 * @Descripttion: 
-->
<template>
  <view class="qm-card">
    <view class="qm-card-header">
      <text>{{ treeName }}</text>
    </view>
    <view class="qm-card-content">
      <view
        class="qm-card-progress"
        v-for="(item, index) in energyList"
        :key="'progress' + index"
        @click="goToDetail(treeId, item)"
      >
        <text>{{ item.energyName }}</text>
        <progress
          :percent="item.percentValue"
          :font-size="14"
          :activeColor="mapStatusColor(item.waringCode)"
          :show-info="false"
          stroke-width="12"
        />
        <text class="qm-progress-info">{{ item.percentValue === null ? '-' : item.percentValue + '%' }}</text>
        <view><icon-right /></view>
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { IconRight } from '@arco-iconbox/vue-tem';
import { mapStatusColor } from '../utils';
import type { QM_IEnergyType } from '../quota-management.api';
const props = defineProps<{
  treeId: number;
  treeName: string;
  energyList: QM_IEnergyType[];
}>();

const emit = defineEmits(['getDetailVal']);

const goToDetail = (treeId: number, item: QM_IEnergyType) => {
  emit('getDetailVal', treeId, item);
};
</script>
<style lang="scss" scoped>
.qm-card {
  height: auto;
  // min-height: 392rpx;
  padding: 24rpx 32rpx;
  box-sizing: border-box;
  background-color: var(--tem-color-white);
  border-radius: 16rpx;
  // 卡片头部
  &-header {
    height: 48rpx;
    gap: 24rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32rpx;

    > uni-text {
      font-size: var(--tem-font-size-b16);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  &-content {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }
  //卡片progress
  &-progress {
    height: 48rpx;
    // gap: 24rpx;
    display: flex;
    align-items: center;
    > text:nth-child(1) {
      width: 96rpx;
      margin-right: 24rpx;
      color: var(--tem-text-color-secondary);
      font-size: var(--tem-font-size-s12);
      text-align: right;
      flex: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .qm-progress-info {
      width: 134rpx;
      margin-left: 16rpx;
      margin-right: 24rpx;
      color: var(--tem-text-color-regular);
      font-size: var(--tem-font-size-b14);
      text-align: right;
      flex: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    > view {
      width: 48rpx;
      height: 48rpx;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--tem-text-color-secondary);
    }
    > .uni-progress {
      flex: auto;
    }

    :deep(.uni-progress-info) {
      font-size: var(--tem-font-size-s14);
    }
    :deep(.uni-progress-inner-bar) {
      border-radius: 24rpx;
    }
    :deep(.uni-progress-bar) {
      border-radius: 24rpx;
    }
  }
}
</style>
