<template>
  <view :class="['etd-tree-date', props.transparentFlag ? 'is-transparent' : '']">
    <!-- 节点 -->
    <view class="etd-info">
      <view class="etd-panel-tree-node" @click="handlePageToDetail('223')">
        <text class="etd-panel-tree-node-name">{{
          props?.topPanelForm?.treeName !== '' ? props?.topPanelForm?.treeName : '-'
        }}</text>
        <icon-down />
      </view>
      <view class="etd-panel-tree-parent">{{
        !!props.topPanelForm?.parentNames ? `（${props.topPanelForm?.parentNames}）` : ''
      }}</view>
    </view>
    <!-- 日期 -->
    <tem-dateTimePicker
      class="etd-panel-tree-picker"
      mode="date"
      :value="props?.topPanelForm?.date"
      fields="month"
      @change="handleDateChange"
      :end="getCurrentDateStr()"
    >
      <view class="etd-panel-tree-center">
        <view class="etd-panel-tree-center-label">{{ props?.topPanelForm?.date }}</view>
        <IconCalendar></IconCalendar>
      </view>
      <template #headerTitle>
        <text>选择日期</text>
      </template>
    </tem-dateTimePicker>
  </view>
</template>
<script lang="ts" setup>
// 公共库
import type { PropType } from 'vue';
// 接口
import type { Ec_ITopPanelForm } from '../energy-consumption.api';
import type { Common_IEvent } from '../../../api/model';
// 组件
import { IconDown, IconCalendar } from '@arco-iconbox/vue-tem';
import { TemDateTimePicker } from '@tiansu/ts-mobile-package';
// 工具方法
import { getCurrentDateStr } from '@/utils';

// props
const props = defineProps({
  // 表单
  topPanelForm: {
    type: Object as PropType<Ec_ITopPanelForm>,
  },
  // 动态样式
  transparentFlag: {
    type: Boolean,
    default: false,
  },
});
// emits
const emits = defineEmits(['date-change', 'openSearchPopup']);
/**
 * 跳转详情页面
 * @param {string} treeId
 * @returns {void}
 */
const handlePageToDetail = (treeId: string): void => {
  emits('openSearchPopup', treeId);
};
/**
 * 切换日期
 * @param {Common_IEvent<{value:string}>} event
 * @returns {void}
 */
const handleDateChange = (event: Common_IEvent<{ value: string }>): void => {
  emits('date-change', event.detail.value ?? '');
};
</script>
<style lang="scss" scoped>
.etd-tree-date {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24rpx 32rpx 16rpx;
  gap: 16rpx;
  color: var(--tem-text-color-primary);
  background-color: var(--tem-color-white);

  &.is-transparent {
    background-color: transparent;
    color: var(--tem-color-white);
  }

  svg {
    width: 32rpx;
    min-width: 32rpx;
    height: 32rpx;
    min-height: 32rpx;
  }

  .etd-info {
    display: flex;
    flex-direction: column;

    .etd-panel-tree-parent {
      color: rgb(144, 147, 153);
      font-size: 28rpx;
      line-height: 44rpx;
      margin-top: 16rpx;
    }

    .etd-panel-tree-node {
      font-weight: 600;
      font-size: 40rpx;
      line-height: 56rpx;
      white-space: wrap;

      .etd-panel-tree-node {
        flex: auto;
      }
    }
  }

  .etd-panel-tree-node,
  .etd-panel-tree-date {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .etd-panel-tree-center {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .etd-panel-tree-center-label {
      white-space: nowrap;
      font-size: 28rpx;
      line-height: 44rpx;
      position: relative;
      top: 2rpx;
    }
  }
}
</style>
