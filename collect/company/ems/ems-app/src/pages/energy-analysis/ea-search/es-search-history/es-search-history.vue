<template>
  <view class="es-search-history">
    <text v-for="item in props.list" :key="item.keyName" @click="handleItemClick(item.keyName)">{{
      item.keyName
    }}</text>
  </view>
</template>
<script lang="ts" setup>
import type { PropType } from 'vue';
import type { Esh_IHistoryVO } from './es-search-history.api';

// props
const props = defineProps({
  list: {
    type: Array as PropType<Esh_IHistoryVO[]>,
    default: [],
  },
});
// emits
const emits = defineEmits(['triggerSearch']);
/**
 * 触发搜索
 * @param {string} value
 */
const handleItemClick = (value: string) => {
  emits('triggerSearch', { value });
};
</script>
<style lang="scss" scoped>
.es-search-history {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  text {
    display: inline-block;
    padding: 4rpx 16rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    line-height: 40rpx;
    background-color: var(--tem-fill-color);
    color: var(--tem-text-color-regular);
  }
}
</style>
