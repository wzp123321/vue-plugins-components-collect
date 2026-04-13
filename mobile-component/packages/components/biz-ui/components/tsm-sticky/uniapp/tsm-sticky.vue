/** * Sticky 吸顶组件 * @description 吸顶组件，用于元素吸顶显示 */
<template>
  <view class="tsm-sticky" :class="[customClass]" :style="stickyStyle">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { StickyProps } from './props';
import { defaultProps } from './props';
import { addStyle } from '../../../libs/uniapp/function/index';

/**
 * Sticky 组件 Props
 * @property {number} offsetTop - 吸顶距离
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<StickyProps>(), defaultProps);

const stickyStyle = computed(() => {
  return addStyle({
    position: 'sticky',
    top: `${props.offsetTop}px`,
    zIndex: 99,
    ...props.customStyle,
  });
});
</script>

<style scoped lang="scss">
.tsm-sticky {
  position: sticky;
  top: 0;
  z-index: 99;
}
</style>
