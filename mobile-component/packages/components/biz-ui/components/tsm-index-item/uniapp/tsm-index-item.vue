/** * IndexItem 索引列表项组件 * @description 索引列表项组件，用于显示列表项内容 */
<template>
  <view class="tsm-index-item" :class="bemClass" :style="customStyle">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IndexItemProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

/**
 * IndexItem 组件 Props
 * @property {string} index - 索引值
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<IndexItemProps>(), defaultProps);

const bemClass = computed(() => {
  return bem('index-item', [], [], props.customClass);
});
</script>

<style scoped lang="scss">
.tsm-index-item {
  width: 100%;
}
</style>
