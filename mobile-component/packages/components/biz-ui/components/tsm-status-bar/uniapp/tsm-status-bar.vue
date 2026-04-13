/** * StatusBar 状态栏组件 * @description 状态栏组件，用于占位状态栏高度 */
<template>
  <view class="tsm-status-bar" :class="[customClass]" :style="statusBarStyle"></view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { StatusBarProps } from './props';
import { defaultProps } from './props';
import { addStyle } from '../../../libs/uniapp/function/index';

/**
 * StatusBar 组件 Props
 * @property {string} bgColor - 背景颜色
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<StatusBarProps>(), defaultProps);

const statusBarStyle = computed(() => {
  const systemInfo = uni.getSystemInfoSync();
  return addStyle({
    height: `${systemInfo.statusBarHeight}px`,
    backgroundColor: props.bgColor,
    ...props.customStyle,
  });
});
</script>

<style scoped lang="scss">
.tsm-status-bar {
  width: 100%;
}
</style>
