<!--
 * @Author: yut
 * @Date: 2023-12-06 15:18:19
 * @LastEditors: yut
 * @LastEditTime: 2023-12-08 14:27:51
 * @Descripttion: 
-->
<template>
  <view class="es-select-crumbs">
    <view
      v-for="(item, index) in props.list"
      :key="item.id"
      :class="['es-select-crumbs-item', mapHighLighter(index) ? 'es-select-crumbs-active' : '']"
    >
      <icon-home-fill v-if="index === 0" @click="handleItemClick(item, index)" />
      <text v-else @click="handleItemClick(item, index)">{{ item.treeName }}</text>
      <icon-right />
    </view>
  </view>
</template>
<script lang="ts" setup>
import type { PropType } from 'vue';
// 组件
import { IconRight, IconHomeFill } from '@arco-iconbox/vue-tem';
import type { Es_IBreadcrumb } from '../ea-search.api';
// props
const props = defineProps({
  list: {
    type: Array as PropType<Es_IBreadcrumb[]>,
    default: [''],
  },
});
console.log('%c🚀 ~ es-select-crumbs.vue ~ 26行', 'font-size: 18px', props.list);
/**
 * 高亮
 */
const mapHighLighter = (index: number) => {
  return index === 0 || index !== props.list.length - 1;
};

// emits
const emits = defineEmits(['select']);
/**
 * 选择节点
 * @param {Common_ITreeVO} item
 */
const handleItemClick = (item: Es_IBreadcrumb, index: number) => {
  // 没有数据
  if ((index === 0 && props.list.length === 0) || index === props.list.length - 1) {
    return;
  }
  emits('select', item);
};
</script>
<style lang="scss" scoped>
.es-select-crumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 24rpx 32rpx 16rpx;
  font-size: var(--tem-font-size-b14);
  gap: 16rpx 24rpx;
  border-bottom: 1rpx solid var(--tem-border-color-light);

  > svg {
    color: var(--tem-color-primary);
  }

  .es-select-crumbs-item {
    display: flex;
    align-items: center;
    gap: 24rpx;
    color: var(--tem-text-color-regular);
  }

  .es-select-crumbs-active {
    color: var(--tem-color-primary);
  }

  svg {
    width: 32rpx;
    height: 32rpx;
  }

  .temicon--icon.temicon--icon-right {
    width: 24rpx;
    height: 24rpx;
    color: var(--tem-text-color-placeholder);
  }
}
</style>
