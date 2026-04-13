/** * LoadingPage 加载页组件 * @description 加载页组件，用于显示全屏加载状态 */
<template>
  <view class="tsm-loading-page" :class="[customClass]" :style="loadingPageStyle">
    <tsm-loading-icon :mode="mode" :size="iconSize" :color="iconColor" />
    <text v-if="text" class="tsm-loading-page__text" :style="{ color: textColor }">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LoadingPageProps } from './props';
import { defaultProps } from './props';
import { addStyle } from '../../../libs/uniapp/function/index';

/**
 * LoadingPage 组件 Props
 * @property {string} mode - 加载图标类型 (circle | flower)
 * @property {number|string} iconSize - 图标大小
 * @property {string} iconColor - 图标颜色
 * @property {string} text - 加载文字
 * @property {string} textColor - 文字颜色
 * @property {string} bgColor - 背景颜色
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<LoadingPageProps>(), defaultProps);

const loadingPageStyle = computed(() => {
  return addStyle({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: props.bgColor,
    ...props.customStyle,
  });
});
</script>

<style scoped lang="scss">
.tsm-loading-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #ffffff;
}

.tsm-loading-page__text {
  margin-top: 12px;
  font-size: 14px;
  color: #909399;
}
</style>
